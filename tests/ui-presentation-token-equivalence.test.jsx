import { readFileSync } from "node:fs";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

afterEach(cleanup);
test.each([
  [".analytics-weekend-card", "10.5rem", false],
  [".analytics-intelligence-metric", "5.75rem", true],
  [".analytics-stat", "6rem", true],
])(
  "remaining card minimum %s retains %s through owned token",
  (selector, expected, mobile) => {
    const source = mobile
      ? styles.analytics.split("@media (max-width: 520px) {")[1]
      : styles.analytics;
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const declaration = source.match(
      new RegExp(`${escaped}\\s*\\{[^}]*min-height:\\s*([^;]+);`),
    )?.[1];
    expect(declaration).toMatch(/^var\(--apex-/);
    expect(resolve(declaration)).toBe(expected);
    const { container } = render(<div />);
    container.firstChild.style.minHeight = resolve(declaration);
    expect(getComputedStyle(container.firstChild).minHeight).toBe(expected);
  },
);
const styles = Object.fromEntries(
  ["analytics", "components", "entities"].map((name) => [
    name,
    readFileSync(`src/styles/${name}.css`, "utf8"),
  ]),
);
const definitions = ["apex.tokens", "audit-layout.tokens"]
  .map((name) => readFileSync(`src/design-system/${name}.css`, "utf8"))
  .join("\n");
const values = new Map(
  [...definitions.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((match) => [
    match[1],
    match[2],
  ]),
);
const resolve = (value) =>
  value.replace(
    /var\((--[\w-]+)\)/g,
    (_, key) => values.get(key) ?? `UNRESOLVED:${key}`,
  );

// Independent pre-change values retain their units: rem changes with root type,
// em tracks the consumer's font, px remains a fixed physical CSS control limit.
test.each([
  ["analytics", ".analytics-stat", "min-height", "7rem"],
  ["analytics", ".analytics-intelligence-metric", "min-height", "7.5rem"],
  ["analytics", ".analytics-intelligence-metric-icon", "width", "2.5rem"],
  ["analytics", ".analytics-podium-entry", "min-height", "3rem"],
  [
    "analytics",
    ".analytics-podium-entry",
    "border-left",
    "3px solid var(--apex-color-line)",
  ],
  ["analytics", ".analytics-weekend-card-marker", "width", "2rem"],
  ["analytics", ".analytics-race-context--empty", "min-height", "15rem"],
  [
    "analytics",
    ".analytics-championship-row",
    "border-left",
    "2px solid var(--apex-color-line)",
  ],
  ["analytics", ".analytics-comparison-actions .button", "min-height", "40px"],
  ["components", ".race-status", "gap", "0.35em"],
])(
  "%s %s %s has token ownership with unchanged resolved value",
  (sheet, selector, property, expected) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const block = styles[sheet].match(
      new RegExp(`${escaped}\\s*\\{([^}]+)\\}`),
    )?.[1];
    const declaration = block?.match(
      new RegExp(`(?:^|;)\\s*${property}:\\s*([^;]+);`),
    )?.[1];
    expect(declaration).toMatch(/^var\(--apex-/);
    const resolved = resolve(declaration);
    // Color remains independently theme-owned; compare the dimension/shape only.
    expect(resolved.split(" solid")[0]).toBe(expected.split(" solid")[0]);
    const { container } = render(<div data-testid="dimension-fixture" />);
    const element = container.firstChild;
    element.style.setProperty(property, resolved.split(" solid")[0]);
    if (!property.startsWith("border"))
      expect(getComputedStyle(element).getPropertyValue(property)).toBe(
        expected,
      );
  },
);

test("active typography uses owned tracking/gap values rather than repeated literals", () => {
  for (const name of ["analytics", "components", "entities"])
    expect(styles[name]).not.toMatch(
      /letter-spacing:\s*0?\.(?:06|12|04)em|gap:\s*0?\.35em/,
    );
});
