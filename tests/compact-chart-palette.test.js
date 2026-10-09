import { expect, test } from "vitest";
import { apexPalette } from "../src/design-system/apex.tokens";
const luminance = (hex) => {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((channel) => parseInt(channel, 16) / 255);
  const linear = rgb.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};
const contrast = (a, b) =>
  (Math.max(luminance(a), luminance(b)) + 0.05) /
  (Math.min(luminance(a), luminance(b)) + 0.05);
test.each(["dark", "light"])(
  "%s exact chart captions use contrast-safe normal surfaces, not intensity ink",
  (theme) => {
    const palette = apexPalette(theme);
    for (const background of [palette.surface, palette.canvas]) {
      expect(contrast(palette.text, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(palette.muted, background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(palette.focus, background)).toBeGreaterThanOrEqual(3);
    }
  },
);
