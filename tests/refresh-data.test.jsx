import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { archiveApi } from "../src/api/archiveApi";
import {
  SeasonDataRefresh,
  refreshErrorMessage,
} from "../src/features/season/SeasonDataRefresh";

test("source timeout feedback is actionable and hides raw transport details", () => {
  const message = refreshErrorMessage({
    status: "TIMEOUT_ERROR",
    error: "TimeoutError: signal timed out",
  });
  expect(message).toBe(
    "The source check took too long. Your published data is still available. Try again shortly.",
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function makeStore() {
  return configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(archiveApi.middleware),
  });
}

function outcome(status, extras = {}) {
  return {
    status,
    message: `${status} source response`,
    checkedAt: null,
    publicationId: null,
    ...extras,
  };
}

function stubRefreshResponse(body, status = 200) {
  const requests = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      requests.push({
        pathname: new URL(request.url).pathname,
        method: request.method,
        body: request.method === "POST" ? await request.json() : null,
      });
      return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
  return requests;
}

test.each([
  ["updated", "Updated", "updated source response"],
  ["unchanged", "Unchanged", "unchanged source response"],
  ["pending", "Pending", "pending source response"],
  ["busy", "Busy", "busy source response"],
  ["cooldown", "Cooldown", "cooldown source response"],
  ["no-race", "No race", "no-race source response"],
])(
  "current season refresh reports the %s outcome and posts the season",
  async (status, label, message) => {
    const year = new Date().getUTCFullYear();
    const requests = stubRefreshResponse(
      outcome(
        status,
        status === "updated"
          ? { publicationId: "private-publication-id" }
          : status === "cooldown"
            ? { retryAfterMs: 90_000 }
            : {},
      ),
    );
    const onArchiveRefresh = vi.fn();
    const user = userEvent.setup();
    render(
      <Provider store={makeStore()}>
        <SeasonDataRefresh year={year} onArchiveRefresh={onArchiveRefresh} />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: "Refresh data" }));
    if (status === "cooldown") {
      expect(await screen.findByRole("timer")).toHaveTextContent(
        "Refresh available in 1:30",
      );
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    } else {
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(message),
      );
      expect(screen.getByRole("status")).toHaveTextContent(label);
    }
    expect(onArchiveRefresh).toHaveBeenCalledOnce();
    expect(
      screen.queryByText(/private-publication-id/),
    ).not.toBeInTheDocument();
    expect(requests.filter((request) => request.method === "POST")).toEqual([
      {
        pathname: "/api/v1/refresh-data",
        method: "POST",
        body: { season: year },
      },
    ]);
    expect(
      requests.some((request) =>
        request.pathname.endsWith("/publication-config"),
      ),
    ).toBe(["updated", "unchanged", "pending"].includes(status));
  },
);

test("busy and cooldown outcomes show the server retry delay", async () => {
  const year = new Date().getUTCFullYear();
  stubRefreshResponse(
    outcome("cooldown", {
      retryAfterMs: 90_000,
      message: "A source check is not due.",
    }),
  );
  const user = userEvent.setup();
  render(
    <Provider store={makeStore()}>
      <SeasonDataRefresh year={year} onArchiveRefresh={vi.fn()} />
    </Provider>,
  );

  await user.click(screen.getByRole("button", { name: "Refresh data" }));
  expect(await screen.findByRole("timer")).toHaveTextContent(
    "Refresh available in 1:30",
  );
  expect(
    screen.queryByRole("button", { name: "Refresh data" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("A source check is not due."),
  ).not.toBeInTheDocument();
});

test.each(["cooldown", "updated", "unchanged", "pending", "busy"])(
  "%s uses the server countdown and restores refresh automatically",
  async (status) => {
    vi.useFakeTimers();
    const year = new Date().getUTCFullYear();
    stubRefreshResponse(outcome(status, { retryAfterMs: 2200 }));
    render(
      <Provider store={makeStore()}>
        <SeasonDataRefresh year={year} onArchiveRefresh={vi.fn()} />
      </Provider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Refresh data" }));
    });
    expect(screen.getByRole("timer")).toHaveTextContent(
      "Refresh available in 0:03",
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent(
      "Refresh available in 0:02",
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh data" })).toBeEnabled();
  },
);

test("changing season removes the cooldown timer and leaves historical refresh available", async () => {
  const year = new Date().getUTCFullYear();
  const store = makeStore();
  stubRefreshResponse(outcome("cooldown", { retryAfterMs: 90_000 }));
  const onArchiveRefresh = vi.fn();
  const view = render(
    <Provider store={store}>
      <SeasonDataRefresh year={year} onArchiveRefresh={onArchiveRefresh} />
    </Provider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Refresh data" }));
  await screen.findByRole("timer");
  view.rerender(
    <Provider store={store}>
      <SeasonDataRefresh year={year - 1} onArchiveRefresh={onArchiveRefresh} />
    </Provider>,
  );
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Refresh data" }));
  expect(onArchiveRefresh).toHaveBeenCalledTimes(2);
  view.rerender(
    <Provider store={store}>
      <SeasonDataRefresh year={year} onArchiveRefresh={onArchiveRefresh} />
    </Provider>,
  );
  expect(screen.getByRole("button", { name: "Refresh data" })).toBeEnabled();
});

test("unmount clears the cooldown ticker", async () => {
  stubRefreshResponse(outcome("cooldown", { retryAfterMs: 90_000 }));
  const spy = vi.spyOn(globalThis, "clearInterval");
  const intervals = vi.spyOn(globalThis, "setInterval");
  const view = render(
    <Provider store={makeStore()}>
      <SeasonDataRefresh
        year={new Date().getUTCFullYear()}
        onArchiveRefresh={vi.fn()}
      />
    </Provider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Refresh data" }));
  await screen.findByRole("timer");
  const tickerIndex = intervals.mock.calls.findIndex(
    ([, delay]) => delay === 1000,
  );
  expect(tickerIndex).toBeGreaterThanOrEqual(0);
  const ticker = intervals.mock.results[tickerIndex].value;
  view.unmount();
  expect(spy).toHaveBeenCalledWith(ticker);
  spy.mockRestore();
  intervals.mockRestore();
});

test("a late source response cannot add a cooldown or reload the newly selected historical season", async () => {
  const year = new Date().getUTCFullYear();
  let finish;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    ),
  );
  const store = makeStore();
  const reload = vi.fn();
  const view = render(
    <Provider store={store}>
      <SeasonDataRefresh year={year} onArchiveRefresh={reload} />
    </Provider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Refresh data" }));
  await waitFor(() => expect(finish).toBeTypeOf("function"));
  view.rerender(
    <Provider store={store}>
      <SeasonDataRefresh year={year - 1} onArchiveRefresh={reload} />
    </Provider>,
  );
  await act(async () => {
    finish(
      new Response(
        JSON.stringify(outcome("unchanged", { retryAfterMs: 90_000 })),
        { headers: { "Content-Type": "application/json" } },
      ),
    );
  });
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Refresh data" })).toBeEnabled();
  expect(reload).not.toHaveBeenCalled();
});

test("source refresh disables its button while the request is running", async () => {
  const year = new Date().getUTCFullYear();
  let finishRequest;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise((resolve) => {
          finishRequest = resolve;
        }),
    ),
  );
  const user = userEvent.setup();
  render(
    <Provider store={makeStore()}>
      <SeasonDataRefresh year={year} onArchiveRefresh={vi.fn()} />
    </Provider>,
  );

  await user.click(screen.getByRole("button", { name: "Refresh data" }));
  expect(
    screen.getByRole("button", { name: "Checking source…" }),
  ).toBeDisabled();
  finishRequest(
    new Response(JSON.stringify(outcome("unchanged")), {
      headers: { "Content-Type": "application/json" },
    }),
  );
  expect(
    await screen.findByText("unchanged source response"),
  ).toBeInTheDocument();
});

test("provider errors are shown with their HTTP status and API message", async () => {
  const year = new Date().getUTCFullYear();
  stubRefreshResponse({ error: { message: "Provider unavailable" } }, 503);
  const onArchiveRefresh = vi.fn();
  const user = userEvent.setup();
  render(
    <Provider store={makeStore()}>
      <SeasonDataRefresh year={year} onArchiveRefresh={onArchiveRefresh} />
    </Provider>,
  );

  await user.click(screen.getByRole("button", { name: "Refresh data" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Source refresh failed (503): Provider unavailable",
  );
  expect(onArchiveRefresh).toHaveBeenCalledOnce();
});

test("historical season refresh remains a local archive refetch", async () => {
  const onArchiveRefresh = vi.fn();
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const user = userEvent.setup();
  render(
    <Provider store={makeStore()}>
      <SeasonDataRefresh
        year={new Date().getUTCFullYear() - 1}
        onArchiveRefresh={onArchiveRefresh}
      />
    </Provider>,
  );

  await user.click(screen.getByRole("button", { name: "Refresh data" }));
  expect(onArchiveRefresh).toHaveBeenCalledOnce();
  expect(fetch).not.toHaveBeenCalled();
});

test.each(["busy", "cooldown", "error"])(
  "%s refresh still reloads the database snapshot and invalidates cached season/session data",
  async (result) => {
    const year = new Date().getUTCFullYear();
    const paths = [];
    let summaryReads = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (request) => {
        const url = new URL(request.url);
        paths.push(url.pathname);
        if (url.pathname.endsWith("/refresh-data")) {
          return new Response(
            JSON.stringify(
              result === "error"
                ? { error: { message: "Provider unavailable" } }
                : outcome(
                    result,
                    result === "cooldown" ? { retryAfterMs: 90_000 } : {},
                  ),
            ),
            {
              status: result === "error" ? 503 : 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
        if (url.pathname.endsWith("/summary"))
          return new Response(
            JSON.stringify({
              data: { seasonSummary: null },
              meta: {
                snapshotId:
                  ++summaryReads === 1 ? "snapshot-before" : "snapshot-after",
              },
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        return new Response(
          JSON.stringify({
            data: {
              items: [],
              page: { total: 0, hasMore: false, nextCursor: null },
            },
            meta: { snapshotId: "publication-fixture" },
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }),
    );
    const store = makeStore();
    const summary = store.dispatch(
      archiveApi.endpoints.getSeasonSummary.initiate({ year }),
    );
    const calendar = store.dispatch(
      archiveApi.endpoints.getCalendar.initiate({ year }),
    );
    const session = store.dispatch(
      archiveApi.endpoints.getSessionData.initiate({
        sessionId: "event-race-session",
        dataset: "results",
      }),
    );
    await Promise.all([summary, calendar, session]);

    const onArchiveRefresh = vi.fn();
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <SeasonDataRefresh year={year} onArchiveRefresh={onArchiveRefresh} />
      </Provider>,
    );

    await user.click(screen.getByRole("button", { name: "Refresh data" }));
    if (result === "error") await screen.findByRole("alert");
    else await screen.findByRole(result === "cooldown" ? "timer" : "status");

    await waitFor(() => {
      expect(paths.filter((path) => path.endsWith("/summary"))).toHaveLength(2);
      expect(paths.filter((path) => path.endsWith("/calendar"))).toHaveLength(
        2,
      );
      expect(paths.filter((path) => path.endsWith("/results"))).toHaveLength(2);
    });
    expect(onArchiveRefresh).toHaveBeenCalledOnce();
    expect(
      archiveApi.endpoints.getSeasonSummary.select({ year })(store.getState())
        .data.meta.snapshotId,
    ).toBe("snapshot-after");

    summary.unsubscribe();
    calendar.unsubscribe();
    session.unsubscribe();
    store.dispatch(archiveApi.util.resetApiState());
  },
);
