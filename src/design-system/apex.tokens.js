import tokens from "./apex.tokens.json";

/* Keep runtime chart geometry sourced from the same token file as the CSS build. */
export const APEX_SIZES = Object.freeze(tokens.sizes);
export const APEX_CHART = Object.freeze(tokens.chart);
export const APEX_ICONS = Object.freeze(tokens.icons);
export function apexPalette(
  theme = tokens.defaultTheme,
  brand = tokens.defaultBrand,
) {
  const selectedTheme = Object.hasOwn(tokens.themes, theme)
    ? theme
    : tokens.defaultTheme;
  const selectedBrand = Object.hasOwn(tokens.brands, brand)
    ? brand
    : tokens.defaultBrand;
  return {
    ...tokens.themes[selectedTheme],
    ...tokens.brands[selectedBrand][selectedTheme],
  };
}
