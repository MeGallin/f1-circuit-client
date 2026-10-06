import { afterEach, expect, test, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  within,
  fireEvent,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { archiveApi } from "../src/api/archiveApi";
import {
  RaceFocus,
  SeasonAroundRace,
} from "../src/features/season/SeasonPanels";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderCurrentAroundRace({
  events,
  latestCompletedEvent,
  nextEvent,
  now,
  calendarStatus = 200,
  calendarGate = Promise.resolve(),
}) {
  const meta = { snapshotId: "snapshot-fixture", coverage: "partial" };
  const collection = (items) => ({
    data: {
      items,
      page: { total: items.length, hasMore: false, nextCursor: null },
    },
    meta,
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      const url = new URL(request.url);
      if (url.pathname.endsWith("/publication-config"))
        return new Response(
          JSON.stringify({
            automaticRaceResults: {
              enabled: false,
              graceMs: 6 * 60 * 60 * 1000,
              intervalMs: 15 * 60 * 1000,
              windowMs: 24 * 60 * 60 * 1000,
              anchor: "scheduled-race-start",
            },
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      if (url.pathname.endsWith("/calendar")) {
        await calendarGate;
        return new Response(JSON.stringify(collection(events)), {
          status: calendarStatus,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.pathname.includes("/events/")) {
        const eventId = decodeURIComponent(url.pathname.split("/events/")[1]);
        const event =
          events.find((item) => item.id === eventId) || latestCompletedEvent;
        return new Response(
          JSON.stringify({
            data: {
              eventDetail: {
                event,
                sessions: [{ id: `session:${event.id}:race`, kind: "race" }],
                podium: [],
              },
            },
            meta,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.pathname.endsWith("/layouts"))
        return new Response(JSON.stringify(collection([])), {
          headers: { "Content-Type": "application/json" },
        });
      if (url.pathname.endsWith("/results"))
        return new Response(JSON.stringify(collection([])), {
          headers: { "Content-Type": "application/json" },
        });
      if (url.pathname.includes("/circuits/"))
        return new Response(
          JSON.stringify({
            data: { profile: { country: "Azerbaijan" } },
            meta,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      return new Response(JSON.stringify(collection([])), {
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <SeasonAroundRace
          now={now}
          snapshotId={meta.snapshotId}
          summary={{
            season: {
              year: 2026,
              eventCount: 23,
              resultsEventCount: latestCompletedEvent.round,
            },
            latestCompletedEvent,
            nextEvent,
            previousEvent: events[0],
            leadingDrivers: [],
            leadingConstructors: [],
          }}
          meta={meta}
        />
      </MemoryRouter>
    </Provider>,
  );
}

test.each([200, 503])(
  "calendar loading followed by status %s keeps empty/error feedback instead of invented counts",
  async (calendarStatus) => {
    let releaseCalendar;
    const calendarGate = new Promise((resolve) => {
      releaseCalendar = resolve;
    });
    renderCurrentAroundRace({
      events: [],
      latestCompletedEvent: {
        id: "event:2026:published",
        year: 2026,
        round: 16,
        name: "Published race",
        status: "completed",
        schedule: { date: "2026-10-04" },
      },
      nextEvent: null,
      now: "2026-10-06T12:00:00Z",
      calendarStatus,
      calendarGate,
    });
    expect(
      screen.queryByLabelText("Season races history"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    releaseCalendar();
    expect(
      await screen.findByText(
        calendarStatus === 503
          ? "We could not load this data"
          : "No records available",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Season races history"),
    ).not.toBeInTheDocument();
  },
);

test("ribbon and expanded cards open and close the existing event dialog without routing", async () => {
  const event = {
    id: "event:2026:long-race",
    year: 2026,
    round: 16,
    name: "Bahrain Grand Prix in Malaysia",
    status: "completed",
    features: [],
    schedule: {
      date: "2026-10-04",
      startsAt: "2026-10-04T07:00:00Z",
      timePrecision: "second",
    },
    circuit: { displayName: "Sepang International Circuit" },
  };
  renderCurrentAroundRace({
    events: [event],
    latestCompletedEvent: event,
    nextEvent: null,
    now: "2026-10-06T12:00:00Z",
  });
  const card = await screen.findByRole("button", {
    name: /Round 16:.*Latest results/,
  });
  card.focus();
  fireEvent.click(card);
  expect(
    await screen.findByRole("dialog", { name: event.name }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Close event details" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(card).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Show all rounds" }));
  fireEvent.click(
    screen.getByRole("button", { name: /Round 16:.*Latest results/ }),
  );
  expect(
    await screen.findByRole("dialog", { name: event.name }),
  ).toBeInTheDocument();
});

test("latest completed race keeps the published podium in the first overview card", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      const url = new URL(request.url);
      const meta = { snapshotId: "snapshot-fixture", coverage: "partial" };
      if (url.pathname.includes("/events/"))
        return new Response(
          JSON.stringify({
            data: {
              eventDetail: {
                podium: [
                  {
                    id: "result-1",
                    position: 1,
                    points: "25",
                    entry: {
                      drivers: [{ displayName: "Andrea Kimi Antonelli" }],
                      constructor: { displayName: "Mercedes" },
                    },
                  },
                  {
                    id: "result-2",
                    position: 2,
                    points: "18",
                    entry: {
                      drivers: [{ displayName: "Max Verstappen" }],
                      constructor: { displayName: "Red Bull" },
                    },
                  },
                  {
                    id: "result-3",
                    position: 3,
                    points: "15",
                    entry: {
                      drivers: [{ displayName: "Lando Norris" }],
                      constructor: { displayName: "McLaren" },
                    },
                  },
                ],
              },
            },
            meta,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      if (url.pathname.endsWith("/layouts"))
        return new Response(
          JSON.stringify({
            data: {
              items: [],
              page: { total: 0, hasMore: false, nextCursor: null },
            },
            meta,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      if (url.pathname.endsWith("/calendar"))
        return new Response(
          JSON.stringify({
            data: {
              items: [
                {
                  id: "event:2026:spanish-grand-prix",
                  name: "Spanish Grand Prix",
                  round: 14,
                  status: "completed",
                  schedule: {
                    date: "2026-09-13",
                    startsAt: null,
                    timePrecision: "date",
                  },
                  circuit: { displayName: "Madring" },
                },
              ],
              page: { total: 1, hasMore: false, nextCursor: null },
            },
            meta,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      return new Response(
        JSON.stringify({
          data: { profile: { country: "Spain" } },
          meta,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }),
  );
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <RaceFocus
          snapshotId="snapshot-fixture"
          summary={{
            season: { eventCount: 23, resultsEventCount: 14 },
            latestCompletedEvent: {
              id: "event:2026:spanish-grand-prix",
              name: "Spanish Grand Prix",
              year: 2026,
              round: 14,
              status: "completed",
              schedule: { date: "2026-09-13" },
              circuit: { id: "circuit:madring", displayName: "Madring" },
            },
            nextEvent: null,
          }}
        />
      </MemoryRouter>
    </Provider>,
  );
  expect(await screen.findByText("Andrea Kimi Antonelli")).toBeInTheDocument();
  expect(screen.getByText("Max Verstappen")).toBeInTheDocument();
  expect(screen.getByText("Lando Norris")).toBeInTheDocument();
  expect(screen.getByText("25 PTS")).toBeInTheDocument();
  expect(screen.getByText("Andrea Kimi Antonelli").closest("li")).toHaveClass(
    "race-podium-row--winner",
  );
  expect(
    screen.getByRole("heading", { name: "RACE RESULT" }),
  ).toBeInTheDocument();
  expect(screen.getByText("ROUND 14 OF 23")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Season races" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Select a race to view details and results."),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText("1 of 1 races have published results"),
  ).toBeInTheDocument();
});

test("current overview counts down to the next future start and keeps missing results visible", async () => {
  const previous = {
    id: "event:2026:azerbaijan-grand-prix",
    year: 2026,
    name: "Azerbaijan Grand Prix",
    round: 15,
    status: "completed",
    schedule: {
      date: "2026-09-26",
      startsAt: "2026-09-26T11:00:00Z",
      timePrecision: "second",
    },
    circuit: { id: "circuit:azerbaijan", displayName: "Baku City Circuit" },
  };
  const unpublished = {
    id: "event:2026:bahrain-grand-prix-in-malaysia",
    year: 2026,
    name: "Bahrain Grand Prix",
    round: 16,
    status: "scheduled",
    schedule: {
      date: "2026-10-04",
      startsAt: "2026-10-04T07:00:00Z",
      timePrecision: "second",
    },
    circuit: {
      id: "circuit:sepang",
      displayName: "Sepang International Circuit",
    },
  };
  const upcoming = {
    id: "event:2026:singapore-grand-prix",
    year: 2026,
    name: "Singapore Grand Prix",
    round: 17,
    status: "scheduled",
    schedule: {
      date: "2026-10-11",
      startsAt: "2026-10-11T12:00:00Z",
      timePrecision: "second",
    },
    circuit: {
      id: "circuit:singapore",
      displayName: "Marina Bay Street Circuit",
    },
  };
  const events = [previous, unpublished, upcoming];
  renderCurrentAroundRace({
    events,
    latestCompletedEvent: previous,
    nextEvent: unpublished,
    now: Date.parse("2026-10-05T19:46:00Z"),
  });

  const nextBand = await screen.findByLabelText("NEXT EVENT");
  expect(
    within(nextBand).getByText("Singapore Grand Prix"),
  ).toBeInTheDocument();
  expect(within(nextBand).getByRole("timer")).toBeInTheDocument();
  expect(screen.getAllByText("Bahrain Grand Prix").length).toBeGreaterThan(0);
  expect(
    await screen.findByText(
      "No race-result rows are published in this archive yet.",
    ),
  ).toBeInTheDocument();
});

test.each(["scheduled", "unknown"])(
  "final %s race still shows pending results with no future event",
  async (status) => {
    const year = new Date().getUTCFullYear();
    const previous = {
      id: "event:previous",
      year,
      name: "Previous race",
      round: 22,
      status: "completed",
      schedule: {
        startsAt: `${year}-09-01T12:00:00Z`,
        timePrecision: "second",
      },
      circuit: { id: "circuit:previous", displayName: "Previous circuit" },
    };
    const pending = {
      ...previous,
      id: "event:final",
      name: "Final race",
      round: 23,
      status,
      schedule: {
        startsAt: `${year}-10-01T12:00:00Z`,
        timePrecision: "second",
      },
    };
    renderCurrentAroundRace({
      events: [previous, pending],
      latestCompletedEvent: previous,
      nextEvent: pending,
      now:
        status === "unknown"
          ? `${year}-10-06T12:00:00Z`
          : Date.parse(`${year}-10-06T12:00:00Z`),
    });
    expect(
      await screen.findByText(
        "No race-result rows are published in this archive yet.",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByLabelText("PREVIOUS EVENT")).getByText("Final race"),
    ).toBeInTheDocument();
  },
);

test("older unknown race does not show pending results after a newer completed race", async () => {
  const year = new Date().getUTCFullYear();
  const old = {
    id: "event:old",
    year,
    name: "Older race",
    round: 15,
    status: "unknown",
    schedule: { startsAt: `${year}-09-01T12:00:00Z`, timePrecision: "second" },
    circuit: { id: "circuit:old", displayName: "Older circuit" },
  };
  const completed = {
    ...old,
    id: "event:completed",
    name: "Completed race",
    round: 16,
    status: "completed",
    schedule: { startsAt: `${year}-10-01T12:00:00Z`, timePrecision: "second" },
  };
  const future = {
    ...old,
    id: "event:future",
    name: "Future race",
    round: 17,
    status: "scheduled",
    schedule: { startsAt: `${year}-10-11T12:00:00Z`, timePrecision: "second" },
  };
  renderCurrentAroundRace({
    events: [old, completed, future],
    latestCompletedEvent: completed,
    nextEvent: future,
    now: Date.parse(`${year}-10-06T12:00:00Z`),
  });
  const previousBand = await screen.findByLabelText("PREVIOUS EVENT");
  expect(within(previousBand).getByText("Older race")).toBeInTheDocument();
  expect(
    within(previousBand).queryByText(
      "No race-result rows are published in this archive yet.",
    ),
  ).not.toBeInTheDocument();
});

test("published current result stays in focus without duplicating in previous event", async () => {
  const previous = {
    id: "event:2026:azerbaijan-grand-prix",
    year: 2026,
    name: "Azerbaijan Grand Prix",
    round: 15,
    status: "completed",
    schedule: {
      date: "2026-09-26",
      startsAt: "2026-09-26T11:00:00Z",
      timePrecision: "second",
    },
    circuit: { id: "circuit:azerbaijan", displayName: "Baku City Circuit" },
  };
  const current = {
    id: "event:2026:sepang-grand-prix",
    year: 2026,
    name: "Sepang Grand Prix",
    round: 16,
    status: "completed",
    schedule: {
      date: "2026-10-04",
      startsAt: "2026-10-04T07:00:00Z",
      timePrecision: "second",
    },
    circuit: {
      id: "circuit:sepang",
      displayName: "Sepang International Circuit",
    },
  };
  const upcoming = {
    id: "event:2026:singapore-grand-prix",
    year: 2026,
    name: "Singapore Grand Prix",
    round: 17,
    status: "scheduled",
    schedule: {
      date: "2026-10-11",
      startsAt: "2026-10-11T12:00:00Z",
      timePrecision: "second",
    },
    circuit: {
      id: "circuit:singapore",
      displayName: "Marina Bay Street Circuit",
    },
  };
  renderCurrentAroundRace({
    events: [previous, current, upcoming],
    latestCompletedEvent: current,
    nextEvent: null,
    now: Date.parse("2026-10-05T19:46:00Z"),
  });

  const previousBand = await screen.findByLabelText("PREVIOUS EVENT");
  expect(
    within(await screen.findByLabelText("NEXT EVENT")).getByText(
      "Singapore Grand Prix",
    ),
  ).toBeInTheDocument();
  expect(
    within(previousBand).getByText("Azerbaijan Grand Prix"),
  ).toBeInTheDocument();
  expect(
    within(previousBand).queryByText("Sepang Grand Prix"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(
      "No race-result rows are published in this archive yet.",
    ),
  ).not.toBeInTheDocument();
});
