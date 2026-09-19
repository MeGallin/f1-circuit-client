import { afterEach, expect, test, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { archiveApi } from "../src/api/archiveApi";
import { RaceFocus } from "../src/features/season/SeasonPanels";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
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
            data: { items: [], page: { total: 0, hasMore: false, nextCursor: null } },
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
  expect(screen.getByRole("heading", { name: "RACE RESULT" })).toBeInTheDocument();
  expect(screen.getByText("ROUND 14 OF 23")).toBeInTheDocument();
  expect(screen.getByText("EVENTS")).toBeInTheDocument();
  expect(screen.getByText("14")).toBeInTheDocument();
});
