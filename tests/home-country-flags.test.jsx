import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { countryFlagAssets } from "../src/components/countryFlags";
import { validateConstructorSvg } from "../scripts/constructor-assets";
import { afterEach, expect, test } from "vitest";
import {
  CountryFlag,
  countryCode,
  countryForCircuit,
} from "../src/components/visuals";
afterEach(cleanup);
test.each(["unavailable", "unknown", undefined])(
  "unavailable or unspecified profile coverage %s cannot supply circuit country",
  (coverage) => {
    expect(
      countryForCircuit(
        { circuit: { id: "circuit:source" } },
        {
          profile: { id: "circuit:source", country: "Italy" },
          meta: { snapshotId: "pin", coverage },
        },
        "pin",
      ),
    ).toBeNull();
  },
);
test.each(["complete", "partial"])(
  "available %s profile country remains source-owned",
  (coverage) => {
    expect(
      countryForCircuit(
        { circuit: { id: "circuit:source" } },
        {
          profile: { id: "circuit:source", country: "Italy" },
          meta: { snapshotId: "pin", coverage },
        },
        "pin",
      ),
    ).toBe("Italy");
  },
);
test("shared compact flag size uses the existing icon token without overriding default flags", () => {
  render(<CountryFlag country="Dutch" size="compact" />);
  expect(screen.getByRole("img")).toHaveClass("country-flag--compact");
  const css = readFileSync("src/design-system/country-flag.css", "utf8");
  expect(css).toMatch(
    /\.country-flag\.country-flag--image\.country-flag--compact\s*\{[^}]*width: var\(--apex-size-icon\)/,
  );
});
test.each([
  ["Australia", "AU"],
  ["Belgium", "BE"],
  ["Azerbaijan", "AZ"],
  ["Bahrain", "BH"],
  ["Qatar", "QA"],
])("source country %s maps to ISO %s", (name, code) =>
  expect(countryCode(name)).toBe(code),
);
test("Home image mode renders a bundled image, not platform letters/emoji", () => {
  render(<CountryFlag country="Malaysia" image />);
  expect(screen.getByRole("img", { name: "Malaysia flag" }).tagName).toBe(
    "IMG",
  );
  expect(screen.getByRole("img")).toHaveAttribute(
    "src",
    "/images/flags/my.svg",
  );
});
test("unknown country remains text and missing country renders nothing", () => {
  const { rerender } = render(
    <CountryFlag country="Unknown supplied place" image />,
  );
  expect(screen.queryByRole("img")).toBeNull();
  expect(screen.getByText("Unknown supplied place")).toBeInTheDocument();
  rerender(<CountryFlag country={null} image />);
  expect(document.querySelector(".country-flag")).toBeNull();
});
test("failed image falls back to supplied country text, without inventing another flag", () => {
  render(<CountryFlag country="Malaysia" image />);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.queryByRole("img")).toBeNull();
  expect(screen.getByText("Malaysia")).toBeInTheDocument();
});
test("all bundled flags are physical passive SVGs with the upstream license", () => {
  expect(
    readdirSync("public/images/flags")
      .filter((file) => file.endsWith(".svg"))
      .sort(),
  ).toEqual(
    Object.values(countryFlagAssets)
      .map((file) => file.split("/").at(-1))
      .sort(),
  );
  for (const file of Object.values(countryFlagAssets))
    expect(validateConstructorSvg(readFileSync(`public${file}`, "utf8"))).toBe(
      true,
    );
  expect(readFileSync("public/images/flags/LICENSE.md", "utf8")).toContain(
    "MIT",
  );
});
test("new presentation references resolve declared Apex tokens and shared flag CSS owns image sizing", () => {
  const files = [
    "src/design-system/home-fidelity.css",
    "src/design-system/country-flag.css",
  ];
  const css = files.map((file) => readFileSync(file, "utf8")).join("\n");
  const declarations = readdirSync("src/design-system")
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(`src/design-system/${file}`, "utf8"))
    .join("\n");
  for (const reference of css.matchAll(/var\((--apex-[\w-]+)/g))
    expect(declarations).toMatch(new RegExp(`${reference[1]}\\s*:`));
  expect(readFileSync(files[1], "utf8")).toContain(
    "width: var(--apex-size-icon-frame)",
  );
  expect(readFileSync("src/components/visuals.jsx", "utf8")).toContain(
    "design-system/country-flag.css",
  );
});
