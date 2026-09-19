import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const tokens = JSON.parse(
  readFileSync(resolve(process.cwd(), "src/design-system/apex.tokens.json"), "utf8"),
);
const baseStyles = readFileSync(
  resolve(process.cwd(), "src/styles/base.css"),
  "utf8",
);

test("design tokens cover the shared visual and motion contracts", () => {
  expect(tokens.spacing).toBeDefined();
  expect(tokens.typography).toBeDefined();
  expect(tokens.motion).toBeDefined();
  expect(tokens.shape.focusWidth).toBeGreaterThan(0);
  expect(tokens.shape.focusOffset).toBeGreaterThan(0);
  expect(baseStyles).toContain(":focus-visible");
  expect(baseStyles).toContain("prefers-reduced-motion");
});
