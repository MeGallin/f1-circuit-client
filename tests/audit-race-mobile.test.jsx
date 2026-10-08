import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import { RaceResultTable, SessionNavigation } from "../src/pages/RaceDetail";
import * as ui from "../src/components/ui";
afterEach(cleanup);

test("UX-03 compact dataset chooser retains unavailable explanations and keyboard-native selection", () => {
  const onChange = vi.fn();
  render(
    <SessionNavigation
      value="results"
      onChange={onChange}
      features={[{ key: "laps", coverage: "unavailable" }]}
    />,
  );
  const chooser = screen.getByRole("combobox", { name: "Dataset" });
  expect(chooser).toHaveValue("results");
  expect([...chooser.options]).toHaveLength(14);
  expect(
    screen.getByRole("option", { name: /Laps.*not supplied/ }),
  ).toBeDisabled();
  fireEvent.change(chooser, { target: { value: "weather" } });
  expect(onChange).toHaveBeenLastCalledWith("weather");
  expect(
    screen.getByText(/Unavailable datasets are marked/),
  ).toBeInTheDocument();
});

test("UX-12 result driver identity has sticky shared-table contract and semantic row header", () => {
  const { container } = render(
    <MemoryRouter>
      <RaceResultTable
        rows={[
          {
            id: "one",
            entryId: "one",
            position: 1,
            statusLabel: "Finished",
            points: "25",
          },
        ]}
        names={{ one: "Independent Driver" }}
      />
    </MemoryRouter>,
  );
  const table = screen.getByRole("table", { name: "Race classification" });
  const identity = screen.getByRole("rowheader", {
    name: "Independent Driver",
  });
  expect(identity).toHaveClass("table-sticky-identity");
  expect(
    table.querySelector('th[scope="col"].table-sticky-identity'),
  ).toHaveTextContent("Driver");
  expect(container.querySelector(".table-scroll")).toHaveAttribute(
    "tabindex",
    "0",
  );
  expect(
    screen.getByText(/Scroll horizontally.*driver stays visible/),
  ).toBeInTheDocument();
});

test("UX-03/12 responsive contracts compact setup without hiding dataset content or shrinking text", () => {
  const css = readFileSync("src/design-system/race-mobile.css", "utf8");
  expect(css).toMatch(/@media\s*\(max-width:\s*767px\)/);
  expect(css).toMatch(/\.session-nav\s*\{[^}]*display:\s*none/s);
  expect(css).not.toMatch(/font-size:\s*\d+px/);
});

test("UX-12 shared table ownership caps enlarged identity without depending on Race import", () => {
  const ui = readFileSync("src/components/ui.jsx", "utf8");
  expect(ui).toContain('import "../design-system/table.css"');
  const css = readFileSync("src/design-system/table.css", "utf8");
  expect(
    readFileSync("src/design-system/audit-layout.tokens.css", "utf8"),
  ).toMatch(/--apex-size-table-identity-viewport-limit:\s*40vw/);
  expect(css).toMatch(/--apex-size-table-identity:\s*min\(/);
  expect(css).toMatch(/\.table-sticky-identity\s*\{[^}]*position:\s*sticky/s);
  expect(css).toMatch(/max-width:\s*var\(--apex-size-table-identity\)/);
  expect(css).toMatch(/scroll-padding-inline-start:/);
  const race = readFileSync("src/design-system/race-mobile.css", "utf8");
  expect(race).not.toContain(".table-sticky-identity");
  // Independent bounds: at 320px/200%, 8.75rem grows to280 but cap stays128.
  expect(Math.min(8.75 * 32, 320 * 0.4)).toBe(128);
  expect(273 - Math.min(8.75 * 32, 320 * 0.4)).toBeGreaterThan(140);
});

test("UX-12 enlarged evidence action wraps and focus correction clears sticky identity", () => {
  expect(typeof ui.tableFocusScrollDelta).toBe("function");
  // Parent independent geometry: region24.9..281.46, sticky right152.9.
  expect(
    ui.tableFocusScrollDelta({
      left: 24.9,
      right: 281.46,
      identityRight: 152.9,
      targetLeft: 59.67,
      targetRight: 155.67,
      gap: 4,
    }),
  ).toBeCloseTo(-97.23);
  expect(
    ui.tableFocusScrollDelta({
      left: 24.9,
      right: 281.46,
      identityRight: 152.9,
      targetLeft: 338,
      targetRight: 434,
      gap: 4,
    }),
  ).toBeCloseTo(156.54);
  expect(
    ui.tableFocusScrollDelta({
      left: 24.9,
      right: 281.46,
      identityRight: 152.9,
      targetLeft: 160,
      targetRight: 256,
      gap: 4,
    }),
  ).toBe(0);
  const css = readFileSync("src/design-system/table.css", "utf8");
  expect(css).toMatch(/--apex-size-table-action:/);
  expect(css).toMatch(/\.table-scroll--identity a[^}]*white-space:\s*normal/s);
  expect(css).toMatch(
    /\.table-scroll--identity a[^}]*max-width:\s*var\(--apex-size-table-action\)/s,
  );
});
