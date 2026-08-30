import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("motion/react", () => import("@/test/motionMock"));

import { PredictorBanner } from "./PredictorBanner";

describe("PredictorBanner", () => {
  it("suggests the next real milestone above the current GPA", () => {
    render(<PredictorBanner gpa={3.65} />);
    expect(screen.getByText("Could you reach a 3.70?")).toBeInTheDocument();
  });

  it("links to the predictor with the suggested target in the query string", () => {
    render(<PredictorBanner gpa={3.65} />);
    const link = screen.getByRole("link", { name: /open gpa predictor/i });
    expect(link).toHaveAttribute("href", "/gpa-predictor/?target=3.70");
  });

  it("lets the student override the target, updating the heading and the predictor link", async () => {
    const user = userEvent.setup();
    render(<PredictorBanner gpa={3.65} />);

    await user.click(screen.getByRole("button", { name: /change target gpa/i }));
    const input = screen.getByLabelText("Target GPA");
    await user.clear(input);
    await user.type(input, "3.9");
    await user.tab();

    expect(screen.getByText("Could you reach a 3.90?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open gpa predictor/i })).toHaveAttribute(
      "href",
      "/gpa-predictor/?target=3.90"
    );
  });

  it("shows an already-reached message once the GPA meets the target", () => {
    render(<PredictorBanner gpa={4.0} />);
    expect(screen.getByText(/you've already reached this target/i)).toBeInTheDocument();
  });

  it("ignores an out-of-range override and keeps the previous target", async () => {
    const user = userEvent.setup();
    render(<PredictorBanner gpa={3.65} />);

    await user.click(screen.getByRole("button", { name: /change target gpa/i }));
    const input = screen.getByLabelText("Target GPA");
    await user.clear(input);
    await user.type(input, "9.9");
    await user.tab();

    expect(screen.getByText("Could you reach a 3.70?")).toBeInTheDocument();
  });
});
