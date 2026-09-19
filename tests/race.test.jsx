import { afterEach, expect, test, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import RaceDetail, {
  AdvancedRecords,
  ImpactPanel,
  RaceRecords,
  seriesWindowError,
  toUtcIso,
} from "../src/pages/RaceDetail";
import {
  archiveApi,
  eventResponse,
  sessionDatasets,
} from "../src/api/archiveApi";
import {
  duration,
  gapLabel,
  gridLabel,
} from "../src/features/season/raceFormat";
import contract from "../contracts/openapi.json";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
test("race formatting preserves missing values, exact times and distinct gap/grid meanings", () => {
  expect(duration(null)).toBe("Not supplied");
  expect(duration(0)).toBe("0:00.000");
  expect(duration(88293)).toBe("1:28.293");
  expect(duration(4947059)).toBe("1:22:27.059");
  expect(gapLabel({ kind: "laps", laps: 2 })).toBe("+2 laps");
  expect(gapLabel({ kind: "time", milliseconds: 1465 })).toBe("+1.465s");
  expect(gridLabel({ kind: "pit-lane" })).toBe("Pit lane");
  expect(
    eventResponse({
      data: { eventDetail: null },
      meta: { coverage: "unavailable" },
    }).detail,
  ).toBeNull();
  for (const dataset of sessionDatasets) {
    const route = contract.paths[`/sessions/{sessionId}/${dataset}`].get;
    expect(route.parameters.map((p) => p.name)).toEqual(
      expect.arrayContaining(["cursor", "limit", "snapshotId"]),
    );
  }
});
test("pit lane duration never substitutes for missing stationary duration", () => {
  render(
    <RaceRecords
      dataset="pit-stops"
      names={{ fixture: "Test driver" }}
      rows={[
        {
          id: "stop-fixture",
          entryId: "fixture",
          sequence: 1,
          lap: 12,
          laneDurationMs: 29000,
          stationaryDurationMs: null,
        },
      ]}
    />,
  );
  expect(
    screen.getByText("Pit lane duration").nextElementSibling,
  ).toHaveTextContent("0:29.000");
  expect(
    screen.getByText("Stationary duration").nextElementSibling,
  ).toHaveTextContent("Not supplied");
});
test("advanced session datasets retain exact values and publication boundaries", () => {
  render(
    <AdvancedRecords
      dataset="weather"
      rows={[
        {
          id: "weather-fixture",
          timestamp: "2024-07-07T14:00:00.000Z",
          observationKind: "trackside",
          airTemperatureC: 22.5,
          trackTemperatureC: null,
          humidityPercent: 61,
          rainfall: false,
          windSpeedMs: 3.2,
        },
      ]}
      names={{}}
    />,
  );
  expect(screen.getByText("22.5 °C")).toBeInTheDocument();
  expect(screen.getAllByText("Not supplied").length).toBeGreaterThan(0);
  expect(screen.getByText("No")).toBeInTheDocument();
  expect(screen.getByText(/14:00:00 UTC/)).toBeInTheDocument();
});
test("series requests require an explicit bounded UTC window", () => {
  expect(toUtcIso("2024-07-07T14:00")).toBe("2024-07-07T14:00:00.000Z");
  expect(
    seriesWindowError(
      "driver-fixture",
      "2024-07-07T14:00:00.000Z",
      "2024-07-07T14:00:59.000Z",
    ),
  ).toBe("");
  expect(
    seriesWindowError(
      "driver-fixture",
      "2024-07-07T14:00:00.000Z",
      "2024-07-07T14:02:01.000Z",
    ),
  ).toContain("120 seconds");
  expect(seriesWindowError("", null, null)).toContain("Choose a driver");
});
test("standings impact keeps unavailable reconciliation explicit", () => {
  render(
    <ImpactPanel
      query={{
        currentData: { impact: null },
        isSuccess: true,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: () => {},
      }}
    />,
  );
  expect(
    screen.getByText("Championship impact unavailable"),
  ).toBeInTheDocument();
});
test("lap pagination uses supported cursor/snapshot parameters and its URL survives a fresh mount", async () => {
  const meta = {
    snapshotId: "snapshot-fixture",
    coverage: "partial",
    freshness: "fresh",
    sources: [],
  };
  const session = {
    id: "session:fixture",
    kind: "race",
    label: "Race",
    status: "completed",
    schedule: { date: "2024-07-07" },
  };
  const detail = {
    event: {
      id: "event:fixture",
      name: "Test event",
      year: 2024,
      round: 12,
      status: "completed",
      schedule: { date: "2024-07-07" },
      circuit: null,
      features: [],
    },
    sessions: [session],
    winner: null,
    fastestLap: null,
  };
  const requests = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      const url = new URL(request.url);
      requests.push(url);
      let data;
      if (url.pathname.endsWith("/standings-impact")) data = { impact: null };
      else if (url.pathname.includes("/events/"))
        data = { eventDetail: detail };
      else if (url.pathname.endsWith("/laps")) {
        const next = url.searchParams.has("cursor");
        data = {
          items: [
            {
              id: next ? "lap2" : "lap1",
              entryId: "entry-fixture",
              lapNumber: next ? 2 : 1,
              durationMs: next ? 88002 : 88001,
              validity: "unknown",
              isPitInLap: null,
              isPitOutLap: null,
              sectors: [],
            },
          ],
          page: {
            total: 2,
            hasMore: !next,
            nextCursor: next ? null : "cursor-fixture",
          },
        };
      } else
        data = {
          items: [],
          page: { total: 0, hasMore: false, nextCursor: null },
        };
      return new Response(JSON.stringify({ data, meta }), {
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
  let sharedUrl;
  function LocationProbe() {
    const location = useLocation();
    sharedUrl = location.pathname + location.search;
    return null;
  }
  function mount(url) {
    const store = configureStore({
      reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
      middleware: (g) => g().concat(archiveApi.middleware),
    });
    const rendered = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[url]}>
          <LocationProbe />
          <Routes>
            <Route path="/events/:eventId" element={<RaceDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
    return () => {
      rendered.unmount();
      store.dispatch(archiveApi.util.resetApiState());
    };
  }
  const stop = mount("/events/event%3Afixture?season=2024&view=laps");
  await screen.findByText("1:28.001");
  await userEvent.click(screen.getByRole("button", { name: "Next page" }));
  await screen.findByText("1:28.002");
  expect(sharedUrl).toContain("cursor=cursor-fixture");
  expect(sharedUrl).toContain("snapshot=snapshot-fixture");
  expect(
    requests
      .filter((url) => url.pathname.endsWith("/laps"))
      .at(-1)
      .searchParams.get("limit"),
  ).toBe("20");
  const saved = sharedUrl;
  stop();
  const stopAgain = mount(saved);
  await screen.findByText("1:28.002");
  await userEvent.click(screen.getByRole("button", { name: "First page" }));
  await waitFor(() => expect(sharedUrl).not.toContain("cursor="));
  await screen.findByText("1:28.001");
  stopAgain();
});
