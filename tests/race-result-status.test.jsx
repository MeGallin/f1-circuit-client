import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { archiveApi } from "../src/api/archiveApi";
import { RaceResultStatus } from "../src/features/season/RaceResultStatusPanel";
import { raceResultStatus } from "../src/features/season/raceResultStatus";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const config = {
  enabled: true,
  graceMs: 6 * 60 * 60 * 1000,
  intervalMs: 15 * 60 * 1000,
  windowMs: 24 * 60 * 60 * 1000,
  anchor: "scheduled-race-start",
};

function event({ status = "upcoming", precision = "minute" } = {}) {
  return {
    id: "event:2026:british-grand-prix",
    year: 2026,
    name: "British Grand Prix",
    status,
    schedule: {
      startsAt: "2026-07-05T14:00:00.000Z",
      timePrecision: precision,
    },
  };
}

test("result-check timing comes from public API configuration and is start anchored", () => {
  const start = Date.parse(event().schedule.startsAt);
  const custom = {
    ...config,
    graceMs: 2 * 60 * 60 * 1000,
    intervalMs: 10 * 60 * 1000,
    windowMs: 8 * 60 * 60 * 1000,
  };
  expect(
    raceResultStatus(event(), start + 60 * 60 * 1000, [], custom).phase,
  ).toBe("grace");
  const active = raceResultStatus(
    event(),
    start + 2 * 60 * 60 * 1000,
    [],
    custom,
  );
  expect(active.phase).toBe("check-window");
  expect(active.activatesAt).toBe(start + 2 * 60 * 60 * 1000);
  expect(active.endsAt).toBe(start + 10 * 60 * 60 * 1000);
  expect(active.intervalMs).toBe(10 * 60 * 1000);
});

test("completed calendar status without persisted race rows is not treated as published", () => {
  const start = Date.parse(event().schedule.startsAt);
  const completed = event({ status: "completed" });

  expect(
    raceResultStatus(completed, start + 7 * 60 * 60 * 1000, [], config).phase,
  ).toBe("check-window");
  expect(
    raceResultStatus(
      completed,
      start + 7 * 60 * 60 * 1000,
      [{ id: "result-1" }],
      config,
    ).phase,
  ).toBe("published");
  expect(
    raceResultStatus(completed, start - 1, [{ id: "result-1" }], config).phase,
  ).toBe("before-start");
});

test("date-only calendar data cannot be used to estimate an automatic-check window", () => {
  expect(
    raceResultStatus(
      event({ precision: "date" }),
      Date.parse("2026-07-05T22:00:00.000Z"),
      [],
      config,
    ).phase,
  ).toBe("unknown-schedule");
});

function renderStatus({
  raceStatus,
  rows = [],
  now,
  publicConfig = config,
  publicationConfigFailures = 0,
  detailSessions,
  eventFailures = 0,
  resultFailures = 0,
  publishedRows = rows,
}) {
  const calls = [];
  const invalidations = [];
  let remainingConfigFailures = publicationConfigFailures;
  const eventId = event().id;
  const canonicalSession = `session:${eventId}:race`;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      const url = new URL(request.url);
      calls.push(url);
      const meta = { snapshotId: "latest-publication", coverage: "complete" };
      if (url.pathname.endsWith("/publication-config")) {
        if (remainingConfigFailures > 0) {
          remainingConfigFailures--;
          return new Response(
            JSON.stringify({ error: { message: "temporary config error" } }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        return new Response(
          JSON.stringify({ automaticRaceResults: publicConfig }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.pathname.endsWith(`/events/${encodeURIComponent(eventId)}`)) {
        if (eventFailures > 0) {
          eventFailures--;
          return new Response(
            JSON.stringify({ error: { message: "temporary event error" } }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        return new Response(
          JSON.stringify({
            data: {
              eventDetail: {
                event: event({ status: raceStatus }),
                sessions: detailSessions ?? [
                  {
                    id: canonicalSession,
                    kind: "race",
                    label: "Race",
                    sequence: 5,
                    status: raceStatus,
                    schedule: event().schedule,
                  },
                ],
                podium: [],
                winner: null,
                fastestLap: null,
                metrics: [],
              },
            },
            meta,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      if (
        url.pathname.endsWith(
          `/sessions/${encodeURIComponent(canonicalSession)}/results`,
        )
      ) {
        if (resultFailures > 0) {
          resultFailures--;
          return new Response(
            JSON.stringify({ error: { message: "temporary result error" } }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        return new Response(
          JSON.stringify({
            data: {
              items: publishedRows,
              page: {
                total: publishedRows.length,
                hasMore: false,
                nextCursor: null,
              },
            },
            meta,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
      throw new Error(`Unexpected archive request: ${url.pathname}`);
    }),
  );
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) =>
      g().concat(archiveApi.middleware, () => (next) => (action) => {
        if (action.type === "archiveApi/invalidateTags")
          invalidations.push(action);
        return next(action);
      }),
  });
  render(
    <Provider store={store}>
      <RaceResultStatus event={event({ status: raceStatus })} now={now} />
    </Provider>,
  );
  return {
    calls,
    invalidations,
    recoverPublicationConfig: () => {
      remainingConfigFailures = 0;
    },
  };
}

test("a completed event with empty results is shown as unpublished", async () => {
  const start = Date.parse(event().schedule.startsAt);
  const { calls } = renderStatus({
    raceStatus: "completed",
    rows: [],
    now: start + 7 * 60 * 60 * 1000,
  });

  expect(
    await screen.findByText(
      "No race-result rows are published in this archive yet.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByText(/every 15 minutes/i)).toBeInTheDocument();
  expect(
    screen.getByText(/not a live scheduler heartbeat/i),
  ).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveAttribute("data-state", "checking");
  expect(calls.some((url) => url.pathname.endsWith("/results"))).toBe(true);
  expect(calls.every((url) => !url.searchParams.has("snapshotId"))).toBe(true);
});

test("published rows invalidate overview summary and Event caches only once", async () => {
  const start = Date.parse(event().schedule.startsAt);
  const { invalidations } = renderStatus({
    raceStatus: "completed",
    rows: [],
    publishedRows: [{ id: "result-1" }],
    now: start + 7 * 60 * 60 * 1000,
  });

  expect(
    await screen.findByText("Published race results are now in this archive."),
  ).toBeInTheDocument();
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(invalidations).toHaveLength(1);
  expect(invalidations[0].payload).toEqual([
    { type: "Event", id: event().id },
    { type: "SeasonSummary", id: 2026 },
  ]);
  expect(screen.getByRole("status")).toHaveAttribute("data-state", "published");
});

test("race results are queried by canonical session id when event detail has no sessions", async () => {
  const start = Date.parse(event().schedule.startsAt);
  const { calls } = renderStatus({
    raceStatus: "completed",
    detailSessions: [],
    now: start + 7 * 60 * 60 * 1000,
  });

  expect(
    await screen.findByText(
      "No race-result rows are published in this archive yet.",
    ),
  ).toBeInTheDocument();
  expect(
    calls.some((url) =>
      url.pathname.endsWith(
        `/sessions/${encodeURIComponent(`session:${event().id}:race`)}/results`,
      ),
    ),
  ).toBe(true);
});

test("event-detail and result errors recover on the configured active-window cadence", async () => {
  const start = Date.parse(event().schedule.startsAt);
  const recoveryConfig = { ...config, intervalMs: 1000 };
  const { calls } = renderStatus({
    raceStatus: "completed",
    detailSessions: [],
    eventFailures: 1,
    resultFailures: 1,
    publishedRows: [{ id: "result-after-retry" }],
    publicConfig: recoveryConfig,
    now: start + 7 * 60 * 60 * 1000,
  });

  expect(
    await screen.findByText(/will retry during this configured window/i),
  ).toBeInTheDocument();
  await new Promise((resolve) => setTimeout(resolve, 1150));
  expect(
    await screen.findByText("Published race results are now in this archive."),
  ).toBeInTheDocument();
  expect(calls.filter((url) => url.pathname.endsWith("/results"))).toHaveLength(
    2,
  );
  expect(
    calls.filter((url) =>
      url.pathname.endsWith(`/events/${encodeURIComponent(event().id)}`),
    ).length,
  ).toBeGreaterThanOrEqual(2);
});

test("the grace period counts down using API timing configuration", async () => {
  const start = Date.parse(event().schedule.startsAt);
  renderStatus({
    raceStatus: "completed",
    rows: [],
    publicConfig: {
      ...config,
      graceMs: 2 * 60 * 60 * 1000,
      intervalMs: 10 * 60 * 1000,
      windowMs: 8 * 60 * 60 * 1000,
    },
    now: start + 60 * 60 * 1000,
  });

  expect(
    await screen.findByRole("timer", { name: /First check window opens in/ }),
  ).toBeInTheDocument();
  expect(screen.getByText(/scheduled for/i)).toBeInTheDocument();
});

test("active-window copy uses API cadence and duration rather than client defaults", async () => {
  const start = Date.parse(event().schedule.startsAt);
  renderStatus({
    raceStatus: "completed",
    publicConfig: {
      ...config,
      graceMs: 2 * 60 * 60 * 1000,
      intervalMs: 10 * 60 * 1000,
      windowMs: 8 * 60 * 60 * 1000,
    },
    now: start + 3 * 60 * 60 * 1000,
  });

  expect(
    await screen.findByText(/every 10 minutes for up to 8 hours/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/through 06 Jul 2026, 00:00 UTC/i),
  ).toBeInTheDocument();
});

test("disabled scheduler configuration does not claim automatic checks", async () => {
  const start = Date.parse(event().schedule.startsAt);
  renderStatus({
    raceStatus: "completed",
    now: start + 7 * 60 * 60 * 1000,
    publicConfig: { ...config, enabled: false },
  });
  expect(
    await screen.findByText(/Automatic race-result checks are not enabled/i),
  ).toBeInTheDocument();
  expect(screen.queryByText(/every 15 minutes/i)).not.toBeInTheDocument();
});

test("publication config retries a transient failure before enabling active-window copy", async () => {
  const start = Date.parse(event().schedule.startsAt);
  const { calls } = renderStatus({
    raceStatus: "completed",
    now: start + 7 * 60 * 60 * 1000,
    publicationConfigFailures: 1,
  });

  expect(
    await screen.findByText(/every 15 minutes for up to 24 hours/i),
  ).toBeInTheDocument();
  expect(
    calls.filter((url) => url.pathname.endsWith("/publication-config")),
  ).toHaveLength(2);
  expect(
    screen.queryByText(/timing configuration is unavailable/i),
  ).not.toBeInTheDocument();
});

test("unavailable publication config never claims scheduler timing or enabled state", async () => {
  const start = Date.parse(event().schedule.startsAt);
  const { calls } = renderStatus({
    raceStatus: "completed",
    now: start + 7 * 60 * 60 * 1000,
    publicationConfigFailures: 3,
  });

  expect(
    await screen.findByText(/API timing configuration is unavailable/i),
  ).toBeInTheDocument();
  await waitFor(() => {
    expect(
      calls.filter((url) => url.pathname.endsWith("/publication-config")),
    ).toHaveLength(3);
  });
  expect(screen.queryByText(/every 15 minutes/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/checks are enabled/i)).not.toBeInTheDocument();
});

test("publication config eventually recovers after bounded retries while the status stays mounted", async () => {
  vi.useFakeTimers();
  const start = Date.parse(event().schedule.startsAt);
  const { calls, recoverPublicationConfig } = renderStatus({
    raceStatus: "completed",
    now: start + 7 * 60 * 60 * 1000,
    publicationConfigFailures: 3,
  });

  await act(async () => {
    await vi.advanceTimersByTimeAsync(2_000);
  });
  expect(
    calls.filter((url) => url.pathname.endsWith("/publication-config")),
  ).toHaveLength(3);
  expect(
    screen.getByText(/API timing configuration is unavailable/i),
  ).toBeInTheDocument();

  recoverPublicationConfig();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30_000);
  });
  expect(
    calls.filter((url) => url.pathname.endsWith("/publication-config")),
  ).toHaveLength(4);
  expect(
    screen.getByText(/every 15 minutes for up to 24 hours/i),
  ).toBeInTheDocument();
});

test("a future event shows only its normal countdown, without result-status messaging", async () => {
  const start = Date.parse(event().schedule.startsAt);
  const { calls } = renderStatus({
    raceStatus: "upcoming",
    rows: [],
    now: start - 6 * 24 * 60 * 60 * 1000,
  });

  expect(
    await screen.findByRole("timer", { name: /Race starts in/ }),
  ).toBeInTheDocument();
  expect(screen.queryByText(/result check window/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/if enabled/i)).not.toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(calls.some((url) => url.pathname.endsWith("/results"))).toBe(false);
});
