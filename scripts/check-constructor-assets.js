import { readFileSync, readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { constructorLogos } from "../src/components/constructorLogos.js";
import { validateConstructorSvg } from "./constructor-assets.js";

export function checkConstructorAssets(root, manifest = constructorLogos) {
  const files = new Set(
    Object.values(manifest).flatMap((entry) =>
      [entry.identity, ...entry.periods].map((asset) => asset.file),
    ),
  );
  const actual = readdirSync(root);
  if (actual.length !== files.size || actual.some((file) => !files.has(file)))
    throw new Error(
      "Constructor asset directory differs from the reviewed manifest",
    );
  let bytes = 0;
  for (const file of files) {
    if (!/^[a-z0-9-]+\.(svg|png|jpg)$/.test(file))
      throw new Error(`Invalid constructor asset filename: ${file}`);
    const data = readFileSync(new URL(file, root));
    bytes += data.length;
    if (file.endsWith(".svg")) validateConstructorSvg(data.toString("utf8"));
    else if (file.endsWith(".png")) {
      if (
        !data
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      )
        throw new Error(`Invalid PNG signature: ${file}`);
    } else if (!data.subarray(0, 3).equals(Buffer.from([255, 216, 255])))
      throw new Error(`Invalid JPEG signature: ${file}`);
  }
  return { count: files.size, bytes };
}
// Keep imports side-effect free for isolated failure-path regression fixtures.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const result = checkConstructorAssets(
    new URL("../public/images/constructors/", import.meta.url),
  );
  console.log(
    `Validated ${result.count} constructor assets (${result.bytes} bytes).`,
  );
}
