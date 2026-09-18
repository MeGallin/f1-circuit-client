import { afterEach, expect, test, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, useLocation } from "react-router-dom";
import { archiveApi } from "../src/api/archiveApi";
import Overview from "../src/pages/Overview";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const makeStore = () =>
  configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
const envelope = (items, more = false) => ({
  data: {
    items,
    page: { hasMore: more, nextCursor: more ? "next-page" : null, total: 2 },
  },
  meta: { snapshotId: "catalogue-fixture", coverage: "complete", sources: [] },
});
test("season catalogue follows all backend pages under the same snapshot", async () => {
  const requests = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (req) => {
      const url = new URL(req.url);
      requests.push(url);
      return new Response(
        JSON.stringify(
          envelope(
            [{ year: url.searchParams.has("cursor") ? 1950 : 2026 }],
            !url.searchParams.has("cursor"),
          ),
        ),
        { headers: { "Content-Type": "application/json" } },
      );
    }),
  );
  const store = makeStore();
  const query = store.dispatch(archiveApi.endpoints.getSeasons.initiate());
  expect((await query).data.items.map((row) => row.year)).toEqual([2026, 1950]);
  expect(requests[1].searchParams.get("snapshotId")).toBe("catalogue-fixture");
  query.unsubscribe();
  store.dispatch(archiveApi.util.resetApiState());
});
test("missing runtime year is explicit and historical fallback is an intentional selection", async () => {
  const year = new Date().getUTCFullYear();
  const requests = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (req) => {
      const url = new URL(req.url);
      requests.push(url);
      return new Response(
        JSON.stringify(
          url.pathname.endsWith("/seasons")
            ? envelope([{ year: 2024, coverage: "partial", eventCount: 24 }])
            : {
                data: { seasonSummary: null },
                meta: { coverage: "unavailable", sources: [] },
              },
        ),
        { headers: { "Content-Type": "application/json" } },
      );
    }),
  );
  let location;
  function Probe() {
    location = useLocation();
    return null;
  }
  const store = makeStore();
  const view = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Probe />
        <Overview />
      </MemoryRouter>
    </Provider>,
  );
  await screen.findByText(`${year} is not in the season catalogue`);
  expect(screen.getByLabelText("Season")).toHaveValue(String(year));
  expect(location.search).toBe(`?season=${year}`);
  expect(requests.every((url) => url.pathname.endsWith("/seasons"))).toBe(true);
  await userEvent.click(
    screen.getByRole("link", { name: "Explore imported 2024 data" }),
  );
  await screen.findByText("No records available");
  expect(location.search).toBe("?season=2024");
  expect(
    requests.some((url) => url.pathname === "/api/v1/seasons/2024/summary"),
  ).toBe(true);
  view.unmount();
  store.dispatch(archiveApi.util.resetApiState());
});
