import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import {
  getChartTheme,
  QualifyingVsFinishChart,
} from "../src/features/analytics/components/AnalyticsCharts";
vi.mock("../src/features/analytics/components/EChart", () => ({
  default: ({ option }) => (
    <output data-testid="options">{JSON.stringify(option)}</output>
  ),
}));
afterEach(cleanup);
test("chart tooltips are confined and axis names sit in the middle rather than clipped at inverse-axis ends", () => {
  expect(getChartTheme().tooltip.confine).toBe(true);
  render(
    <QualifyingVsFinishChart
      rows={[
        {
          driverName: "Fixture",
          eventName: "Fixture race",
          qualifyingPosition: 2,
          finishPosition: 1,
        },
      ]}
    />,
  );
  const options = JSON.parse(screen.getByTestId("options").textContent);
  for (const axis of [options.xAxis, options.yAxis]) {
    expect(axis.nameLocation).toBe("middle");
    expect(axis.nameTextStyle.color).toBe(getChartTheme().colors.muted);
    expect(axis.nameGap).toBeGreaterThan(0);
  }
});
test("after the full-width primary chart an unpaired final analysis spans the remaining row", () => {
  const css =
    readFileSync("src/styles/analytics.css", "utf8") +
    readFileSync("src/design-system/ui-consistency.css", "utf8");
  const style = document.createElement("style");
  style.textContent = css;
  const { container } = render(
    <div className="analytics-chart-grid">
      <section className="panel analytics-primary-chart" />
      <section className="panel" />
      <section className="panel" />
      <section className="panel" />
    </div>,
  );
  container.append(style);
  expect(
    getComputedStyle(container.querySelector(".panel:last-child")).gridColumn,
  ).toBe("1 / -1");
});
