import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { expect, test } from "vitest";
import { validateConstructorSvg } from "../scripts/constructor-assets";
import {
  constructorLogos,
  constructorLogoSource,
} from "../src/components/constructorLogos";

const assetRoot = resolve("public/images/constructors");
const entries = Object.entries(constructorLogos).flatMap(([id, entry]) =>
  entry.periods.map((asset) => [id, asset]),
);
test.each(entries)(
  "%s has a vetted local asset and exact year boundaries",
  (id, asset) => {
    const bytes = readFileSync(resolve(assetRoot, asset.file));
    if (asset.file.endsWith(".svg"))
      expect(validateConstructorSvg(bytes.toString("utf8"))).toBe(true);
    else if (asset.file.endsWith(".png"))
      expect([...bytes.subarray(0, 8)]).toEqual([
        137, 80, 78, 71, 13, 10, 26, 10,
      ]);
    expect(constructorLogoSource(id, asset.from)).toBeTruthy();
    expect(constructorLogoSource(id, asset.through)).toBeTruthy();
    if (asset.file.endsWith(".jpg"))
      expect([...bytes.subarray(0, 3)]).toEqual([255, 216, 255]);
    expect(constructorLogoSource(id, asset.from)).toBe(
      `/images/constructors/${asset.file}`,
    );
    expect(constructorLogoSource(id, asset.through)).toBe(
      `/images/constructors/${asset.file}`,
    );
  },
);
test("no downloaded asset is left outside the reviewed manifest", () => {
  expect(
    readdirSync(assetRoot)
      .filter((file) => /\.(svg|png|jpg)$/.test(file))
      .sort(),
  ).toEqual(
    [
      ...new Set(
        Object.values(constructorLogos).flatMap((entry) => [
          entry.identity.file,
          ...entry.periods.map((asset) => asset.file),
        ]),
      ),
    ].sort(),
  );
});
test("production builds validate physical constructor assets before Vite copies public files", () => {
  const scripts = JSON.parse(
    readFileSync(resolve("package.json"), "utf8"),
  ).scripts;
  expect(scripts.prebuild).toBe("node scripts/check-constructor-assets.js");
});

test("official RB and Red Bull derivatives retain team artwork, not sponsor paths", () => {
  const rb = new JSDOM(readFileSync(resolve(assetRoot, "rb.svg"), "utf8"), {
    contentType: "image/svg+xml",
  }).window.document;
  expect(rb.documentElement.getAttribute("viewBox")).toBe("58 0 71 63");
  expect(rb.querySelectorAll("path")).toHaveLength(2);
  expect(
    [...rb.querySelectorAll("path")].every(
      (path) => path.getAttribute("fill") === "#A7A9AC",
    ),
  ).toBe(true);
  const redBull = new JSDOM(
    readFileSync(resolve(assetRoot, "red-bull-2026.svg"), "utf8"),
    {
      contentType: "image/svg+xml",
    },
  ).window.document;
  expect(redBull.documentElement.children).toHaveLength(3);
  expect(redBull.documentElement.getAttribute("viewBox")).toBe(
    "578 159 424 164",
  );
  expect(redBull.querySelectorAll("circle")).toHaveLength(1);
});

test("Ferrari keeps its full shield aspect ratio", () => {
  const svg = new JSDOM(
    readFileSync(resolve(assetRoot, "ferrari-shield.svg"), "utf8"),
    {
      contentType: "image/svg+xml",
    },
  ).window.document.documentElement;
  expect(svg.getAttribute("viewBox")).toBe("0 0 400 540");
});
test("archive lockups retain only existing constructor emblems, not sponsor artwork", () => {
  const documentFor = (file) =>
    new JSDOM(readFileSync(resolve(assetRoot, file), "utf8"), {
      contentType: "image/svg+xml",
    }).window.document;
  const forceIndia = documentFor("force-india.svg");
  expect(forceIndia.querySelectorAll("path")).toHaveLength(3);
  expect(forceIndia.documentElement.getAttribute("viewBox")).toBe(
    "0 0 160 125",
  );
  const point = documentFor("racing-point.svg");
  expect(point.querySelectorAll("path")).toHaveLength(2);
  expect(point.documentElement.getAttribute("viewBox")).toBe("334 163 42 42");
  expect(
    [...point.querySelectorAll("path")].every(
      (path) => path.getAttribute("fill") === "#05233d",
    ),
  ).toBe(true);
});
test.each([
  '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>',
  '<svg xmlns="http://www.w3.org/2000/svg"><use href="https://example.com/logo.svg#x"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg"><path fill="url(https://example.com/x)"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg"><style>@import "https://example.com/x";</style></svg>',
  '<!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg"/>',
  '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" xml:base="https://example.com/"><use href="#logo"/></svg>',
  '<svg xmlns="urn:not-svg"/>',
  '<svg xmlns="http://www.w3.org/2000/svg"><path style="fill:u\\72l(https://example.com/x)"/></svg>',
])("rejects active/external SVG input %s", (source) => {
  expect(() => validateConstructorSvg(source)).toThrow();
});
test("constructor container CSS is generated from its named Apex token", () => {
  const tokens = JSON.parse(
    readFileSync(resolve("src/design-system/apex.tokens.json"), "utf8"),
  );
  const css = readFileSync(
    resolve("src/design-system/constructor-media.css"),
    "utf8",
  );
  expect(css).toContain(
    `@container (max-width: ${tokens.containerBreakpoints.constructorIdentityCompact}px)`,
  );
  // Driver rows now include team badges too; neither tab may become a cramped
  // two-column grid inside the narrow championship panel.
  expect(css).toContain(".season-around-race-standings .leader-list {");
  expect(css).toContain(
    ".season-around-race-standings .leader-list li:nth-child(even)",
  );
});
