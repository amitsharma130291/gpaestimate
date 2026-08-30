import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FaqAccordion } from "./FaqAccordion";

const ITEMS = [
  { question: "First question?", answer: "First answer text." },
  { question: "Second question?", answer: "Second answer text." },
];

describe("FaqAccordion", () => {
  it("renders every answer in the DOM up front, for crawlability", () => {
    render(<FaqAccordion items={ITEMS} />);
    expect(screen.getByText("First answer text.")).toBeInTheDocument();
    expect(screen.getByText("Second answer text.")).toBeInTheDocument();
  });

  it("opens the first item by default with aria-expanded wired correctly", () => {
    render(<FaqAccordion items={ITEMS} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles a question open and closed on click, keeping aria-controls linked", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={ITEMS} />);
    const secondButton = screen.getByRole("button", { name: /second question/i });

    expect(secondButton).toHaveAttribute("aria-expanded", "false");
    await user.click(secondButton);
    expect(secondButton).toHaveAttribute("aria-expanded", "true");

    const panelId = secondButton.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId as string)).toHaveAttribute(
      "aria-labelledby",
      secondButton.id
    );

    await user.click(secondButton);
    expect(secondButton).toHaveAttribute("aria-expanded", "false");
  });

  it("is keyboard operable", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={ITEMS} />);
    const firstButton = screen.getAllByRole("button")[0];

    firstButton.focus();
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Enter}");
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
  });
});
