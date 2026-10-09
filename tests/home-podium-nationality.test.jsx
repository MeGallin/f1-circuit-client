import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { readFileSync } from "node:fs";
import { archiveApi } from "../src/api/archiveApi";
import { RacePodium } from "../src/features/season/RaceSummary";

const drivers = [
  { id: "driver:max", displayName: "Max fixture" },
  { id: "driver:andrea", displayName: "Andrea fixture" },
  { id: "driver:lewis", displayName: "Lewis fixture" },
];
const nationalities = ["Dutch", "Italian", "British"];
const detail = {
  podium: drivers.map((driver, index) => ({
    id: `result:${index}`,
    position: index + 1,
    points: [25, 18, 15][index],
    entry: { drivers: [driver] },
  })),
};
const stores = [];
afterEach(() => {
  cleanup();
  for (const store of stores.splice(0))
    store.dispatch(archiveApi.util.resetApiState());
  vi.unstubAllGlobals();
});
function setup(
  responseFor = (id) => ({
    profile: {
      id,
      nationality: nationalities[drivers.findIndex((d) => d.id === id)],
    },
  }),
  gate = Promise.resolve(),
) {
  const requests = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      const url = new URL(request.url);
      requests.push(url);
      await gate;
      const id = decodeURIComponent(url.pathname.split("/drivers/")[1]);
      const {
        profile,
        snapshotId = "publication:one",
        coverage = "partial",
      } = responseFor(id);
      return new Response(
        JSON.stringify({ data: { profile }, meta: { snapshotId, coverage } }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }),
  );
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (getDefault) => getDefault().concat(archiveApi.middleware),
  });
  stores.push(store);
  const view = (props = {}) => (
    <Provider store={store}>
      <RacePodium
        detail={detail}
        year={2026}
        aligned
        nationalityFlags
        snapshotId="publication:one"
        {...props}
      />
    </Provider>
  );
  return { requests, store, view };
}

test("Home flags map each podium driver to their pinned profile, replacing only points and deduplicating transport", async () => {
  const { requests, view } = setup();
  const { rerender, container } = render(view());
  for (const [index, nationality] of nationalities.entries()) {
    const row = container.querySelectorAll(".race-podium-row")[index];
    expect(
      await within(row).findByRole("img", { name: `${nationality} flag` }),
    ).toHaveAttribute("src", `/images/flags/${["nl", "it", "gb"][index]}.svg`);
    expect(within(row).getByRole("img")).not.toHaveClass(
      "country-flag--compact",
    );
  }
  expect(screen.queryByText(/\d+ PTS/)).toBeNull();
  expect(requests).toHaveLength(3);
  expect(
    requests.every(
      (url) => url.searchParams.get("snapshotId") === "publication:one",
    ),
  ).toBe(true);
  rerender(view());
  expect(requests).toHaveLength(3);
});

test.each([
  [
    "missing nationality",
    (id) => ({ profile: { id, nationality: null, country: "Italy" } }),
  ],
  [
    "foreign driver",
    () => ({ profile: { id: "driver:other", nationality: "Italian" } }),
  ],
  [
    "foreign publication",
    (id) => ({
      profile: { id, nationality: "Italian" },
      snapshotId: "publication:old",
    }),
  ],
  [
    "unavailable coverage",
    (id) => ({
      profile: { id, nationality: "Italian" },
      coverage: "unavailable",
    }),
  ],
])(
  "%s cannot supply an invented or stale nationality flag",
  async (_name, responseFor) => {
    const { view, store } = setup(responseFor);
    render(view());
    await waitFor(() =>
      expect(
        Object.values(store.getState().archiveApi.queries).filter(
          (q) => q.status === "fulfilled",
        ),
      ).toHaveLength(3),
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getAllByText(/Nationality not available for/)).toHaveLength(
      3,
    );
    expect(screen.queryByText(/\d+ PTS/)).toBeNull();
  },
);

test("without a publication pin no profile request is made; other podium consumers retain points", () => {
  const { view, requests } = setup();
  const { rerender } = render(view({ snapshotId: undefined }));
  expect(requests).toHaveLength(0);
  expect(screen.getAllByText(/Nationality not available for/)).toHaveLength(3);
  rerender(view({ nationalityFlags: false }));
  expect(screen.getByText("25 PTS")).toBeInTheDocument();
  expect(screen.getByRole("list")).not.toHaveClass(
    "race-podium--nationalities",
  );
  expect(requests).toHaveLength(0);
});

test("shared-driver entries preserve distinct flags, deduplicate IDs and share the RTK profile cache", async () => {
  const { view, requests } = setup();
  render(
    view({
      detail: {
        podium: [
          {
            ...detail.podium[0],
            entry: { drivers: [drivers[0], drivers[1], drivers[0]] },
          },
          { ...detail.podium[1], entry: { drivers: [drivers[0]] } },
        ],
      },
    }),
  );
  expect(
    await screen.findAllByRole("img", { name: "Dutch flag" }),
  ).toHaveLength(2);
  expect(
    await screen.findAllByRole("img", { name: "Italian flag" }),
  ).toHaveLength(1);
  expect(requests).toHaveLength(2);
});

test("Home uses the shared upcoming flag size and balances the former caption slot against numeral height", () => {
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(css).toMatch(
    /\.home-race-result \.race-podium-nationalities\s*\{[^}]*block-size: calc\(var\(--apex-size-icon-frame\) \* 3 \/ 4\)/,
  );
  expect(css).toContain("--home-podium-position-size:");
  expect(css).toMatch(
    /\.race-podium--nationalities\s+\.race-podium-position\s*\{[^}]*font-size: calc\(/,
  );
  expect(css).not.toMatch(
    /race-podium-nationalities \.country-flag--image\s*\{/,
  );
  const flagCss = readFileSync("src/design-system/country-flag.css", "utf8");
  expect(flagCss).toMatch(
    /\.country-flag\.country-flag--image\s*\{[^}]*width: var\(--apex-size-icon-frame\)/,
  );
});

test.each([
  [320, 34, 23.8],
  [390, 34, 23.8],
  [1368, 72.504, 62.304],
  [1440, 76.32, 66.12],
])(
  "at %spx the larger shared flag preserves the combined numeral/marker height",
  (width, originalNumeral, expectedNumeral) => {
    const { view } = setup();
    const { container, rerender } = render(
      <div className="home-race-result">{view({ snapshotId: undefined })}</div>,
    );
    const podium = container.querySelector(".race-podium");
    expect(podium).toHaveClass("race-podium--nationalities");
    let css = readFileSync("src/design-system/home-fidelity.css", "utf8");
    const values = {
      "--home-podium-position-size": `${originalNumeral}px`,
      "--apex-size-icon-frame": "40px",
      "--apex-type-caption-size": "12px",
      "--apex-type-body-line": "1.65",
      "--apex-type-title-mobile-size": "34px",
      "--apex-type-race-display-size": `${originalNumeral}px`,
      "--apex-space-3": "6px",
      "--apex-space-5": "12px",
      "--apex-space-2": "4px",
      "--apex-space-4": "8px",
      "--apex-space-6": "16px",
      "--apex-space-7": "20px",
    };
    for (const [key, value] of Object.entries(values))
      css = css.replaceAll(`var(${key})`, value);
    const parser = document.createElement("style");
    parser.textContent = css;
    document.head.append(parser);
    const flatten = (rules) =>
      [...rules]
        .flatMap((rule) =>
          rule.conditionText
            ? Number(
                rule.conditionText.match(/min-width:\s*(\d+)px/)?.[1] ?? 0,
              ) <= width
              ? flatten(rule.cssRules)
              : []
            : [rule.cssText],
        )
        .join("\n");
    const style = document.createElement("style");
    style.textContent = flatten(parser.sheet.cssRules);
    parser.remove();
    document.head.append(style);
    try {
      const numeral = getComputedStyle(
        podium.querySelector(".race-podium-position"),
      ).fontSize;
      const pixels = (value) => {
        const match = /^(?:calc\()?(-?\d+(?:\.\d+)?)px\)?$/.exec(value);
        expect(match).not.toBeNull();
        return Number(match[1]);
      };
      expect(pixels(numeral)).toBeCloseTo(expectedNumeral, 8);
      const marker = getComputedStyle(
        podium.querySelector(".race-podium-nationalities"),
      );
      expect(pixels(marker.blockSize)).toBe(30);
      expect(marker.marginTop).toBe("6px");
      expect(expectedNumeral + 30).toBeCloseTo(originalNumeral + 19.8, 8);
      expect(
        getComputedStyle(podium.querySelector(".race-podium-row")).rowGap,
      ).toBe("12px");
      const winner = getComputedStyle(
        podium.querySelector(".race-podium-row--winner .race-podium-block"),
      );
      const side = getComputedStyle(
        podium.querySelector(".race-podium-row--second .race-podium-block"),
      );
      expect(winner.height).toBe("auto");
      expect(side.height).toBe("auto");
      expect(winner.paddingBlock).toBe(width >= 900 ? "20px" : "16px");
      expect(side.paddingBlock || side.padding).toBe(
        width >= 900 ? "4px" : "8px",
      );
      rerender(
        <div className="home-race-result">
          {view({ nationalityFlags: false })}
        </div>,
      );
      expect(
        pixels(
          getComputedStyle(container.querySelector(".race-podium-position"))
            .fontSize,
        ),
      ).toBeCloseTo(originalNumeral, 8);
    } finally {
      style.remove();
    }
  },
);
