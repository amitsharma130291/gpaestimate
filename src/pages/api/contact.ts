import type { APIContext } from "astro";
import nodemailer from "nodemailer";
import { z } from "zod";

// Runs as a Vercel serverless function — every other route in this site
// stays static/prerendered.
export const prerender = false;

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().min(1, "Enter your email.").pipe(z.email("Enter a valid email address.")),
  subject: z.string().trim().min(1, "Enter a subject.").max(200),
  message: z.string().trim().min(1, "Enter a message.").max(5000),
  // Honeypot — real users never see or fill this field.
  company: z.string().optional(),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD environment variables are not set.");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST({ request, redirect }: APIContext): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;

  let raw: Record<string, unknown>;
  try {
    if (contentType.includes("application/json")) {
      raw = await request.json();
    } else {
      const form = await request.formData();
      raw = Object.fromEntries(form.entries());
    }
  } catch {
    return wantsJson
      ? jsonResponse({ error: "Could not read your submission." }, 400)
      : redirect("/contact?error=invalid", 303);
  }

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Please check your submission and try again.";
    return wantsJson
      ? jsonResponse({ error: message }, 400)
      : redirect(`/contact?error=${encodeURIComponent(message)}`, 303);
  }

  const data = parsed.data;

  // Honeypot tripped — pretend success so bots don't learn anything, but
  // never actually send mail.
  if (data.company) {
    return wantsJson ? jsonResponse({ ok: true }, 200) : redirect("/contact?sent=1", 303);
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"GPA Estimate Contact Form" <${process.env.GMAIL_USER}>`,
      to: "amitsharma00261@gmail.com",
      replyTo: data.email,
      subject: `[GPA Estimate Contact] ${data.subject}`,
      text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</p><p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>`,
    });
  } catch (err) {
    console.error("Contact form email failed to send:", err);
    return wantsJson
      ? jsonResponse({ error: "Could not send your message right now. Please try again later." }, 502)
      : redirect("/contact?error=send-failed", 303);
  }

  return wantsJson ? jsonResponse({ ok: true }, 200) : redirect("/contact?sent=1", 303);
}
