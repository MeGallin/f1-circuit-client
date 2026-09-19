import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Records from "../src/pages/Records";
import { archiveApi } from "../src/api/archiveApi";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function mount(url) {
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/records" element={<Records />} />
        </Routes>
        <Location />
      </MemoryRouter>
    </Provider>,
  );
}
function Location() {
  return <output data-testid="location">{useLocation().search}</output>;
}

test("records request preserves exact values, coverage and evidence snapshot", async () => {
  const calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      const url = new URL(request.url);
      calls.push(url);
      return new Response(
        JSON.stringify({
          data: {
            items: [
              {
                id: "metric:one",
                evidenceId: "evidence:one",
                key: "points",
                value: "0.50",
                unit: "points",
                definitionVersion: "rules:2024",
                scope: "driver",
                coverage: "partial",
              },
            ],
            page: { total: 1, hasMore: false, nextCursor: null },
          },
          meta: {
            snapshotId: "snapshot:one",
            coverage: "partial",
            freshness: "fresh",
            verification: "source-only",
            sources: [],
          },
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }),
  );
  mount("/records?scope=driver&metric=points&entityId=driver%3Aone");
  expect(await screen.findByText("0.50")).toBeInTheDocument();
  expect(screen.getByText("partial")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View evidence" })).toHaveAttribute(
    "href",
    "/evidence/evidence%3Aone?snapshot=snapshot%3Aone",
  );
  expect(calls[0].searchParams.get("scope")).toBe("driver");
  expect(calls[0].searchParams.get("metric")).toBe("points");
  expect(calls[0].searchParams.get("entityId")).toBe("driver:one");
});

test("records requires a valid target before requesting", async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          data: { items: [], page: { total: 0, hasMore: false, nextCursor: null } },
          meta: {
            snapshotId: "snapshot:empty",
            coverage: "unavailable",
            freshness: "unknown",
            verification: "source-only",
            sources: [],
          },
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
  );
  vi.stubGlobal("fetch", fetchMock);
  mount("/records?scope=season&metric=wins");
  expect(screen.getByText("Choose a season")).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText("Season year"), "2024");
  await userEvent.click(screen.getByRole("button", { name: "Show record" }));
  expect(await screen.findByText("No published record")).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
