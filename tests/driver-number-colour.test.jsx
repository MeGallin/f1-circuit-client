import { readFileSync } from "node:fs";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { DriverNumber } from "../src/components/ui";
import { DriverIdentity } from "../src/components/DriverIdentity";

afterEach(cleanup);
const components = readFileSync("src/styles/components.css", "utf8");
const identity = readFileSync("src/design-system/driver-identity.css", "utf8");
const overview = readFileSync("src/styles/overview.css", "utf8");
const tokens = JSON.parse(
  readFileSync("src/design-system/apex.tokens.json", "utf8"),
);

test.each(["dark", "light"])(
  "all badge numeral contexts match podium neutral text in %s",
  (theme) => {
    // Resolve only theme colour variables for jsdom; selector specificity and
    // inheritance still come from the actual production styles, not test CSS.
    const palette = { ...tokens.themes[theme], ...tokens.brands.red[theme] };
    const css = [
      identity,
      readFileSync("src/design-system/ui-consistency.css", "utf8"),
      components,
      overview,
    ]
      .join("\n")
      .replace(/var\(--apex-color-([\w-]+)\)/g, (expression, key) => {
        const name = key.replace(/-([a-z])/g, (_, letter) =>
          letter.toUpperCase(),
        );
        return palette[name] ?? expression;
      });
    const { container } = render(
      <>
        <DriverNumber number={18} />
        <div className="home-race-result">
          <div className="race-podium-driver">
            <DriverIdentity name="Published driver" number={3} />
          </div>
          <span className="race-podium-position">1</span>
        </div>
        <div className="home-championship">
          <DriverIdentity name="Published leader" number={12} />
        </div>
      </>,
    );
    const style = document.createElement("style");
    style.textContent = css;
    container.append(style);
    const expected = getComputedStyle(
      container.querySelector(".race-podium-position"),
    ).color;
    for (const badge of container.querySelectorAll(".driver-number")) {
      expect(getComputedStyle(badge).color).toBe(expected);
      expect(
        getComputedStyle(badge.querySelector('[aria-hidden="true"]')).color,
      ).toBe(expected);
    }
    // jsdom does not resolve the dimension variable in the shared border
    // shorthand. Assert its unchanged owner directly; browser QA measures RGB.
    expect(identity).toMatch(
      /\.driver-identity \.driver-number\s*\{[^}]*border-color:\s*var\(--apex-color-accent-border\)/,
    );
  },
);
