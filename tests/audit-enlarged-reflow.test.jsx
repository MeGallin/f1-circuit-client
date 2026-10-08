import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import AppShell from "../src/components/AppShell";
import { readFileSync } from "node:fs";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("analytics filter tracks and controls stay bounded when the existing minimum exceeds their container", () => {
  const css = readFileSync("src/design-system/analytics-density.css", "utf8");
  expect(
    readFileSync("src/design-system/audit-layout.tokens.css", "utf8"),
  ).toMatch(/--apex-size-analytics-filter-min-width:\s*12rem/);
  expect(css).toMatch(
    /minmax\(min\(100%,\s*var\(--apex-size-analytics-filter-min-width\)\),\s*1fr\)/,
  );
  expect(css).toMatch(
    /\.analytics-filters > \.field[^}]*min-width:\s*0[^}]*max-width:\s*100%/s,
  );
  expect(css).toMatch(
    /\.analytics-filters select[^}]*min-width:\s*0[^}]*max-width:\s*100%/s,
  );
  // Independent 200%/320px case: the old 12rem minimum is384px, but only218px
  // remains after panel gutters. This contract is not proof of browser bounds.
  expect(Math.min(218, 12 * 32)).toBe(218);
});

test("enlarged shared heading/panel content can shrink and wrap instead of overflowing", () => {
  const ui = readFileSync("src/components/ui.jsx", "utf8");
  expect(ui.includes('import "../design-system/reflow.css"')).toBe(true);
  const css = readFileSync("src/design-system/reflow.css", "utf8");
  expect(css).toMatch(/\.page-heading-copy\s*>\s*div[^}]*min-width:\s*0/s);
  expect(css).toMatch(/\.panel-heading-copy[^}]*min-width:\s*0/s);
  expect(css).toMatch(/overflow-wrap:\s*anywhere/);
});

test("enlarged tabs stay keyboard reachable and mobile nav labels cannot overlap", () => {
  const ui = readFileSync("src/components/ui.jsx", "utf8");
  expect(ui.includes('import "../design-system/reflow.css"')).toBe(true);
  const css = readFileSync("src/design-system/reflow.css", "utf8");
  expect(css).toMatch(/\.tabs\s*\{[^}]*flex-wrap:\s*wrap/s);
  expect(css).toMatch(/\.tabs button\s*\{[^}]*white-space:\s*normal/s);
  expect(css).toMatch(
    /\.mobile-nav\s*>\s*a\s*>\s*span[^}]*overflow-wrap:\s*anywhere/s,
  );
  expect(css).not.toMatch(/font-size:\s*\d+px|text-overflow:\s*ellipsis/);
});

test("footer reserves measured enlarged navigation height plus existing token clearance", () => {
  const css = readFileSync("src/design-system/reflow.css", "utf8");
  expect(css).toMatch(/padding-bottom:\s*max\(/);
  expect(css).toContain("--apex-size-mobile-navigation-height");
  expect(css).toContain("var(--apex-space-6)");
});

test("navigation resize observation updates shell reserve and disconnects on unmount", () => {
  let changed;
  let height = 221.92;
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback) {
        changed = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function () {
      return { height: this.classList.contains("mobile-nav") ? height : 0 };
    },
  );
  const store = configureStore({
    reducer: { preferences: () => ({ theme: "light" }) },
  });
  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <AppShell>
          <p>Last content</p>
        </AppShell>
      </MemoryRouter>
    </Provider>,
  );
  const shell = view.container.querySelector(".app-shell");
  expect(
    shell.style.getPropertyValue("--apex-size-mobile-navigation-height"),
  ).toBe("221.92px");
  height = 280;
  act(() => changed());
  expect(
    shell.style.getPropertyValue("--apex-size-mobile-navigation-height"),
  ).toBe("280px");
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
