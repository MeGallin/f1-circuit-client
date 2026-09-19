import { useState } from "react";

// Country flags use the platform's Unicode regional indicators. This keeps the
// client dependency-free and avoids shipping an unlicensed image collection.
const COUNTRY_CODES = {
  argentina: "AR",
  australian: "AU",
  austria: "AT",
  austrian: "AT",
  belgian: "BE",
  brazil: "BR",
  brazilian: "BR",
  britain: "GB",
  british: "GB",
  canada: "CA",
  canadian: "CA",
  chile: "CL",
  chilean: "CL",
  china: "CN",
  chinese: "CN",
  colombia: "CO",
  colombian: "CO",
  czechia: "CZ",
  czech: "CZ",
  danish: "DK",
  denmark: "DK",
  dutch: "NL",
  estonian: "EE",
  finland: "FI",
  finnish: "FI",
  france: "FR",
  french: "FR",
  germany: "DE",
  german: "DE",
  greatbritain: "GB",
  uk: "GB",
  hungarian: "HU",
  hungary: "HU",
  india: "IN",
  indian: "IN",
  indonesia: "ID",
  indonesian: "ID",
  ireland: "IE",
  irish: "IE",
  italy: "IT",
  italian: "IT",
  japan: "JP",
  japanese: "JP",
  malaysia: "MY",
  malaysian: "MY",
  mexico: "MX",
  mexican: "MX",
  monaco: "MC",
  monegasque: "MC",
  netherlands: "NL",
  newzealand: "NZ",
  newzealander: "NZ",
  norwegian: "NO",
  poland: "PL",
  polish: "PL",
  portugal: "PT",
  portuguese: "PT",
  romania: "RO",
  romanian: "RO",
  russia: "RU",
  russian: "RU",
  saudiarabia: "SA",
  saudiarabian: "SA",
  serbia: "RS",
  serbian: "RS",
  singapore: "SG",
  singaporean: "SG",
  slovakia: "SK",
  slovakian: "SK",
  southafrica: "ZA",
  southafrican: "ZA",
  spain: "ES",
  spanish: "ES",
  sweden: "SE",
  swedish: "SE",
  switzerland: "CH",
  swiss: "CH",
  thailand: "TH",
  thai: "TH",
  turkey: "TR",
  turkish: "TR",
  unitedarabemirates: "AE",
  unitedkingdom: "GB",
  uruguay: "UY",
  uruguayan: "UY",
  usa: "US",
  us: "US",
  unitedstates: "US",
  american: "US",
  venezuela: "VE",
  venezuelan: "VE",
};

function normalizeCountry(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[.'’`-]/g, "")
    .replace(/\s+/g, "");
}

export function countryCode(value) {
  const normalized = normalizeCountry(value);
  if (normalized === "uk") return "GB";
  if (/^[a-z]{2}$/.test(normalized)) return normalized.toUpperCase();
  return COUNTRY_CODES[normalized] || null;
}

export function countryFlagEmoji(value) {
  const code = countryCode(value);
  if (!code) return null;
  return [...code]
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

export function selectLayout(layouts, year) {
  if (!Array.isArray(layouts) || !layouts.length) return null;
  const targetYear = Number(year);
  const inRange = layouts.filter((layout) => {
    if (!Number.isInteger(targetYear)) return false;
    const from = layout.validFrom
      ? Number(String(layout.validFrom).slice(0, 4))
      : -Infinity;
    const to = layout.validTo
      ? Number(String(layout.validTo).slice(0, 4))
      : Infinity;
    return targetYear >= from && targetYear <= to;
  });
  return (
    (inRange.length ? inRange : layouts).find((layout) => layout?.assetUrl) ||
    null
  );
}

export function CountryFlag({
  country,
  label = "Country",
  className = "",
  showFallback = false,
}) {
  const emoji = countryFlagEmoji(country);
  const name = String(country || "").trim();
  const classes = `country-flag ${className}`.trim();
  if (!name && !showFallback) return null;
  if (!name)
    return (
      <span
        className={`${classes} country-flag--missing`}
        aria-label={`${label} not supplied`}
      >
        Flag not supplied
      </span>
    );
  if (!emoji)
    return (
      <span
        className={`${classes} country-flag--fallback`}
        aria-label={`${label}: ${name}`}
      >
        {name}
      </span>
    );
  return (
    <span
      className={classes}
      role="img"
      aria-label={`${name} flag`}
      title={name}
    >
      {emoji}
    </span>
  );
}

function safeAssetUrl(value) {
  if (typeof value !== "string" || !/^https?:\/\//i.test(value)) return null;
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

export function CircuitSilhouette({
  layout,
  assetUrl,
  circuitName = "Circuit",
  country,
  size = "default",
  theme = "auto",
  attribution,
  licence,
  fallback = "hidden",
  showFallback = false,
  fallbackLabel,
  className = "",
}) {
  const [failed, setFailed] = useState(false);
  const source = safeAssetUrl(assetUrl || layout?.assetUrl);
  const classes =
    `circuit-silhouette circuit-silhouette--${size} circuit-silhouette--theme-${theme} ${className}`.trim();
  const effectiveFallback = showFallback ? "message" : fallback;
  if (!source || failed)
    return effectiveFallback === "message" ? (
      <div
        className={`${classes} circuit-silhouette--fallback`}
        role="img"
        aria-label={`${circuitName} track layout ${failed ? "unavailable" : "not supplied"}`}
      >
        {fallbackLabel ||
          (failed ? "Track layout unavailable" : "Track layout not supplied")}
      </div>
    ) : null;
  const sourceAttribution = attribution || layout?.attribution;
  const sourceLicence = licence || layout?.licence;
  const name = `${circuitName}${country ? `, ${country}` : ""}`;
  return (
    <figure className={classes}>
      <img
        src={source}
        alt={`${name} track layout`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
      {(sourceAttribution || sourceLicence) && (
        <figcaption>
          {sourceAttribution || "Layout source supplied"}
          {sourceLicence ? ` · ${sourceLicence}` : ""}
        </figcaption>
      )}
    </figure>
  );
}
