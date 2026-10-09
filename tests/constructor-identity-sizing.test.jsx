import { readFileSync } from "node:fs";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { ConstructorIdentity } from "../src/components/ConstructorIdentity";
afterEach(cleanup);
const rootTokens = readFileSync("src/design-system/apex.tokens.css", "utf8");
const definitions = new Map(
  [...rootTokens.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((match) => [
    match[1],
    match[2],
  ]),
);
function resolve(value) {
  return value
    .replace(/var\((--[\w-]+)\)/g, (expression, key) =>
      definitions.has(key) ? resolve(definitions.get(key)) : expression,
    )
    .replace(/([\d.]+)rem/g, (_, amount) => `${Number(amount) * 16}px`);
}
function fixture(presentation, viewport) {
  const { container } = render(
    <div className="home-championship">
      <ConstructorIdentity
        constructor={{ id: "constructor:mercedes", displayName: "Mercedes" }}
        year={2026}
        presentation={presentation}
      />
    </div>,
  );
  const parser = document.createElement("style");
  parser.textContent = [
    "constructor-identity",
    "constructor-media",
    "home-fidelity",
  ]
    .map((name) => readFileSync(`src/design-system/${name}.css`, "utf8"))
    .join("\n");
  document.head.append(parser);
  const flatten = (rules) =>
    [...rules]
      .flatMap((rule) =>
        rule.conditionText
          ? (rule.conditionText.match(/min-width:\s*(\d+)px/)?.[1] ?? 0) <=
              viewport &&
            (rule.conditionText.match(/max-width:\s*(\d+)px/)?.[1] ??
              Infinity) >= viewport
            ? flatten(rule.cssRules)
            : []
          : [rule.cssText],
      )
      .join("\n");
  const css = resolve(flatten(parser.sheet.cssRules));
  parser.remove();
  const style = document.createElement("style");
  style.textContent = css;
  container.append(style);
  return container;
}
test.each(
  ["compact", "championship"].flatMap((variant) =>
    [390, 1440].map((viewport) => [variant, viewport]),
  ),
)(
  "%s at %s uses shared14px text and responsive16/20px logos",
  (variant, viewport) => {
    const container = fixture(variant, viewport);
    const identity = container.querySelector(".constructor-identity");
    const computed = getComputedStyle(identity);
    expect(computed.fontSize).toBe("14px");
    expect(computed.getPropertyValue("--constructor-logo-size").trim()).toBe(
      viewport < 900 ? "16px" : "20px",
    );
    expect(computed.gap).toBe("8px");
    expect(computed.fontWeight).toBe("400");
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  },
);
test("explicit heading variant is not resized to compact presentation", () => {
  const container = fixture("heading", 1440);
  expect(
    getComputedStyle(container.querySelector(".constructor-identity")).fontSize,
  ).toBe("18px");
});

test.each(["compact", "championship"])(
  "%s permits a whole manufacturer word to reflow in a 74.26px slot",
  (variant) => {
    const container = fixture(variant, 320);
    container.style.width = "74.26px";
    const identity = container.querySelector(".constructor-identity");
    const name = container.querySelector(".constructor-identity-name");
    expect(name).toHaveTextContent("Mercedes");
    expect(getComputedStyle(identity).flexWrap).toBe("wrap");
    expect(getComputedStyle(name).overflowWrap).toBe("break-word");
    expect(getComputedStyle(name).maxWidth).toBe("100%");
  },
);
