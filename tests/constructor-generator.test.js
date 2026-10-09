import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, expect, test } from "vitest";
const directories = [];
afterEach(() =>
  directories
    .splice(0)
    .forEach((directory) =>
      rmSync(directory, { recursive: true, force: true }),
    ),
);
function fixture(logoTile = "#123456") {
  const root = mkdtempSync(join(tmpdir(), "f1-logo-generator-"));
  directories.push(root);
  mkdirSync(join(root, "scripts"));
  mkdirSync(join(root, "src/design-system"), { recursive: true });
  writeFileSync(
    join(root, "scripts/generate-constructor-media.js"),
    readFileSync(resolve("scripts/generate-constructor-media.js")),
  );
  writeFileSync(join(root, "package.json"), '{"type":"module"}');
  writeFileSync(
    join(root, "src/design-system/apex.tokens.json"),
    JSON.stringify({
      themes: {
        dark: { logoTile, logoTileDark: "#234567" },
        light: { logoTile: "#345678", logoTileDark: "#456789" },
      },
    }),
  );
  const original =
    '/* unrelated font roles */\n[data-theme="light"] { --apex-color-logo-tile: #oldlight; }\n:root, [data-theme="dark"] { --apex-color-logo-tile: #olddark; }\n';
  writeFileSync(join(root, "src/design-system/apex.tokens.css"), original);
  writeFileSync(
    join(root, "src/design-system/constructor-media.css"),
    "existing output",
  );
  return {
    root,
    original,
    run: () =>
      spawnSync(
        process.execPath,
        [join(root, "scripts/generate-constructor-media.js")],
        { encoding: "utf8" },
      ),
  };
}
test("constructor generation emits both theme roles from JSON without patching shared token CSS", () => {
  const { root, original, run } = fixture();
  expect(run().status).toBe(0);
  const output = readFileSync(
    join(root, "src/design-system/constructor-media.css"),
    "utf8",
  );
  expect(output).toContain("--apex-color-logo-tile: #123456");
  expect(output).toContain("--apex-color-logo-tile: #345678");
  expect(output).toContain("--apex-color-logo-tile-dark: #234567");
  expect(output).toContain("--apex-color-logo-tile-dark: #456789");
  expect(
    readFileSync(join(root, "src/design-system/apex.tokens.css"), "utf8"),
  ).toBe(original);
  expect(run().status).toBe(0);
  expect(
    readFileSync(join(root, "src/design-system/constructor-media.css"), "utf8"),
  ).toBe(output);
});
test("invalid token input changes neither generated output nor unrelated token CSS", () => {
  const { root, original, run } = fixture("invalid");
  expect(run().status).not.toBe(0);
  expect(
    readFileSync(join(root, "src/design-system/apex.tokens.css"), "utf8"),
  ).toBe(original);
  expect(
    readFileSync(join(root, "src/design-system/constructor-media.css"), "utf8"),
  ).toBe("existing output");
});
