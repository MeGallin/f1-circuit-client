import { afterEach, expect, test, vi } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { archiveApi } from "../src/api/archiveApi";
import Overview from "../src/pages/Overview";
import Calendar from "../src/pages/Calendar";
import RaceDetail from "../src/pages/RaceDetail";
import Standings from "../src/pages/Standings";
import { Skeleton, DataBoundary, Tabs } from "../src/components/ui";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
test.each([
  ["/", Overview],
  ["/calendar", Calendar],
  ["/events/test", RaceDetail],
  ["/standings", Standings],
])(
  "%s recovers from an actual request failure to an explicit empty response",
  async (path, Component) => {
    let fail = true;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify(
              fail
                ? { error: { code: "SERVICE_UNAVAILABLE" } }
                : {
                    data: path.startsWith("/events")
                      ? { eventDetail: null }
                      : {
                          items: [],
                          page: { total: 0, hasMore: false, nextCursor: null },
                        },
                    meta: {
                      coverage: "unavailable",
                      freshness: "unknown",
                      sources: [],
                    },
                  },
            ),
            {
              status: fail ? 503 : 200,
              headers: { "Content-Type": "application/json" },
            },
          ),
      ),
    );
    const store = configureStore({
      reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
      middleware: (g) => g().concat(archiveApi.middleware),
    });
    const view = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route
              path={path.startsWith("/events") ? "/events/:eventId" : path}
              element={<Component />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not load this data",
    );
    fail = false;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText(
      path.startsWith("/events")
        ? "No records available"
        : `${new Date().getUTCFullYear()} is not in the season catalogue`,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    view.unmount();
    store.dispatch(archiveApi.util.resetApiState());
  },
);
test("slow requests preserve the selection without making a time promise", () => {
  vi.useFakeTimers();
  render(<Skeleton />);
  expect(screen.getByRole("status")).toHaveTextContent(
    "Loading historical data",
  );
  act(() => vi.advanceTimersByTime(8000));
  expect(screen.getByRole("status")).toHaveTextContent(
    "Your selection is preserved",
  );
});
test("a stalled archive request times out and releases the loading state", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      (request) =>
        new Promise((_resolve, reject) => {
          request.signal.addEventListener(
            "abort",
            () => reject(request.signal.reason),
            { once: true },
          );
        }),
    ),
  );
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  const pending = store.dispatch(archiveApi.endpoints.getSeasons.initiate());
  await vi.advanceTimersByTimeAsync(75001);
  expect((await pending).error.status).toBe("TIMEOUT_ERROR");
  pending.unsubscribe();
  store.dispatch(archiveApi.util.resetApiState());
});
test("cached-empty refresh errors remain visible and expired-snapshot instructions survive", () => {
  render(
    <DataBoundary
      empty
      query={{
        currentData: { items: [] },
        isError: true,
        error: { status: 409 },
        refetch: vi.fn(),
      }}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("snapshot has changed");
  expect(screen.getByText("No records available")).toBeInTheDocument();
});
test("unknown tab selection remains reachable by keyboard with a labelled panel", () => {
  render(
    <Tabs
      label="Dataset"
      value="invalid"
      items={[{ value: "one", label: "One" }]}
      onChange={vi.fn()}
    >
      Choose a dataset
    </Tabs>,
  );
  expect(screen.getByRole("tab")).toHaveAttribute("tabindex", "0");
  expect(screen.getByRole("tabpanel", { name: "Dataset" })).toBeInTheDocument();
});
