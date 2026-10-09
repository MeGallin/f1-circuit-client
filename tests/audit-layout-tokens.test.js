import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { expect, test } from "vitest";

const files = [
  "analytics-density",
  "race-mobile",
  "reflow",
  "standings-context",
  "table",
  "ui-consistency",
  "overview-focus",
  "driver-identity",
  "constructor-identity",
];
function fixture(run) {
  const directory = mkdtempSync(join(tmpdir(), "f1-audit-layout-"));
  if (
    dirname(resolve(directory)) !== resolve(tmpdir()) ||
    !basename(directory).startsWith("f1-audit-layout-")
  )
    throw new Error("Unsafe fixture cleanup");
  try {
    mkdirSync(join(directory, "scripts"));
    mkdirSync(join(directory, "src/design-system"), { recursive: true });
    copyFileSync(
      "scripts/generate-audit-layout-tokens.js",
      join(directory, "scripts/generate-audit-layout-tokens.js"),
    );
    for (const file of files)
      copyFileSync(
        `src/design-system/${file}.css`,
        join(directory, `src/design-system/${file}.css`),
      );
    writeFileSync(join(directory, "package.json"), '{"type":"module"}');
    run(
      directory,
      JSON.parse(readFileSync("src/design-system/apex.tokens.json", "utf8")),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
const generate = (directory) =>
  spawnSync(process.execPath, ["scripts/generate-audit-layout-tokens.js"], {
    cwd: directory,
    encoding: "utf8",
  });
const save = (directory, tokens) =>
  writeFileSync(
    join(directory, "src/design-system/apex.tokens.json"),
    JSON.stringify(tokens),
  );

test.each([0, -0.1, Infinity, null, "84"])(
  "mini-chart height %s is positive finite and numeric before any writes",
  (value) =>
    fixture((directory, tokens) => {
      tokens.chart.homeMiniPlot.height = value;
      const style = join(directory, "src/design-system/table.css");
      const before = readFileSync(style, "utf8");
      save(directory, tokens);
      expect(generate(directory).status).not.toBe(0);
      expect(readFileSync(style, "utf8")).toBe(before);
    }),
);

test.each([
  "missing-layout",
  "zero-length",
  "invalid-icon",
  "invalid-breakpoint",
  "infinite-length",
  "invalid-ui-limit",
  "invalid-ui-tracking",
  "infinite-ui-gap",
])("audit generator rejects %s without modifying output/styles", (failure) => {
  fixture((directory, tokens) => {
    const style = join(directory, "src/design-system/table.css");
    const before = readFileSync(style, "utf8");
    const output = join(directory, "src/design-system/audit-layout.tokens.css");
    writeFileSync(output, "unchanged");
    if (failure === "missing-layout") delete tokens.auditLayout;
    if (failure === "zero-length")
      tokens.auditLayout.analyticsFilterMinWidth = "0rem";
    if (failure === "invalid-icon") tokens.icons.action = -1;
    if (failure === "invalid-breakpoint") tokens.breakpoints.tablet = 0;
    if (failure === "infinite-length")
      tokens.auditLayout.analyticsFilterMinWidth = `${"9".repeat(400)}rem`;
    if (failure === "invalid-ui-limit")
      tokens.uiConsistency.mobileThemeMaxWidth = "Infinitypx";
    if (failure === "invalid-ui-tracking")
      tokens.uiConsistency.metadataTracking = "NaNem";
    if (failure === "infinite-ui-gap")
      tokens.uiConsistency.statusIconGap = `${"9".repeat(400)}em`;
    save(directory, tokens);
    expect(generate(directory).status).not.toBe(0);
    expect(readFileSync(output, "utf8")).toBe("unchanged");
    expect(readFileSync(style, "utf8")).toBe(before);
  });
});

test("audit generator is keyed/idempotent and derives owned media aliases from central breakpoints", () => {
  fixture((directory, tokens) => {
    tokens.breakpoints.tablet = 800;
    tokens.homeFidelity.desktopMinWidth = 960;
    tokens.auditLayout = Object.fromEntries(
      Object.entries(tokens.auditLayout).reverse(),
    );
    tokens.uiConsistency = Object.fromEntries(
      Object.entries(tokens.uiConsistency).reverse(),
    );
    save(directory, tokens);
    expect(generate(directory).status).toBe(0);
    for (const identity of ["driver", "constructor"])
      expect(
        readFileSync(
          join(directory, `src/design-system/${identity}-identity.css`),
          "utf8",
        ),
      ).toContain("@media (min-width: 960px)");
    const output = join(directory, "src/design-system/audit-layout.tokens.css");
    const before = readFileSync(output, "utf8");
    expect(before).toContain("--apex-size-overview-track-compact: 8rem");
    expect(
      readFileSync(join(directory, "src/design-system/table.css"), "utf8"),
    ).toContain("@media (max-width: 799px)");
    expect(generate(directory).status).toBe(0);
    expect(readFileSync(output, "utf8")).toBe(before);
  });
});
