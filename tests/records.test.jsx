import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
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
  const firstTable = await screen.findByRole("table");
  expect(within(firstTable).getByText("0.50")).toBeInTheDocument();
  expect(screen.getAllByText("Partial coverage").length).toBeGreaterThan(0);
  expect(
    screen.getAllByRole("link", { name: /View points evidence/ })[0],
  ).toHaveAttribute(
    "href",
    "/evidence/evidence%3Aone?snapshot=snapshot%3Aone&from=%2Frecords%3Fscope%3Ddriver%26metric%3Dpoints%26entityId%3Ddriver%253Aone",
  );
  expect(screen.getByRole("table").querySelector("caption")).toHaveTextContent(
    "Points for driver:one, All published archive records",
  );
  const recordsRequest = calls.find((url) => url.pathname.endsWith("/records"));
  expect(recordsRequest.searchParams.get("scope")).toBe("driver");
  expect(recordsRequest.searchParams.get("metric")).toBe("points");
  expect(recordsRequest.searchParams.get("entityId")).toBe("driver:one");
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
            warnings: [
              {
                code: "HISTORICAL_METRIC_NOT_QUALIFIED",
                message: "This metric requires audited historical credit and scoring rules.",
              },
            ],
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
  expect(await screen.findByText("This metric is not published yet")).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("records pagination carries the snapshot cursor and filter changes reset it", async () => {
  const calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      const url = new URL(request.url);
      calls.push(url);
      const secondPage = url.searchParams.get("cursor") === "next-records";
      return new Response(
        JSON.stringify({
          data: {
            items: [
              {
                id: secondPage ? "metric:two" : "metric:one",
                key: "wins",
                value: secondPage ? "2" : "1",
                unit: "wins",
                coverage: "complete",
              },
            ],
            page: {
              total: 2,
              hasMore: !secondPage,
              nextCursor: secondPage ? null : "next-records",
            },
          },
          meta: {
            snapshotId: "snapshot:records",
            coverage: "complete",
            freshness: "fresh",
            verification: "source-only",
            sources: [],
          },
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }),
  );
  mount("/records?scope=driver&metric=wins&entityId=driver%3Aone");
  const firstTable = await screen.findByRole("table");
  expect(within(firstTable).getByText("1")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Next page" }));
  const secondTable = await screen.findByRole("table");
  expect(within(secondTable).getByText("2")).toBeInTheDocument();
  const recordsRequests = calls.filter((url) => url.pathname.endsWith("/records"));
  expect(recordsRequests[1].searchParams.get("cursor")).toBe("next-records");
  expect(recordsRequests[1].searchParams.get("snapshotId")).toBe("snapshot:records");
  await userEvent.click(screen.getByRole("button", { name: "First page" }));
  expect(screen.getByTestId("location")).not.toHaveTextContent("cursor");
});

test("records keep draft scope and metric changes out of the URL until submit", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: { items: [], page: { total: null, hasMore: false, nextCursor: null } },
          meta: {
            snapshotId: "snapshot:empty",
            coverage: "unavailable",
            freshness: "unknown",
            verification: "unassessed",
            warnings: [
              {
                code: "HISTORICAL_METRIC_NOT_QUALIFIED",
                message: "This metric requires audited historical credit and scoring rules.",
              },
            ],
            sources: [],
          },
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    ),
  );
  mount("/records?season=2026&scope=driver&metric=wins&entityId=driver%3Aone");
  expect(await screen.findByText("This metric is not published yet")).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByLabelText("Scope"), "constructor");
  await userEvent.selectOptions(screen.getByLabelText("Metric"), "points");
  expect(screen.getByTestId("location")).toHaveTextContent(
    "scope=driver&metric=wins&entityId=driver%3Aone",
  );
  expect(screen.getByLabelText("Constructor target")).toHaveValue("");
});

test("entity picker supports keyboard selection before applying a record target", async () => {
  const fetchMock = vi.fn(async (request) => {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/search")) {
      return new Response(
        JSON.stringify({
          data: {
            items: [
              {
                id: "driver:nico",
                kind: "driver",
                entity: { displayName: "Nico Rosberg" },
                context: "2016",
              },
            ],
            page: { total: 1, hasMore: false, nextCursor: null },
          },
          meta: {},
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({
        data: { items: [], page: { total: null, hasMore: false, nextCursor: null } },
        meta: {
          snapshotId: "snapshot:empty",
          coverage: "unavailable",
          freshness: "unknown",
          verification: "unassessed",
          warnings: [
            {
              code: "HISTORICAL_METRIC_NOT_QUALIFIED",
              message: "This metric requires audited historical credit and scoring rules.",
            },
          ],
          sources: [],
        },
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  });
  vi.stubGlobal("fetch", fetchMock);
  mount("/records?scope=driver&metric=wins");
  const input = screen.getByLabelText("Driver target");
  await userEvent.type(input, "Nico");
  expect(await screen.findByRole("option", { name: /Nico Rosberg/ })).toBeInTheDocument();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  expect(screen.getByText("Nico Rosberg")).toBeInTheDocument();
  expect(screen.getByTestId("location")).toHaveTextContent("scope=driver&metric=wins");
  await userEvent.click(screen.getByRole("button", { name: "Show record" }));
  expect(await screen.findByText("This metric is not published yet")).toBeInTheDocument();
  expect(screen.getByTestId("location")).toHaveTextContent("entityId=driver%3Anico");
});
