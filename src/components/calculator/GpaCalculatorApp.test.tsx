import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("motion/react", () => import("@/test/motionMock"));

import { GpaCalculatorApp } from "./GpaCalculatorApp";

// Force the reduced-motion code paths so displayed numbers update
// synchronously instead of tweening over real time via requestAnimationFrame.
beforeAll(() => {
  window.matchMedia = ((query: string) =>
    ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
});

describe("GpaCalculatorApp interactions", () => {
  it("starts at the reference GPA for the default four courses", async () => {
    render(<GpaCalculatorApp />);
    await waitFor(() => expect(screen.getByText("3.65")).toBeInTheDocument());
  });

  it("recalculates GPA live when a course is added, then again when it is removed", async () => {
    const user = userEvent.setup();
    render(<GpaCalculatorApp />);

    await waitFor(() => expect(screen.getByText("3.65")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /add another course/i }));

    const newCreditsField = screen.getByLabelText("Credits for Course 5");
    await user.clear(newCreditsField);
    await user.type(newCreditsField, "3");

    const newGradeField = screen.getByLabelText("Grade for Course 5") as HTMLSelectElement;
    await user.selectOptions(newGradeField, "A");

    // 51.1 + (4.0 * 3) = 63.1 quality points over 14 + 3 = 17 credits => 3.71
    await waitFor(() => expect(screen.getByText("3.71")).toBeInTheDocument());

    const removeButton = screen.getByRole("button", { name: /remove course 5/i });
    await user.click(removeButton);

    await waitFor(() => expect(screen.getByText("3.65")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /remove course 5/i })).not.toBeInTheDocument();
  });

  it("shows a validation error for negative credits and excludes the row from the total", async () => {
    const user = userEvent.setup();
    render(<GpaCalculatorApp />);

    const calculusCredits = screen.getByLabelText(/credits for calculus i/i);
    await user.clear(calculusCredits);
    await user.type(calculusCredits, "-2");
    await user.tab();

    expect(await screen.findByText(/credits can't be negative/i)).toBeInTheDocument();

    // Calculus I's 14.8 quality points and 4 credits drop out of the total:
    // (51.1 - 14.8) / (14 - 4) = 3.63
    await waitFor(() => expect(screen.getByText("3.63")).toBeInTheDocument());
  });
});

describe("GpaCalculatorApp accessibility", () => {
  it("exposes a polite live region that announces GPA updates", () => {
    render(<GpaCalculatorApp />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("labels every remove-course button descriptively", () => {
    render(<GpaCalculatorApp />);
    expect(within(document.body).getByRole("button", { name: /remove calculus i/i })).toBeInTheDocument();
  });
});
