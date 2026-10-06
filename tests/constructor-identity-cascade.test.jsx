import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ConstructorIdentity } from "../src/components/ConstructorIdentity";

const styles = [
  "design-system/constructor-identity.css",
  "styles/overview.css",
  "styles/event-dialog.css",
  "styles/calendar.css",
  "styles/analytics.css",
  "styles/standings.css",
  "styles/entities.css",
]
  .map((file) => readFileSync(resolve("src", file), "utf8"))
  .join("\n");
let stylesheet;
beforeEach(() => {
  stylesheet = document.createElement("style");
  // Reproduce lazy/route CSS arriving after the shared component stylesheet.
  stylesheet.textContent = styles;
  document.head.append(stylesheet);
});
afterEach(() => {
  cleanup();
  stylesheet.remove();
});
const identity = (
  <ConstructorIdentity
    constructor={{ id: "constructor:mercedes", displayName: "Mercedes" }}
    year={2026}
  />
);
test("shared podium identity rule outranks the legacy descendant span display rule", () => {
  // jsdom does not reproduce Chromium's specificity resolution for this conflict.
  // Require the scoped rule as well as exercising all surface DOM/CSS fixtures.
  const rule = [...stylesheet.sheet.cssRules].find((rule) =>
    rule.selectorText
      ?.split(",")
      .some(
        (selector) =>
          selector.trim() === ".race-podium-driver-copy .constructor-identity",
      ),
  );
  expect(rule?.style.display).toBe("inline-flex");
  const compactRule = [...stylesheet.sheet.cssRules].find(
    (rule) =>
      rule.selectorText === ".race-podium-driver-copy .constructor-identity",
  );
  expect(compactRule?.style.getPropertyValue("--constructor-logo-size")).toBe(
    "var(--apex-size-icon-small)",
  );
  expect(compactRule?.style.gap).toBe("var(--apex-space-1)");
});
test.each([
  [
    "overview podium",
    <div className="race-podium-driver">
      <div className="race-podium-driver-copy">
        <strong>Driver</strong>
        <span>{identity}</span>
      </div>
    </div>,
  ],
  [
    "overview constructor leaders",
    <ol className="leader-list leader-list--constructors">
      <li>
        <div>
          <div className="leader-driver-line">
            <strong>{identity}</strong>
          </div>
        </div>
      </li>
    </ol>,
  ],
  [
    "overview driver affiliation",
    <ol className="leader-list">
      <li>
        <div>
          <p>{identity}</p>
        </div>
      </li>
    </ol>,
  ],
  [
    "event dialog podium",
    <ol className="event-dialog-podium">
      <li>
        <div>
          <span>{identity}</span>
        </div>
      </li>
    </ol>,
  ],
  [
    "calendar podium",
    <ol className="calendar-podium">
      <li>
        <small>{identity}</small>
      </li>
    </ol>,
  ],
  [
    "constructor profile",
    <div className="entity-identity">
      <div>
        <strong>{identity}</strong>
      </div>
    </div>,
  ],
  [
    "standings",
    <div className="standing-name">
      <strong>
        <a href="#constructor">{identity}</a>
      </strong>
    </div>,
  ],
  [
    "explore card",
    <div className="explore-result-copy">
      <a href="#constructor">{identity}</a>
    </div>,
  ],
  [
    "analytics overview",
    <div className="analytics-overview-metric">
      <div>
        <strong>{identity}</strong>
      </div>
    </div>,
  ],
  [
    "analytics intelligence",
    <div className="analytics-intelligence-metric-copy">
      <strong>{identity}</strong>
    </div>,
  ],
  [
    "analytics podium",
    <li className="analytics-podium-entry">
      <div>
        <span>{identity}</span>
      </div>
    </li>,
  ],
  [
    "analytics spotlight",
    <div className="analytics-snapshot-heading">
      <div>
        <p className="muted">{identity}</p>
      </div>
    </div>,
  ],
  [
    "analytics constructor standings",
    <span className="analytics-championship-copy">
      <strong>{identity}</strong>
    </span>,
  ],
  [
    "analytics recent results",
    <div className="analytics-recent-result-driver">
      <small>{identity}</small>
    </div>,
  ],
])(
  "%s preserves side-by-side identity despite late surface span rules",
  (_surface, element) => {
    const { container } = render(element);
    expect(
      getComputedStyle(container.querySelector(".constructor-identity"))
        .display,
    ).toBe("inline-flex");
    expect(
      getComputedStyle(container.querySelector(".constructor-logo")).display,
    ).toBe("inline-flex");
    expect(
      getComputedStyle(container.querySelector(".constructor-identity-name"))
        .whiteSpace,
    ).toBe("normal");
  },
);
