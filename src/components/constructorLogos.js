// Exact canonical IDs. Explicit identity defaults, never inferred from today.
// Constructor/manufacturer identity aids, not season-exact sponsor liveries.
// Provenance and rights: docs/CONSTRUCTOR-LOGOS.md.
const mark = (file, from, through, history = [], tile = "neutral") => ({
  identity: { file, tile },
  periods: [{ file, from, through, tile }, ...history],
});
export const constructorLogos = {
  "constructor:alfa": mark("alfa.png", 2019, 2023),
  "constructor:alphatauri": mark("alphatauri.svg", 2020, 2023),
  "constructor:alpine": mark("alpine.svg", 2021, 2026),
  "constructor:arrows": mark("arrows.png", 2000, 2002),
  "constructor:aston_martin": mark("aston-martin-wings.svg", 2021, 2026),
  "constructor:audi": mark("audi.svg", 2026, 2026),
  "constructor:bar": mark("bar.png", 2000, 2005),
  "constructor:benetton": mark("benetton.jpg", 2000, 2001),
  "constructor:bmw_sauber": mark("bmw-sauber.svg", 2006, 2009),
  "constructor:brawn": mark("brawn.svg", 2009, 2009),
  "constructor:cadillac": mark("cadillac-crest.svg", 2026, 2026),
  "constructor:caterham": mark("caterham.svg", 2012, 2014),
  "constructor:ferrari": mark("ferrari-shield.svg", 2000, 2026),
  "constructor:force_india": mark("force-india.svg", 2008, 2018),
  "constructor:haas": mark("haas.svg", 2016, 2026),
  "constructor:honda": mark("honda.svg", 2006, 2008),
  "constructor:hrt": mark(
    "hrt.svg",
    2012,
    2012,
    [{ file: "hrt-archive.svg", from: 2010, through: 2011 }],
    "dark",
  ),
  "constructor:jaguar": mark("jaguar.svg", 2000, 2004),
  "constructor:jordan": mark("jordan.png", 2000, 2005),
  "constructor:lotus_f1": mark("lotus-f1.png", 2012, 2015),
  "constructor:lotus_racing": mark("lotus-racing.png", 2010, 2011),
  "constructor:manor": mark("manor.png", 2016, 2016, [
    { file: "manor-marussia.png", from: 2015, through: 2015 },
  ]),
  "constructor:marussia": mark("marussia.png", 2012, 2014),
  "constructor:mclaren": mark("mclaren.svg", 2000, 2026),
  "constructor:mercedes": mark("mercedes.svg", 2022, 2026, [
    { file: "mercedes-archive.svg", from: 2010, through: 2021 },
  ]),
  "constructor:mf1": mark("mf1.png", 2006, 2006),
  "constructor:minardi": mark("minardi.svg", 2000, 2005),
  "constructor:prost": mark("prost.png", 2000, 2001),
  "constructor:racing_point": mark("racing-point.svg", 2019, 2020),
  "constructor:rb": mark("rb.svg", 2024, 2026, [], "dark"),
  "constructor:red_bull": mark("red-bull-2026.svg", 2026, 2026, [
    { file: "red-bull-archive.png", from: 2005, through: 2012 },
    { file: "red-bull-brand.svg", from: 2013, through: 2025 },
  ]),
  "constructor:renault": mark("renault.png", 2005, 2011, [
    { file: "renault-1992.png", from: 2002, through: 2004 },
    { file: "renault.png", from: 2016, through: 2020 },
  ]),
  "constructor:sauber": mark("sauber.svg", 2010, 2018, [
    { file: "sauber-archive.png", from: 2000, through: 2005 },
    { file: "sauber.svg", from: 2024, through: 2025 },
  ]),
  "constructor:spyker": mark("spyker.png", 2007, 2007),
  "constructor:spyker_mf1": mark("spyker-mf1.jpg", 2006, 2006),
  "constructor:super_aguri": mark("super-aguri.svg", 2006, 2008),
  "constructor:toro_rosso": mark("toro-rosso.svg", 2006, 2019),
  "constructor:toyota": mark("toyota.svg", 2002, 2009),
  "constructor:virgin": mark("virgin.png", 2010, 2010, [
    { file: "virgin-2011.svg", from: 2011, through: 2011 },
  ]),
  "constructor:williams": mark("williams.png", 2023, 2026, [
    { file: "williams-archive.png", from: 2000, through: 2022 },
  ]),
};

export function constructorLogoAsset(id, year) {
  if (!Object.hasOwn(constructorLogos, id)) return null;
  const entry = constructorLogos[id];
  if (year === undefined || year === null || year === "") return entry.identity;
  if (!/^\d{4}$/.test(String(year))) return null;
  const asset = entry.periods.find(
    (asset) => Number(year) >= asset.from && Number(year) <= asset.through,
  );
  return asset || null;
}

export function constructorLogoSource(id, year) {
  const asset = constructorLogoAsset(id, year);
  return asset ? `/images/constructors/${asset.file}` : null;
}
