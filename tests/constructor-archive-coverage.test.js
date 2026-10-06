import { expect, test } from "vitest";
import { constructorCatalogue } from "../fixtures/constructor-catalogue";
import {
  constructorLogos,
  constructorLogoSource,
} from "../src/components/constructorLogos";

test.each(Object.entries(constructorCatalogue))(
  "%s has an explicit local mark for every published archive season",
  (id, years) => {
    for (const year of years)
      expect(
        constructorLogoSource(`constructor:${id}`, year),
        `${id} ${year}`,
      ).toBeTruthy();
    expect(constructorLogoSource(`constructor:${id}`)).toBeTruthy();
    for (const year of [1999, 2027])
      expect(constructorLogoSource(`constructor:${id}`, year)).toBeNull();
    const reviewed = constructorLogos[`constructor:${id}`].periods.flatMap(
      ({ from, through }) =>
        Array.from({ length: through - from + 1 }, (_, index) => from + index),
    );
    expect(reviewed.sort((a, b) => a - b)).toEqual(years);
  },
);
test("manifest covers exactly the audited 40 canonical IDs", () => {
  expect(Object.keys(constructorLogos).sort()).toEqual(
    Object.keys(constructorCatalogue)
      .map((id) => `constructor:${id}`)
      .sort(),
  );
});
test("Ferrari uses the recognisable shield rather than its small wordmark", () => {
  expect(constructorLogoSource("constructor:ferrari", 2026)).toBe(
    "/images/constructors/ferrari-shield.svg",
  );
});
test("renamed teams and dated identities never inherit successors", () => {
  for (const [id, year] of [
    ["alpine", 2020],
    ["alphatauri", 2024],
    ["rb", 2023],
    ["audi", 2025],
    ["bmw_sauber", 2010],
    ["lotus_f1", 2011],
    ["lotus_racing", 2012],
    ["manor", 2014],
  ])
    expect(constructorLogoSource(`constructor:${id}`, year)).toBeNull();
  expect(constructorLogoSource("constructor:lotus_f1", 2012)).not.toBe(
    constructorLogoSource("constructor:lotus_racing", 2011),
  );
  expect(constructorLogoSource("constructor:red_bull", 2025)).not.toBe(
    constructorLogoSource("constructor:red_bull", 2026),
  );
});
