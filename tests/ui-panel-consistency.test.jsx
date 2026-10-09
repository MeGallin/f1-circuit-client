import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import {
  ActionLink,
  Panel,
  PanelBody,
  PageHeading,
  StatusBadge,
} from "../src/components/ui";
afterEach(cleanup);
test.each([false, true])(
  "mobile Calendar grid survives lazy stylesheet order %s",
  (reversed) => {
    const mobile = readFileSync("src/design-system/ui-consistency.css", "utf8")
      .split("@media (max-width: 767px) {")[1]
      .replace(/}\s*$/, "");
    const calendar = readFileSync("src/styles/calendar.css", "utf8");
    const { container } = render(
      <div className="calendar-filter">
        <div className="calendar-filter-options">
          <button className="calendar-filter-option">All rounds</button>
          <button className="calendar-filter-option">Completed</button>
          <button className="calendar-filter-option">Upcoming</button>
        </div>
      </div>,
    );
    const style = document.createElement("style");
    style.textContent = (
      reversed ? [calendar, mobile] : [mobile, calendar]
    ).join("\n");
    container.append(style);
    expect(
      getComputedStyle(container.querySelector(".calendar-filter-options"))
        .display,
    ).toBe("grid");
    expect(
      getComputedStyle(container.querySelector("button:last-child")).gridColumn,
    ).toBe("1 / -1");
  },
);
test("mobile Calendar status controls reflow as real buttons instead of an avoidably clipped scrolling strip", () => {
  const css = readFileSync("src/design-system/ui-consistency.css", "utf8");
  expect(css).toMatch(
    /\.calendar-filter-options\s*\{[^}]*display:\s*grid[^}]*minmax\(min\(100%,\s*var\(--apex-layout-field-min-width\)\),\s*1fr\)/s,
  );
  expect(readFileSync("src/styles/calendar.css", "utf8")).not.toMatch(
    /\.calendar-filter-options\s*\{[^}]*flex-wrap:\s*nowrap/,
  );
});
test("nested Analytics headings use a readable subsection role rather than a larger-than-panel title", () => {
  const style = document.createElement("style");
  style.textContent =
    readFileSync("src/design-system/ui-consistency.css", "utf8") +
    readFileSync("src/styles/analytics.css", "utf8");
  const { container } = render(
    <div className="analytics-page">
      <div className="analytics-championship-heading">
        <h3>Constructor standings</h3>
      </div>
    </div>,
  );
  container.append(style);
  expect(getComputedStyle(container.querySelector("h3")).fontSize).toBe(
    "var(--apex-type-prose-size)",
  );
  expect(getComputedStyle(container.querySelector("h3")).lineHeight).toBe(
    "var(--apex-type-control-line)",
  );
});
test("mobile Standings gives season selection a full row and navigation label width is not spent on redundant inset", () => {
  const css = readFileSync("src/design-system/standings-context.css", "utf8");
  expect(css).toMatch(
    /\.standing-toolbar \.field:first-child\s*\{[^}]*grid-column:\s*1 \/ -1/,
  );
  const reflow = readFileSync("src/design-system/reflow.css", "utf8");
  expect(reflow).toMatch(
    /\.mobile-nav\s*>\s*a,[^}]*padding-inline:\s*var\(--apex-space-1\)/,
  );
});
test("padded panel bodies retain intrinsic status-badge width rather than stretching a healthy indicator", () => {
  const { container } = render(
    <PanelBody>
      <StatusBadge>healthy</StatusBadge>
    </PanelBody>,
  );
  const style = document.createElement("style");
  style.textContent = readFileSync(
    "src/design-system/ui-consistency.css",
    "utf8",
  );
  container.append(style);
  expect(getComputedStyle(container.querySelector(".status")).justifySelf).toBe(
    "start",
  );
});
test("shared panel groups eyebrow above title and owns a separate next-line action region", () => {
  const { container } = render(
    <MemoryRouter>
      <Panel
        title="Track performance"
        eyebrow="TRACK PATTERNS"
        action={<ActionLink to="/calendar">Calendar</ActionLink>}
      >
        <p>Fixture</p>
      </Panel>
    </MemoryRouter>,
  );
  const heading = container.querySelector(".panel-heading");
  const title = heading.querySelector("h2");
  expect(title.previousElementSibling).toHaveClass("panel-eyebrow");
  expect(heading.querySelector(".panel-actions > .button")).not.toBeNull();
});
test("PageHeading and Panel use shared stacked actions and padded body Apex contracts", () => {
  const { container } = render(
    <MemoryRouter>
      <PageHeading
        title="Fixture"
        actions={<ActionLink to="/explore">Explore</ActionLink>}
      />
    </MemoryRouter>,
  );
  expect(container.querySelector(".page-actions > .button")).not.toBeNull();
  const css = readFileSync("src/design-system/ui-consistency.css", "utf8");
  expect(css).toMatch(
    /\.page-heading,[\s\S]*\.panel-heading\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)/,
  );
  expect(css).toMatch(/\.panel-body\s*\{[^}]*padding: var\(--apex-space-6\)/);
});
