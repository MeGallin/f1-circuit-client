import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { resolve, join, dirname, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "vitest";

test.each([
  "zero-fluid",
  "inverted-clamp",
  "inverted-width",
  "missing-section",
])("generator rejects %s before modifying its output", (failure) => {
  const fixture = mkdtempSync(join(tmpdir(), "f1-ribbon-tokens-"));
  if (
    dirname(resolve(fixture)) !== resolve(tmpdir()) ||
    !basename(fixture).startsWith("f1-ribbon-tokens-")
  )
    throw new Error("Unsafe fixture cleanup path");
  try {
    const script = join(fixture, "scripts/generate-season-races-tokens.js");
    const source = join(fixture, "src/design-system/apex.tokens.json");
    const output = join(fixture, "src/design-system/season-races.tokens.css");
    mkdirSync(dirname(script), { recursive: true });
    mkdirSync(dirname(source), { recursive: true });
    copyFileSync("scripts/generate-season-races-tokens.js", script);
    writeFileSync(join(fixture, "package.json"), '{"type":"module"}');
    const tokens = JSON.parse(
      readFileSync("src/design-system/apex.tokens.json", "utf8"),
    );
    if (failure === "zero-fluid") tokens.seasonRaces.cardFluidWidth = "0cqw";
    if (failure === "inverted-clamp")
      tokens.seasonRaces.headingSize = "clamp(50px, 2.9cqw, 20px)";
    if (failure === "inverted-width") tokens.seasonRaces.cardMinWidth = 1000;
    if (failure === "missing-section") delete tokens.seasonRaces;
    writeFileSync(source, JSON.stringify(tokens));
    writeFileSync(output, "unchanged");
    const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Invalid season ribbon tokens");
    expect(readFileSync(output, "utf8")).toBe("unchanged");
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("season ribbon generation is keyed, idempotent, and leaves typography unchanged", () => {
  const root = pathToFileURL(`${process.cwd()}/`);
  const tokens = JSON.parse(
    readFileSync(new URL("src/design-system/apex.tokens.json", root), "utf8"),
  );
  const generated = new URL("src/design-system/season-races.tokens.css", root);
  const base = readFileSync(
    new URL("src/design-system/apex.tokens.css", root),
    "utf8",
  );
  const before = readFileSync(generated, "utf8");
  execFileSync(process.execPath, ["scripts/generate-season-races-tokens.js"], {
    cwd: root,
  });
  expect(readFileSync(generated, "utf8")).toBe(before);
  expect(before).toContain(
    `--apex-season-races-card-width: ${tokens.seasonRaces.cardWidth}px`,
  );
  expect(before).toContain(`max-width: ${tokens.breakpoints.tablet - 1}px`);
  expect(before).toContain("grid-row: 2");
  expect(
    readFileSync(new URL("src/design-system/apex.tokens.css", root), "utf8"),
  ).toBe(base);
  const style = readFileSync(
    new URL("src/design-system/season-races.css", root),
    "utf8",
  );
  const definitions = base + before;
  for (const [, variable] of style.matchAll(/var\((--[\w-]+)\)/g))
    expect(definitions).toContain(`${variable}:`);
  expect(style).toContain("overflow-wrap: anywhere");
  expect(style).toContain("scrollbar-color:");
});
