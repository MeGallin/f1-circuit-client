import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { expect, test } from "vitest";

const tokens = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "src/design-system/apex.tokens.json"),
    "utf8",
  ),
);
const baseStyles = readFileSync(
  resolve(process.cwd(), "src/styles/base.css"),
  "utf8",
);
test("shared chrome and dialog limits have named finite design-source ownership", () => {
  expect(tokens.uiConsistency).toMatchObject({
    mobileThemeMaxWidth: "125px",
    dialogMaxHeight: "48rem",
    menuMaxHeight: "18rem",
  });
  const css = readFileSync("src/styles/components.css", "utf8");
  expect(css).not.toMatch(/max-width:\s*125px|letter-spacing:\s*0\.08em/);
  expect(css).toContain("var(--apex-size-ui-mobile-theme-max-width)");
});
test("ordinary production surfaces share border, weight and kicker tokens instead of duplicated literals", () => {
  for (const file of [
    "components",
    "calendar",
    "entities",
    "event-dialog",
    "evidence",
    "questions",
    "race",
    "standings",
    "analytics",
    "overview",
  ]) {
    const css = readFileSync(`src/styles/${file}.css`, "utf8");
    expect(css, file).not.toMatch(
      /(?:border(?:-[a-z]+)?):\s*1px\b|font-weight:\s*(?:400|700)\b|letter-spacing:\s*0\.08em/,
    );
  }
});

test("review: audit presentation limits belong to keyed Apex design source", () => {
  expect(tokens.auditLayout).toMatchObject({
    analyticsFilterMinWidth: "12rem",
    overviewTrackCompact: "8rem",
    tableIdentityViewportLimit: "40vw",
    overviewDesktopMinWidth: 900,
  });
});

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
  const defined = new Set(source.match(/--apex-[a-z0-9-]+(?=\s*:)/g) || []);
  const referenced = new Set(source.match(/--apex-[a-z0-9-]+/g) || []);
  const missing = [...referenced].filter((token) => !defined.has(token));

  expect(missing).toEqual([]);
});
