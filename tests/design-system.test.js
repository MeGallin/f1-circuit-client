import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { resolve, join } from "node:path";
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

test("every Apex token referenced by the client is defined", () => {
  const styleRoot = resolve(process.cwd(), "src");
  const styleFiles = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.name.endsWith(".css")) styleFiles.push(path);
    }
  };
  visit(styleRoot);

  const source = styleFiles
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  const defined = new Set(
    source.match(/--apex-[a-z0-9-]+(?=\s*:)/g) || [],
  );
  const referenced = new Set(source.match(/--apex-[a-z0-9-]+/g) || []);
  const missing = [...referenced].filter((token) => !defined.has(token));

  expect(missing).toEqual([]);
});
