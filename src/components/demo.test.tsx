import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, it, expect, vi } from "vitest";
import { DemoProvider } from "./demo-context";
import { Overview } from "./overview";
import { Analysis } from "./analysis";
import { ClaudePreview } from "./claude-preview";
vi.mock("./curve-chart", () => ({
  CurveChart: () => <div>Accessible chart summary</div>,
}));
vi.mock("./price-chart", () => ({ PriceChart: () => <div>Price chart</div> }));
afterEach(cleanup);
describe("public interactive demo", () => {
  it("changes the sample and never presents an execute-backtest action", async () => {
    const user = userEvent.setup();
    render(
      <DemoProvider>
        <Overview />
      </DemoProvider>,
    );
    await user.selectOptions(screen.getByLabelText("Strategy sample"), "range");
    expect(screen.getByText("ETH / USD")).toBeVisible();
    expect(screen.getByText("Synthetic demonstration data")).toBeVisible();
    expect(screen.queryByRole("button", { name: /run backtest/i })).toBeNull();
  });
  it("filters trade results and exposes selected costs for inspection", async () => {
    const user = userEvent.setup();
    render(
      <DemoProvider>
        <Analysis />
      </DemoProvider>,
    );
    await user.selectOptions(screen.getByLabelText("Result"), "loss");
    const buttons = screen.getAllByRole("button", { name: /Inspect trade/ });
    expect(buttons.length).toBeGreaterThan(0);
    await user.click(buttons[0]);
    expect(
      screen.getByRole("region", { name: "Selected trade details" }),
    ).toBeVisible();
    expect(screen.getByText("Net trade return")).toBeVisible();
  });
  it("clearly labels Claude as planned and questions as illustrative", async () => {
    const user = userEvent.setup();
    render(
      <DemoProvider>
        <ClaudePreview />
      </DemoProvider>,
    );
    expect(screen.getByText("Claude API · Planned integration")).toBeVisible();
    expect(
      screen.getByText(
        /All reports and answers below are illustrative templates/,
      ),
    ).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Costs" }));
    expect(
      screen.getByRole("heading", {
        name: "How much do costs change the result?",
      }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("checkbox", {
        name: "Define an untouched evaluation window",
      }),
    );
    expect(screen.getByText("1/3 noted")).toBeVisible();
  });
});
