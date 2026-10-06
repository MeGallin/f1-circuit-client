import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, expect, test } from "vitest";
import { checkConstructorAssets } from "../scripts/check-constructor-assets.js";
const directories = [];
afterEach(() =>
  directories
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true })),
);
function fixture(source = '<svg xmlns="http://www.w3.org/2000/svg"/>') {
  const root = mkdtempSync(join(tmpdir(), "f1-asset-guard-"));
  directories.push(root);
  writeFileSync(join(root, "test.svg"), source);
  return {
    root: pathToFileURL(`${root}/`),
    path: root,
    manifest: {
      test: { identity: { file: "test.svg" }, periods: [{ file: "test.svg" }] },
    },
  };
}
test("build guard validates actual physical coverage", () =>
  expect(
    checkConstructorAssets(
      pathToFileURL(`${resolve("public/images/constructors")}/`),
    ).count,
  ).toBe(49));
test("build guard rejects missing files", () => {
  const f = fixture();
  rmSync(join(f.path, "test.svg"));
  expect(() => checkConstructorAssets(f.root, f.manifest)).toThrow();
});
test("build guard rejects orphan files", () => {
  const f = fixture();
  writeFileSync(join(f.path, "orphan.svg"), "unreviewed");
  expect(() => checkConstructorAssets(f.root, f.manifest)).toThrow();
});
test("build guard applies strict SVG validation", () => {
  const f = fixture('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>');
  expect(() => checkConstructorAssets(f.root, f.manifest)).toThrow(
    "Active SVG content",
  );
});
