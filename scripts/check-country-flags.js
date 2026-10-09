import { readFileSync, readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { countryFlagAssets } from "../src/components/countryFlags.js";
import { validateConstructorSvg } from "./constructor-assets.js";

export function checkCountryFlags(root, manifest = countryFlagAssets) {
  const files = Object.values(manifest).map((file) => file.split("/").at(-1));
  const expected = new Set([...files, "LICENSE.md"]);
  const actual = readdirSync(root);
  if (
    new Set(files).size !== files.length ||
    actual.length !== expected.size ||
    actual.some((file) => !expected.has(file))
  )
    throw new Error("Country flag assets differ from manifest");
  let bytes = 0;
  for (const file of files) {
    if (!/^[a-z]{2}\.svg$/.test(file))
      throw new Error("Invalid country flag filename");
    const source = readFileSync(new URL(file, root));
    validateConstructorSvg(source.toString("utf8"));
    bytes += source.length;
  }
  if (!readFileSync(new URL("LICENSE.md", root), "utf8").includes("MIT"))
    throw new Error("Country flag license missing");
  return { count: files.length, bytes };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const result = checkCountryFlags(
    new URL("../public/images/flags/", import.meta.url),
  );
  console.log(
    `Validated ${result.count} country flags (${result.bytes} bytes).`,
  );
}
