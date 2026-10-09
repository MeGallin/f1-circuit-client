import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import userEvent from "@testing-library/user-event";
import { SeasonAroundRace } from "../src/features/season/SeasonPanels";
import { LeaderList, RacePodium } from "../src/features/season/RaceSummary";
const state = vi.hoisted(() => ({
  calls: [],
  country: "Malaysia",
  collectionSnapshot: "publication:one",
  mixedStandings: false,
  noSession: false,
  profileCountry: null,
  profileId: "circuit:sepang",
  profileSnapshot: "publication:one",
  eventSnapshot: "publication:one",
  eventCoverage: "complete",
}));
const event = {
  id: "event:2000:wrong-name",
  year: 2000,
  round: 7,
  name: "Bahrain Grand Prix in Malaysia",
  status: "completed",
  circuit: { id: "circuit:sepang", displayName: "Sepang", country: "Malaysia" },
  schedule: { date: "2000-03-19" },
};
const rows = (kind) =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `${kind}:${i}`,
    standingSnapshotId: "standing:2000:7",
    rank: i + 1,
    entity: { id: `${kind}:${i}`, displayName: `${kind} ${i + 1}` },
    constructors: [],
    number: i + 8,
    points: i === 3 ? "0" : `${30 - i}.5`,
  }));
const results = Array.from({ length: 4 }, (_, i) => ({
  id: `result:${i}`,
  sessionId: "session:published",
  position: i + 1,
  entry: { drivers: [{ displayName: `Podium ${i + 1}` }], number: i + 3 },
  points: i === 3 ? "0" : "25",
  status: "finished",
}));
vi.mock("../src/api/archiveApi", () => ({
  useGetHomeChampionshipGraphicsQuery: () => ({ currentData: null }),
  useGetCalendarQuery: () => ({
    currentData: {
      items: [
        { ...event, circuit: { ...event.circuit, country: state.country } },
      ],
    },
    isSuccess: true,
  }),
  useGetProfileQuery: () => ({
    currentData: {
      profile: {
        id: state.profileId,
        country: state.profileCountry ?? state.country,
      },
      meta: { snapshotId: state.profileSnapshot, coverage: "partial" },
    },
  }),
  useGetLayoutsQuery: () => ({ currentData: { items: [] } }),
  useGetEventQuery: () => ({
    currentData: {
      meta: { snapshotId: state.eventSnapshot, coverage: state.eventCoverage },
      detail: {
        event,
        sessions: state.noSession
          ? []
          : [{ id: "session:published", eventId: event.id, kind: "race" }],
        podium: results.slice(0, 3),
      },
    },
    isSuccess: true,
  }),
  useGetStandingsQuery: ({ kind }) => ({
    currentData: {
      items: state.mixedStandings
        ? [
            ...rows(kind),
            {
              ...rows(kind)[0],
              id: "foreign",
              standingSnapshotId: "standing:1999:7",
            },
          ]
        : rows(kind),
      meta: { snapshotId: "publication:one", coverage: "complete" },
    },
    isSuccess: true,
  }),
  useGetOverviewCollectionQuery: (args, options) => {
    state.calls.push({ args, options });
    return {
      currentData: {
        items: args?.kind === "results" ? results : rows(args?.kind),
        meta: { snapshotId: state.collectionSnapshot, coverage: "complete" },
      },
      isSuccess: true,
    };
  },
}));
afterEach(() => {
  cleanup();
  state.calls = [];
  state.country = "Malaysia";
  state.collectionSnapshot = "publication:one";
  state.mixedStandings = false;
  state.noSession = false;
  state.profileCountry = null;
  state.profileId = "circuit:sepang";
  state.profileSnapshot = "publication:one";
  state.eventSnapshot = "publication:one";
  state.eventCoverage = "complete";
});
function View({
  snapshot = "publication:one",
  standingSnapshotId = "standing:2000:7",
  noEvent = false,
}) {
  return (
    <MemoryRouter>
      <SeasonAroundRace
        now={Date.UTC(2000, 4, 1)}
        snapshotId={snapshot}
        summary={{
          season: { year: 2000, eventCount: 17 },
          latestCompletedEvent: noEvent
            ? null
            : {
                ...event,
                circuit: { ...event.circuit, country: state.country },
              },
          leadingDrivers: rows("drivers"),
          leadingConstructors: rows("constructors"),
          standingSnapshotId,
        }}
      />
    </MemoryRouter>
  );
}

test.each(["wrong-publication", "unavailable"])(
  "Home rejects %s event detail before showing podium or enabling full results",
  (failure) => {
    if (failure === "wrong-publication")
      state.eventSnapshot = "publication:old";
    if (failure === "unavailable") state.eventCoverage = "unavailable";
    render(<View />);
    const race = screen.getByRole("region", { name: "Race result" });
    expect(within(race).queryByText("Podium 1")).not.toBeInTheDocument();
    expect(
      within(race).getByRole("button", { name: "Show full results" }),
    ).toBeDisabled();
  },
);
test("compact previews budget inline badges and logo captions without stacking every identity element", () => {
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8").split(
    "/* Home desktop breakpoint */",
  )[0];
  expect(readFileSync("src/design-system/driver-identity.css", "utf8")).toMatch(
    /\.driver-identity \.driver-identity-line\s*\{[^}]*display: flex;/,
  );
  expect(
    readFileSync("src/design-system/constructor-identity.css", "utf8"),
  ).toMatch(
    /\.constructor-identity--championship[^{}]*\{[^}]*font-size: var\(--apex-type-body-size\);/,
  );
  expect(css).toMatch(
    /\.home-championship \.leader-list li > div > p\s*\{[^}]*margin-block: var\(--apex-space-2\);/,
  );
  render(<View />);
  expect(
    screen.getByRole("region", { name: "Drivers’ championship" }),
  ).toHaveTextContent("drivers 1");
});
test("Home results toggle is the single podium header action, without redundant Top three", async () => {
  const user = userEvent.setup();
  render(<View />);
  const race = screen.getByRole("region", { name: "Race result" });
  const header = race.querySelector(".race-focus-results-heading");
  const button = screen.getByRole("button", { name: "Show full results" });
  expect(header).toContainElement(button);
  expect(within(race).queryByText("Top three")).not.toBeInTheDocument();
  expect(
    race.querySelectorAll('button[aria-controls="home-more-results"]'),
  ).toHaveLength(1);
  expect(race.querySelector(":scope > .button")).toBeNull();
  button.focus();
  await user.keyboard("{Enter}");
  expect(button).toHaveFocus();
  expect(button).toHaveAccessibleName("Show less");
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(
    screen.getByRole("region", { name: "Full race results" }),
  ).toHaveAttribute("id", button.getAttribute("aria-controls"));
  await user.keyboard(" ");
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute("aria-expanded", "false");
  expect(
    screen.queryByRole("region", { name: "Full race results" }),
  ).not.toBeInTheDocument();
});

test("generic RacePodium retains Top three without an injected Home action", () => {
  render(<RacePodium detail={{ podium: results.slice(0, 3) }} year={2000} />);
  expect(screen.getByText("Top three")).toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test.each([320, 390, 1440])(
  "both Home standings footer links retain full available width at %ipx",
  (width) => {
    const source = document.createElement("style");
    source.textContent = readFileSync(
      "src/design-system/home-fidelity.css",
      "utf8",
    );
    document.head.append(source);
    const activeRules = (rules) =>
      [...rules].flatMap((rule) => {
        if (!rule.conditionText) return [rule.cssText];
        const minimum = rule.conditionText.match(/min-width:\s*(\d+)px/);
        if (minimum && width < Number(minimum[1])) return [];
        return activeRules(rule.cssRules);
      });
    const resolved = document.createElement("style");
    resolved.textContent = activeRules(source.sheet.cssRules).join("\n");
    source.remove();
    document.head.append(resolved);
    try {
      render(<View />);
      for (const link of screen.getAllByRole("link", {
        name: "View standings",
      })) {
        expect(link.parentElement).toHaveClass("home-panel-link");
        expect(link.closest(".home-championship")).not.toBeNull();
        const style = getComputedStyle(link);
        // Cascade/containment contract only; real pixel bounds are a browser gate.
        expect(style.width).toBe("100%");
        expect(style.maxWidth).toBe("100%");
        expect(style.minWidth).toBe("0px");
      }
      expect(
        getComputedStyle(screen.getByRole("link", { name: "Open race detail" }))
          .width,
      ).not.toBe("100%");
    } finally {
      resolved.remove();
    }
  },
);

test("championship previews have only pinned View standings links and no collection controls", () => {
  render(<View />);
  expect(
    screen.queryAllByRole("button", {
      name: /Show more (drivers|constructors)/,
    }),
  ).toHaveLength(0);
  expect(screen.getAllByRole("link", { name: "View standings" })).toHaveLength(
    2,
  );
  for (const kind of ["drivers", "constructors"]) {
    const panel = screen.getByRole("region", {
      name:
        kind === "drivers"
          ? "Drivers’ championship"
          : "Constructors’ championship",
    });
    const url = new URL(
      within(panel).getByRole("link", { name: "View standings" }).href,
    );
    expect(url.pathname).toBe("/standings");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      season: "2000",
      kind,
      snapshot: "publication:one",
      standingSnapshotId: "standing:2000:7",
      round: "7",
    });
    expect(within(panel).getAllByRole("listitem")).toHaveLength(3);
    expect(within(panel).queryByRole("button")).not.toBeInTheDocument();
  }
  expect(state.calls).toHaveLength(0);
});
test("Home renders one shared completed header and simultaneous top-three championship panels without tabs", () => {
  render(<View />);
  expect(
    screen.queryByRole("tablist", { name: "Championship standings" }),
  ).not.toBeInTheDocument();
  for (const kind of ["Drivers’ championship", "Constructors’ championship"]) {
    const panel = screen.getByRole("region", { name: kind });
    expect(within(panel).getAllByRole("listitem")).toHaveLength(3);
    expect(within(panel).getByText("29.5")).toBeInTheDocument();
    expect(
      within(panel)
        .getByRole("link", { name: "View standings" })
        .getAttribute("href"),
    ).toContain("snapshot=publication%3Aone");
  }
  expect(document.querySelector(".home-completed-header")).toContainElement(
    screen.getByRole("heading", { name: event.name }),
  );
  expect(
    screen.getByRole("link", { name: "Open race detail" }).getAttribute("href"),
  ).toContain("snapshot=publication%3Aone");
});
test("race-only expansion is keyboard operable, lazy, pinned and resets with publication selection", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<View />);
  expect(state.calls.filter((call) => !call.options.skip)).toHaveLength(0);
  const button = screen.getByRole("button", { name: "Show full results" });
  button.focus();
  await user.keyboard("{Enter}");
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(
    screen.getByRole("region", { name: "Full race results" }),
  ).toHaveTextContent("Podium 4");
  expect(
    state.calls.some(
      ({ args, options }) =>
        !options.skip &&
        args.snapshotId === "publication:one" &&
        args.sessionId === "session:published",
    ),
  ).toBe(true);
  screen.getByRole("button", { name: "Show less" }).focus();
  await user.keyboard(" ");
  expect(
    screen.queryByRole("region", { name: "Full race results" }),
  ).not.toBeInTheDocument();
  expect(state.calls.every(({ args }) => args.kind === "results")).toBe(true);
  screen.getByRole("button", { name: "Show full results" }).focus();
  await user.keyboard("{Enter}");
  expect(
    screen.getByRole("region", { name: "Race result" }).nextElementSibling,
  ).toBe(screen.getByRole("region", { name: "Full race results" }));
  expect(screen.getByRole("button", { name: "Show less" })).toHaveFocus();
  expect(
    screen.queryByRole("region", { name: "More drivers" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("region", { name: "More constructors" }),
  ).not.toBeInTheDocument();
  rerender(<View snapshot="publication:two" />);
  expect(
    screen.queryByRole("region", { name: "Full race results" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Show full results" }),
  ).toHaveAttribute("aria-expanded", "false");
});
test("standing context from another season is unavailable and never linked as this championship round", () => {
  render(<View standingSnapshotId="standing:1999:7" />);
  expect(screen.getAllByText("Standings context not supplied")).toHaveLength(2);
  for (const link of screen.getAllByRole("link", {
    name: "View standings",
  }))
    expect(link.getAttribute("href")).not.toContain("standingSnapshotId");
});
test("country flags follow supplied circuit records in header/history, never the misleading race name", () => {
  render(<View />);
  expect(
    within(document.querySelector(".home-completed-header")).getByRole("img", {
      name: "Malaysia flag",
    }),
  ).toBeInTheDocument();
  expect(
    within(screen.getByRole("button", { name: /Round 7: Bahrain/ })).getByRole(
      "img",
      { name: "Malaysia flag" },
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: "Bahrain flag" }),
  ).not.toBeInTheDocument();
});
test("missing country adds no invented flag", () => {
  state.country = null;
  render(<View />);
  expect(document.querySelector(".home-completed-header")).toBeInTheDocument();
  expect(
    document.querySelector(".home-completed-header .country-flag"),
  ).toBeNull();
});
test.each(["identity", "publication"])(
  "profile country rejects mismatched %s in header and history",
  (mismatch) => {
    state.country = null;
    state.profileCountry = "Malaysia";
    if (mismatch === "identity") state.profileId = "circuit:other";
    else state.profileSnapshot = "publication:other";
    render(<View />);
    expect(
      screen.queryAllByRole("img", { name: "Malaysia flag" }),
    ).toHaveLength(0);
  },
);
test("matching pinned circuit profile supplies country when event country is missing", () => {
  state.country = null;
  state.profileCountry = "Malaysia";
  render(<View />);
  expect(screen.getAllByRole("img", { name: "Malaysia flag" })).toHaveLength(2);
});
test("expanded results reject another publication, rather than borrowing matching session rows", async () => {
  state.collectionSnapshot = "publication:other";
  const user = userEvent.setup();
  render(<View />);
  await user.click(screen.getByRole("button", { name: "Show full results" }));
  const panel = screen.getByRole("region", { name: "Full race results" });
  expect(within(panel).queryByText("Podium 4")).toBeNull();
  expect(panel).toHaveTextContent("Published records not available");
});
test("mixed snapshot standings do not silently filter foreign records into a valid preview", () => {
  state.mixedStandings = true;
  render(<View />);
  expect(
    within(
      screen.getByRole("region", { name: "Drivers’ championship" }),
    ).queryByRole("list"),
  ).toBeNull();
  expect(screen.getAllByText("Standings not available")).toHaveLength(2);
});
test("Home desktop metadata hierarchy uses existing section/body type roles without scaling mobile or headings", () => {
  const desktop = readFileSync(
    "src/design-system/home-fidelity.css",
    "utf8",
  ).split("/* Home desktop breakpoint */")[1];
  expect(desktop).toMatch(
    /\.home-completed-header \.circuit-name strong\s*\{[^}]*font-size: var\(--apex-type-section-size\);[^}]*line-height: var\(--apex-type-control-line\);/,
  );
  expect(desktop).toMatch(
    /\.home-completed-header \.race-round,\s*\.home-completed-header \.home-completed-date\s*\{[^}]*font-size: var\(--apex-type-body-size\);/,
  );
});
test("Home podium and championship render the same shared driver identity component and name/team roles", () => {
  render(<View />);
  const podium = document.querySelector(
    ".race-podium--aligned .driver-identity",
  );
  const championship = document.querySelector(
    ".home-championship--drivers .driver-identity",
  );
  expect(podium).not.toBeNull();
  expect(championship).not.toBeNull();
  for (const identity of [podium, championship]) {
    expect(
      identity.querySelector(".driver-identity-line > .driver-number"),
    ).toBeInTheDocument();
    expect(
      identity.querySelector(".driver-identity-line > .driver-identity-name"),
    ).toBeInTheDocument();
  }
  expect(
    podium.querySelector(":scope > .driver-identity-team"),
  ).toBeInTheDocument();
  expect(
    championship.querySelector(":scope > .driver-identity-team"),
  ).toBeNull();
  expect(podium).toHaveClass("driver-identity--stack-mobile");
  expect(championship).toHaveClass("driver-identity--stack-mobile");
  expect(championship.className).toBe(podium.className);
  expect(
    document.querySelector(".home-championship--constructors .driver-identity"),
  ).toBeNull();
  const source = readFileSync("src/features/season/RaceSummary.jsx", "utf8");
  expect(source.match(/<DriverIdentity\b/g)).toHaveLength(2);
});
test("shared identity owns common baseline alignment, tokenized name/team spacing and badge styling", () => {
  const css = readFileSync("src/design-system/driver-identity.css", "utf8");
  expect(css).toMatch(
    /\.driver-identity \.driver-identity-line\s*\{[^}]*align-items: first baseline;[^}]*gap: var\(--apex-space-2\);/,
  );
  expect(css).toMatch(/\.driver-identity\s*\{[^}]*gap: var\(--apex-space-2\);/);
  expect(css).toMatch(
    /\.driver-identity \.driver-number\s*\{[^}]*border-color: var\(--apex-color-accent-border\);/,
  );
  const home = readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(home).not.toMatch(
    /\.home-championship \.driver-number|\.race-podium-driver-copy > strong/,
  );
});
test("mobile shared team captions retain full width instead of losing badge indentation", () => {
  const css = readFileSync("src/design-system/driver-identity.css", "utf8");
  const [mobile, desktop] = css.split("/* Home desktop breakpoint */");
  expect(mobile).toMatch(
    /\.driver-identity \.driver-identity-team\s*\{[^}]*margin-inline-start: 0;/,
  );
  expect(desktop).toMatch(
    /\.driver-identity \.driver-identity-team\s*\{[^}]*margin-inline-start: calc\(var\(--apex-size-icon\) \+ var\(--apex-space-2\)\);/,
  );
});
test("Home podium and championship share compact red outlined DriverNumber styling at every width", () => {
  render(<View />);
  const podiumBadge = document.querySelector(
    ".race-podium--aligned .driver-number",
  );
  const championshipBadge = document.querySelector(
    ".home-championship--drivers .driver-number",
  );
  expect(podiumBadge.className).toBe(championshipBadge.className);
  expect(podiumBadge).not.toHaveAttribute("aria-label");
  expect(within(podiumBadge).getByText("Driver number 3")).toHaveClass(
    "sr-only",
  );
  const css = readFileSync("src/design-system/driver-identity.css", "utf8");
  expect(css).toMatch(
    /\.driver-identity \.driver-number\s*\{[^}]*width: var\(--apex-size-icon\);[^}]*border-color: var\(--apex-color-accent-border\);[^}]*color: var\(--apex-color-text\);/,
  );
  expect(css.split("/* Home desktop breakpoint */")[1]).not.toContain(
    "> .driver-number",
  );
});
test("Home podium preserves unknown constructor text without hiding known constructor logos", () => {
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(css).not.toMatch(
    /\.home-race-result \.race-podium--aligned \.constructor-logo\s*\{[^}]*display: none;/,
  );
  render(<View />);
  expect(
    document.querySelector(".race-podium--aligned .driver-identity-team"),
  ).toHaveTextContent("Constructor not supplied");
});
test("Home badges share exact typography and mobile names have a readable compact type role", () => {
  const css = readFileSync("src/design-system/driver-identity.css", "utf8");
  expect(css).toMatch(
    /\.driver-identity \.driver-number\s*\{[^}]*font-size: var\(--apex-type-eyebrow-size\);[^}]*line-height: 1;/,
  );
  expect(css).toMatch(
    /\.driver-identity \.driver-identity-name\s*\{[^}]*font-size: var\(--apex-type-caption-size\);[^}]*line-height: var\(--apex-type-control-line\);/,
  );
  expect(css.split("/* Home desktop breakpoint */")[1]).toMatch(
    /\.driver-identity \.driver-identity-name\s*\{[^}]*font-size: var\(--apex-type-prose-size\);/,
  );
});
test("mobile podium stacks badge, full-width word-wrapped name and team while desktop retains inline badge", () => {
  const css = readFileSync("src/design-system/driver-identity.css", "utf8");
  const mobile = css.split("/* Home desktop breakpoint */")[0];
  expect(mobile).toMatch(
    /\.driver-identity--stack-mobile \.driver-identity-line\s*\{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\);/,
  );
  render(<View />);
  const line = document.querySelector(
    ".race-podium--aligned .driver-identity-line",
  );
  expect([...line.children].map((child) => child.className)).toEqual([
    "driver-number",
    "driver-identity-name",
  ]);
  expect(mobile).toMatch(
    /\.driver-identity \.driver-identity-name\s*\{[^}]*overflow-wrap: normal;/,
  );
  expect(mobile).toMatch(
    /\.driver-identity \.driver-identity-team\s*\{[^}]*margin-inline-start: 0;/,
  );
  const desktop = css.split("/* Home desktop breakpoint */")[1];
  expect(desktop).toMatch(
    /\.driver-identity--stack-mobile \.driver-identity-line\s*\{[^}]*display: flex;/,
  );
  expect(desktop).not.toContain("align-items:");
  expect(desktop).toContain(
    "margin-inline-start: calc(var(--apex-size-icon) + var(--apex-space-2));",
  );
});
test("desktop championship previews own one shared padding and tokenized minimum, not fixed row heights", () => {
  const desktop = readFileSync(
    "src/design-system/home-fidelity.css",
    "utf8",
  ).split("/* Home desktop breakpoint */")[1];
  expect(desktop).toMatch(
    /\.home-summary-panels \.home-championship \.leader-list li\s*\{[^}]*padding-block: var\(--apex-space-5\);[^}]*padding-inline: 0;[^}]*min-block-size: var\(--apex-size-home-championship-preview-row-min\);/,
  );
  expect(desktop).not.toContain(
    ".home-championship--constructors .leader-list li",
  );
});
test("desktop Home podium badge precedes its own name on row one and team stays under the name", () => {
  render(<View />);
  const rows = document.querySelectorAll(
    ".race-podium--aligned .race-podium-row",
  );
  expect(rows).toHaveLength(3);
  for (const [index, row] of [...rows].entries()) {
    const identity = row.querySelector(".driver-identity");
    expect(
      identity.querySelector(".driver-identity-line > .driver-number"),
    ).toHaveTextContent(String(index + 3));
    expect(
      identity.querySelector(".driver-identity-line > .driver-identity-name"),
    ).toHaveTextContent(`Podium ${index + 1}`);
    expect(
      identity.querySelector(":scope > .driver-identity-team"),
    ).toBeInTheDocument();
  }
  const css = readFileSync("src/design-system/driver-identity.css", "utf8");
  expect(css).toMatch(
    /\.driver-identity \.driver-identity-line\s*\{[^}]*display: flex;/,
  );
  expect(css).toMatch(
    /\.driver-identity \.driver-identity-team\s*\{[^}]*margin-inline-start: calc\(var\(--apex-size-icon\) \+ var\(--apex-space-2\)\);/,
  );
});
test("Home panel tonal treatment uses only the established Apex canvas and surface palette", () => {
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(css).toMatch(
    /background: linear-gradient\(\s*to bottom right,\s*var\(--apex-color-canvas\),\s*var\(--apex-color-surface\)\s*\);/,
  );
});
test("spacing amendment uses natural desktop records and independent intrinsic podium tracks", () => {
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8");
  const desktop = css.split("/* Home desktop breakpoint */")[1];
  expect(css).toMatch(/\.home-championship-records\s*\{[^}]*flex: initial;/);
  expect(desktop).toMatch(
    /\.home-championship \.leader-driver-line strong\s*\{[^}]*font-family: var\(--apex-font-body\);/,
  );
  expect(css).toMatch(
    /\.home-race-result \.race-podium--aligned\s*\{[^}]*grid-template-rows: auto auto;/,
  );
  expect(css).toMatch(
    /\.race-podium-row\s*\{[^}]*grid-template-rows: auto auto;[^}]*grid-row: 1 \/ span 2;/,
  );
  expect(css).toMatch(/\.race-podium-driver\s*\{[^}]*padding: 0;/);
  expect(css).not.toMatch(
    /padding-block-(?:start|end): var\(--home-podium-winner-lift\)/,
  );
  expect(css).not.toMatch(/transform: translate|height: [\d.]+px/);
  expect(css).not.toContain("--home-podium-winner-lift:");
  expect(css.split("/* Home desktop breakpoint */")[0]).toMatch(
    /\.race-podium-row--winner\s+\.race-podium-block\s*\{[^}]*padding-block: var\(--apex-space-6\);/,
  );
});
test("desktop podium reduces only block padding to reference-sized bars while retaining the winner lift", () => {
  const desktop = readFileSync(
    "src/design-system/home-fidelity.css",
    "utf8",
  ).split("/* Home desktop breakpoint */")[1];
  expect(desktop).toMatch(
    /\.home-race-result \.race-podium--aligned \.race-podium-block\s*\{[^}]*padding-block: var\(--apex-space-2\);/,
  );
  expect(desktop).toMatch(
    /\.race-podium-row--winner\s+\.race-podium-block\s*\{[^}]*padding-block: var\(--apex-space-7\);/,
  );
});
test("Option3 uses content-height grid and shared tokens for responsive expansion placement", () => {
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(css).toMatch(
    /grid-template-columns:\s*minmax\(0, 47fr\) minmax\(0, 27fr\) minmax\(0, 26fr\)/,
  );
  expect(css).toMatch(/\.home-expanded\s*\{[^}]*grid-column:\s*1 \/ -1/s);
  expect(css).toContain("--apex-size-overview-track-compact");
  expect(css).not.toMatch(/height:\s*100%/);
});
test("Home podium keeps each independently published driver and position together, replacing only points with nationality", () => {
  render(<View />);
  const podium = document.querySelector(".race-podium--aligned");
  for (const position of [1, 2, 3]) {
    const marker = within(podium)
      .getByText(`Position ${position}`)
      .closest(".race-podium-position");
    const row = marker.closest("li");
    expect(within(row).getByText(`Podium ${position}`)).toBeInTheDocument();
    expect(within(row).queryByText("25 PTS")).toBeNull();
    expect(row.querySelector(".race-podium-nationalities")).toBeInTheDocument();
    expect(row.querySelector(".race-podium-driver").parentElement).toBe(row);
    expect(marker.parentElement.parentElement).toBe(row);
  }
});
test("authoritative reference combines race header and podium inside the left panel, with opt-in shared-row podium", () => {
  render(<View />);
  const race = screen.getByRole("region", { name: "Race result" });
  expect(
    within(race).getByRole("heading", { name: event.name }),
  ).toBeInTheDocument();
  expect(
    within(race).getByRole("link", { name: "Open race detail" }),
  ).toBeInTheDocument();
  expect(within(race).getByRole("list")).toHaveClass("race-podium--aligned");
  expect(race.parentElement).toBe(
    screen.getByRole("region", { name: "Drivers’ championship" }).parentElement,
  );
});
test("unknown published rank is a labelled dash, never zero-padded uncertainty", () => {
  render(
    <LeaderList
      kind="drivers"
      year={2000}
      entries={[
        {
          id: "unranked",
          rank: null,
          points: "0",
          entity: { displayName: "Independent driver" },
        },
      ]}
    />,
  );
  expect(screen.getByText("Rank not supplied")).toHaveClass("sr-only");
  expect(
    screen.getByText("Rank not supplied").nextElementSibling,
  ).toHaveTextContent("—");
  expect(screen.queryByText("0?")).toBeNull();
  expect(screen.getByText("0")).toBeInTheDocument();
});
test("missing published points remain explicit, while decimal points and real zero are unchanged", () => {
  render(
    <LeaderList
      kind="drivers"
      year={2000}
      entries={[
        {
          id: "missing",
          rank: 1,
          points: null,
          entity: { displayName: "Independent driver" },
        },
      ]}
    />,
  );
  expect(screen.getByText("Not supplied")).toBeInTheDocument();
});
test("no completed race has no actionable full-results control", () => {
  render(<View noEvent />);
  expect(screen.getByText("No completed race published")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Show full results" }),
  ).toBeNull();
});
test("missing published race session disables full results with an explanation", () => {
  state.noSession = true;
  render(<View />);
  expect(
    screen.getByRole("button", { name: "Show full results" }),
  ).toBeDisabled();
  expect(
    screen.getByText("Published race session not supplied."),
  ).toBeInTheDocument();
});
