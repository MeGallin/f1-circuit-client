import { afterEach, expect, test, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Standings, { StandingRows, validRound } from "../src/pages/Standings";
import { archiveApi } from "../src/api/archiveApi";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test.each(["", "&round=12"])(
  "standings pagination preserves initial selection filters %s",
  async (selection) => {
    const requests = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (request) => {
        const url = new URL(request.url);
        requests.push(url);
        const standings = url.pathname.includes("/standings/");
        const next = url.searchParams.has("cursor");
        const items = url.pathname.endsWith("/seasons")
          ? [{ year: 2024 }]
          : url.pathname.endsWith("/calendar")
            ? [{ round: 12 }]
            : [
                {
                  id: next ? "second" : "first",
                  rank: next ? 51 : 1,
                  entity: {
                    displayName: next
                      ? "Second page driver"
                      : "First page driver",
                  },
                  constructors: [],
                  points: null,
                  wins: 0,
                  podiums: null,
                  standingSnapshotId: "standing:2024:12",
                },
              ];
        return new Response(
          JSON.stringify({
            data: {
              items,
              page: {
                total: standings ? 51 : items.length,
                hasMore: standings && !next,
                nextCursor: standings && !next ? "page-two" : null,
              },
            },
            meta: { snapshotId: "stable", coverage: "partial", sources: [] },
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }),
    );
    const store = configureStore({
      reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
      middleware: (g) => g().concat(archiveApi.middleware),
    });
    const view = render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[`/standings?season=2024&kind=drivers${selection}`]}
        >
          <Standings />
        </MemoryRouter>
      </Provider>,
    );
    await screen.findByText("First page driver");
    expect(screen.getByText("Points").nextElementSibling).toHaveTextContent(
      "Not supplied",
    );
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    await screen.findByText("Second page driver");
    await waitFor(() =>
      expect(
        requests.filter((url) => url.pathname.includes("/standings/")),
      ).toHaveLength(2),
    );
    const [first, second] = requests.filter((url) =>
      url.pathname.includes("/standings/"),
    );
    const filters = (url) =>
      Object.fromEntries(
        [...url.searchParams].filter(
          ([key]) => !["cursor", "snapshotId"].includes(key),
        ),
      );
    expect(filters(second)).toEqual(filters(first));
    expect(second.searchParams.get("snapshotId")).toBe("stable");
    expect(second.searchParams.has("standingSnapshotId")).toBe(false);
    view.unmount();
    store.dispatch(archiveApi.util.resetApiState());
  },
);
test("standings retain exact points and missing stats without replacing them with zero", () => {
  render(
    <StandingRows
      kind="drivers"
      rows={[
        {
          id: "fixture",
          rank: null,
          entity: { displayName: "Test driver" },
          constructors: [],
          points: "0.50",
          wins: 0,
          podiums: null,
        },
      ]}
    />,
  );
  expect(screen.getByText("0.50")).toBeInTheDocument();
  expect(screen.getByText("Wins").nextElementSibling).toHaveTextContent("0");
  expect(screen.getByText("Podiums").nextElementSibling).toHaveTextContent(
    "Not supplied",
  );
  expect(validRound(null)).toBe(true);
  expect(validRound("12")).toBe(true);
  for (const value of ["", "0", "-1", "1.5", "abc"])
    expect(validRound(value)).toBe(false);
});
test("round-specific empty standings never fall back to latest and switching kinds retains the round", async () => {
  const meta = {
    snapshotId: "fixture",
    coverage: "unavailable",
    freshness: "unknown",
    sources: [],
  };
  const requests = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      const url = new URL(request.url);
      requests.push(url);
      const items = url.pathname.endsWith("/seasons")
        ? [{ year: 2024, isCurrent: false }]
        : url.pathname.endsWith("/calendar")
          ? [{ round: 11 }, { round: 12 }]
          : [];
      return new Response(
        JSON.stringify({
          data: {
            items,
            page: { total: items.length, hasMore: false, nextCursor: null },
          },
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
  const view = render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={["/standings?season=2024&kind=drivers&round=11"]}
      >
        <Standings />
      </MemoryRouter>
    </Provider>,
  );
  await screen.findByText("No records available");
  expect(screen.getByLabelText("Standings after")).toHaveValue("11");
  await userEvent.click(
    screen.getByRole("tab", { name: "Constructors", exact: true }),
  );
  await screen.findByText("No records available");
  const standings = requests.filter((url) =>
    url.pathname.includes("/standings/"),
  );
  expect(standings.map((url) => url.pathname)).toEqual([
    "/api/v1/seasons/2024/standings/drivers",
    "/api/v1/seasons/2024/standings/constructors",
  ]);
  expect(standings.every((url) => url.searchParams.get("round") === "11")).toBe(
    true,
  );
  view.unmount();
  store.dispatch(archiveApi.util.resetApiState());
});
