import { afterEach, expect, test, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { archiveApi, objectResponse } from "../src/api/archiveApi";
import Explore from "../src/pages/Explore";
import Profile from "../src/pages/Profile";
import Compare, { ComparisonResult } from "../src/pages/Compare";
import EntityPicker from "../src/components/EntityPicker";
import contract from "../contracts/openapi.json";
const meta = {
  snapshotId: "stable",
  coverage: "partial",
  verification: "source-only",
  freshness: "fresh",
  sources: [],
  warnings: [],
};
const collection = (items, more = false) => ({
  data: {
    items,
    page: {
      total: items.length,
      hasMore: more,
      nextCursor: more ? "next" : null,
    },
  },
  meta,
});
const entity = {
  id: "driver:one",
  displayName: "Example Driver",
  clientPath: "/drivers/driver%3Aone",
};
const profile = {
  id: entity.id,
  entity,
  kind: "driver",
  aliases: [],
  nationality: null,
  birthDate: null,
  metrics: [],
  features: [],
};
const result = {
  ...contract.paths["/drivers/{id}/results"].get.responses["200"].content[
    "application/json"
  ].example.data.items[0],
  id: "result:one",
  sessionId: "session:one",
  entry: {
    id: "entry:one",
    drivers: [entity],
    constructor: { id: "constructor:one", displayName: "Example Team" },
  },
  position: null,
  points: "0.50",
  eventContext: {
    event: {
      id: "event:one",
      name: "Example Grand Prix",
      year: 2024,
      round: 1,
      schedule: { date: "2024-07-07" },
    },
    session: {
      id: "session:one",
      label: "Race",
      kind: "race",
      schedule: { date: "2024-07-07" },
    },
  },
};
let stores = [];
afterEach(() => {
  cleanup();
  stores.forEach((s) => s.dispatch(archiveApi.util.resetApiState()));
  stores = [];
  vi.unstubAllGlobals();
});
function Location() {
  return <output data-testid="location">{useLocation().search}</output>;
}
function mount(url) {
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  stores.push(store);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/explore" element={<Explore />} />
          <Route path="/drivers/:id" element={<Profile kind="driver" />} />
          <Route
            path="/constructors/:id"
            element={<Profile kind="constructor" />}
          />
          <Route path="/circuits/:id" element={<Profile kind="circuit" />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
        <Location />
      </MemoryRouter>
    </Provider>,
  );
}
function mock(handler) {
  const calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (req) => {
      const url = new URL(req.url);
      calls.push(url);
      const value = await handler(url);
      return new Response(JSON.stringify(value?.body || value), {
        status: value?.status || 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
  return calls;
}
const seasons = collection([
  { id: "season:2024", year: 2024 },
  { id: "season:2023", year: 2023 },
]);
test("entity endpoints match the pinned contract and nullable comparison mapping is preserved", () => {
  for (const path of [
    "/drivers/{id}",
    "/constructors/{id}/results",
    "/circuits/{id}/events",
    "/circuits/{id}/layouts",
    "/comparisons",
    "/search",
  ])
    expect(contract.paths[path]).toBeDefined();
  expect(
    objectResponse({ data: { comparison: null }, meta }, "comparison")
      .comparison,
  ).toBeNull();
  expect(() => objectResponse({ data: {}, meta }, "profile")).toThrow();
});
test("archive questions submit natural language and render an evidence-backed answer", async () => {
  const questionResult = {
    status: "answered",
    resolvedIntent: "event_winner",
    templateKey: "event_winner",
    values: {
      answer: "Example One won the Synthetic Grand Prix.",
      event: "Synthetic Grand Prix",
      driver: "Example One",
    },
    evidenceIds: ["evidence:one"],
  };
  const calls = mock((url) => {
    if (url.pathname.endsWith("/seasons")) return seasons;
    if (url.pathname.endsWith("/questions"))
      return { data: { questionResult }, meta };
    throw new Error(`Unexpected request: ${url}`);
  });
  mount("/explore?season=2024");
  expect(screen.getByText("Start with a question")).toBeInTheDocument();
  await userEvent.type(
    screen.getByLabelText("Question"),
    "Who won the Synthetic Grand Prix?",
  );
  await userEvent.click(screen.getByRole("button", { name: "Ask the archive" }));
  expect(
    await screen.findByText("Example One won the Synthetic Grand Prix."),
  ).toBeInTheDocument();
  expect(screen.getByText("Synthetic Grand Prix")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View source evidence" })).toHaveAttribute(
    "href",
    "/evidence/evidence%3Aone",
  );
  const request = calls.find((url) => url.pathname.endsWith("/questions"));
  expect(request).toBeTruthy();
  expect(screen.getByTestId("location")).toHaveTextContent(
    "?season=2024&q=Who+won+the+Synthetic+Grand+Prix%3F",
  );
});
test("existing archive question URLs load their answer", async () => {
  mock((url) => {
    if (url.pathname.endsWith("/seasons")) return seasons;
    if (url.pathname.endsWith("/questions"))
      return {
        data: {
          questionResult: {
            status: "answered",
            values: { answer: "Example One won." },
          },
        },
        meta,
      };
    throw new Error(`Unexpected request: ${url}`);
  });
  mount("/explore?season=2024&q=Who%20won%3F");
  expect(await screen.findByText("Example One won.")).toBeInTheDocument();
});
test("explore provides task-led browse paths before a search is entered", () => {
  mount("/explore?season=2024");
  expect(screen.getByRole("link", { name: "Find a race" })).toHaveAttribute(
    "href",
    "/calendar?season=2024",
  );
  expect(screen.getByRole("link", { name: "Browse drivers" })).toHaveAttribute(
    "href",
    "/standings?season=2024&kind=drivers",
  );
  expect(
    screen.getByRole("link", { name: "Browse published records" }),
  ).toHaveAttribute("href", "/records");
});
test("profile history keeps decimal points and resets pagination when the season changes", async () => {
  const calls = mock((url) =>
    url.pathname.endsWith("/seasons")
      ? seasons
      : url.pathname.endsWith("/results")
        ? collection([result], !url.searchParams.has("cursor"))
        : { data: { profile }, meta },
  );
  mount("/drivers/driver%3Aone?season=2024");
  await screen.findByRole("heading", { name: "Example Driver" });
  await screen.findByText("0.50");
  expect(
    await screen.findByRole("link", { name: "Example Grand Prix" }),
  ).toHaveAttribute("href", "/events/event%3Aone?season=2024");
  await userEvent.click(screen.getByRole("button", { name: "Next page" }));
  await waitFor(() =>
    expect(calls.filter((u) => u.pathname.endsWith("/results"))).toHaveLength(
      2,
    ),
  );
  const second = calls.filter((u) => u.pathname.endsWith("/results"))[1];
  expect(second.searchParams.get("year")).toBe("2024");
  expect(second.searchParams.get("snapshotId")).toBe("stable");
  await userEvent.selectOptions(
    screen.getByLabelText("History season"),
    "2023",
  );
  await waitFor(() =>
    expect(calls.some((u) => u.searchParams.get("year") === "2023")).toBe(true),
  );
  expect(screen.getByTestId("location")).not.toHaveTextContent("cursor");
});
test.each([
  ["constructor", "constructors"],
  ["circuit", "circuits"],
])("%s profile uses its own history shape", async (kind, plural) => {
  const p = {
    ...profile,
    kind,
    entity: { id: `${kind}:one`, displayName: "Selected record" },
  };
  mock((url) =>
    url.pathname.endsWith("/seasons")
      ? seasons
      : url.pathname.endsWith(kind === "circuit" ? "/events" : "/results")
        ? collection(
            kind === "circuit"
              ? [
                  {
                    id: "event:one",
                    name: "Example Grand Prix",
                    year: 2024,
                    round: 1,
                    schedule: { date: null },
                  },
                ]
              : [result],
          )
        : { data: { profile: p }, meta },
  );
  mount(`/${plural}/${kind}%3Aone?season=2024`);
  await screen.findByRole("heading", { name: "Selected record" });
  if (kind === "circuit")
    expect(
      await screen.findByRole("link", { name: "Example Grand Prix" }),
    ).toHaveAttribute("href", "/events/event%3Aone?season=2024");
  else await screen.findByText("0.50");
});
test("profile loading, missing-record errors and retry preserve the selection", async () => {
  let release;
  let attempt = 0;
  mock(async (url) => {
    if (url.pathname.endsWith("/seasons")) return seasons;
    attempt++;
    if (attempt === 1) {
      await new Promise((resolve) => {
        release = resolve;
      });
      return { status: 404, body: { error: { message: "missing" } } };
    }
    return { data: { profile }, meta };
  });
  mount("/drivers/driver%3Aone?season=2024");
  await waitFor(() => expect(release).toBeTypeOf("function"));
  expect(screen.getAllByText("Loading historical data").length).toBeGreaterThan(
    0,
  );
  release();
  await screen.findByText("Record not found");
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByRole("heading", { name: "Example Driver" });
  expect(screen.getByTestId("location")).toHaveTextContent("season=2024");
});
test("empty history and progression retain explicit missing data", async () => {
  const calls = mock((url) =>
    url.pathname.endsWith("/seasons")
      ? seasons
      : url.pathname.includes("progression") ||
          url.pathname.endsWith("/results")
        ? collection([])
        : { data: { profile }, meta },
  );
  mount("/drivers/driver%3Aone?season=2024");
  await screen.findByText("No records available");
  await userEvent.click(
    screen.getByRole("tab", { name: "Championship progression" }),
  );
  await waitFor(() =>
    expect(
      calls.some(
        (u) =>
          u.pathname === "/api/v1/seasons/2024/standings/drivers/progression" &&
          u.searchParams.get("entityId") === "driver:one",
      ),
    ).toBe(true),
  );
  await screen.findByText("No records available");
});
test("comparison deep link uses exact filters and renders unavailable metrics without zeros", async () => {
  const calls = mock((url) =>
    url.pathname.endsWith("/seasons")
      ? seasons
      : {
          data: { comparison: null },
          meta: {
            ...meta,
            coverage: "unavailable",
            warnings: [{ message: "Audited scoring is pending" }],
          },
        },
  );
  mount(
    "/compare?kind=driver&leftId=driver%3Aone&rightId=driver%3Atwo&fromYear=2023&toYear=2024&metric=points&run=1",
  );
  await screen.findByText("Comparison metrics unavailable");
  const req = calls.find((u) => u.pathname.endsWith("/comparisons"));
  expect(req.searchParams.get("metric")).toBe("points");
  expect(req.searchParams.get("fromYear")).toBe("2023");
  expect(req.searchParams.get("rightId")).toBe("driver:two");
  expect(screen.getByText("Audited scoring is pending")).toBeInTheDocument();
});
test("invalid comparison range or circuit points never issues an API comparison", async () => {
  const calls = mock(() => seasons);
  mount(
    "/compare?kind=circuit&leftId=circuit%3Aone&rightId=circuit%3Atwo&fromYear=2024&toYear=2023&metric=points&run=1",
  );
  await waitFor(() =>
    expect(
      screen.getAllByRole("option", { name: /^2024$/ }).length,
    ).toBeGreaterThan(0),
  );
  expect(
    screen.getByRole("button", { name: "Compare records" }),
  ).toBeDisabled();
  expect(calls.some((u) => u.pathname.endsWith("/comparisons"))).toBe(false);
  expect(
    screen.getByText("The start season must be no later than the end season."),
  ).toBeInTheDocument();
});
test("comparison data preserves exact supplied values and metric coverage", () => {
  render(
    <MemoryRouter>
      <ComparisonResult
        data={{
          meta,
          comparison: {
            left: { displayName: "Left" },
            right: { displayName: "Right" },
            fromYear: 2023,
            toYear: 2024,
            rows: [
              {
                metricKey: "points",
                left: { value: "0.50", unit: "points", coverage: "partial" },
                right: { value: null, unit: "points", coverage: "unavailable" },
              },
            ],
          },
        }}
      />
    </MemoryRouter>,
  );
  expect(
    screen.getByText("0.50 · points · partial coverage"),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Not supplied · points · unavailable coverage"),
  ).toBeInTheDocument();
});

test("reusable entity picker searches by name and writes the canonical selection", async () => {
  const calls = mock((url) =>
    url.pathname.endsWith("/search")
      ? collection([{ id: entity.id, kind: "driver", entity, context: null }])
      : seasons,
  );
  function PickerHarness() {
    const [value, setValue] = useState("");
    return (
      <>
        <EntityPicker
          label="Driver"
          kind="driver"
          value={value}
          onChange={(next) => setValue(next)}
        />
        <output data-testid="picked">{value}</output>
      </>
    );
  }
  render(
    <Provider
      store={configureStore({
        reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
        middleware: (g) => g().concat(archiveApi.middleware),
      })}
    >
      <PickerHarness />
    </Provider>,
  );
  const input = screen.getByRole("combobox", { name: "Driver" });
  await userEvent.type(input, "Example");
  await userEvent.click(
    await screen.findByRole("option", { name: /Example Driver/ }),
  );
  expect(screen.getByTestId("picked")).toHaveTextContent("driver:one");
  expect(screen.getByText("Example Driver")).toBeInTheDocument();
  expect(calls.some((url) => url.searchParams.get("q") === "Example")).toBe(
    true,
  );
});
