import { readFileSync, writeFileSync } from "node:fs";
const root = new URL("../", import.meta.url);
const { homeFidelity } = JSON.parse(
  readFileSync(new URL("src/design-system/apex.tokens.json", root), "utf8"),
);
const aliases = [["desktopMinWidth", "Home desktop breakpoint"]];
if (
  !homeFidelity ||
  !aliases.every(
    ([key]) => Number.isSafeInteger(homeFidelity[key]) && homeFidelity[key] > 0,
  ) ||
  !Number.isSafeInteger(homeFidelity.championshipPreviewRowMinHeight) ||
  homeFidelity.championshipPreviewRowMinHeight <= 0
)
  throw new Error("Invalid Home fidelity tokens");
const path = new URL("src/design-system/home-fidelity.css", root);
let css = readFileSync(path, "utf8");
const rowPattern =
  /(--apex-size-home-championship-preview-row-min:\s*)\d+(px;)/g;
if ([...css.matchAll(rowPattern)].length !== 1)
  throw new Error("Invalid Home preview row token declaration");
css = css.replace(
  rowPattern,
  (_match, prefix, suffix) =>
    `${prefix}${homeFidelity.championshipPreviewRowMinHeight}${suffix}`,
);
for (const [key, marker] of aliases) {
  const pattern = new RegExp(
    `(/\\* ${marker} \\*/\\s*@media \\(min-width: )\\d+(px\\))`,
    "g",
  );
  if ([...css.matchAll(pattern)].length !== 1)
    throw new Error(`Invalid Home alias: ${key}`);
  css = css.replace(
    pattern,
    (_match, prefix, suffix) => `${prefix}${homeFidelity[key]}${suffix}`,
  );
}
writeFileSync(path, css);
