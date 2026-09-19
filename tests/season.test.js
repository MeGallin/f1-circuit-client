import { afterEach, expect, test, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import {
  archiveApi,
  collectionResponse,
  summaryResponse,
} from "../src/api/archiveApi";
import {
  isScopedSeason,
  seasonImportStatus,
  seasonOptionLabel,
  selectSeasonOptions,
  selectedSeason,
  focusEvent,
  previewCalendar,
  dateLabel,
} from "../src/features/season/selectors";
import contract from "../contracts/openapi.json";

afterEach(() => vi.unstubAllGlobals());
test("selection uses only published seasons and refuses unavailable explicit selections", () => {
  const seasons = [
    { year: 2023, isCurrent: false },
    { year: 2024, isCurrent: false },
  ];
  expect(selectedSeason(seasons, null, 2026)).toBe(2026);
  expect(selectedSeason(seasons, null, 2027)).toBe(2027);
  expect(selectedSeason(seasons, "2023")).toBe(2023);
  expect(selectedSeason(seasons, "2025", 2026)).toBeNull();
  expect(selectedSeason([{ year: 1999 }], "1999", 2026)).toBeNull();
  expect(selectedSeason([], null, 2026)).toBe(2026);
  expect(selectedSeason(seasons, "", 2026)).toBeNull();
  expect(isScopedSeason(2000)).toBe(true);
  expect(isScopedSeason(1999)).toBe(false);
  expect(
    selectSeasonOptions({
      items: [
        { year: 1999, coverage: "complete" },
        { year: 2000, coverage: "partial", eventCount: 17, completedCount: 17 },
        { year: 2026, coverage: "partial", eventCount: 23, completedCount: 14 },
      ],
    }),
  ).toEqual([
    {
      value: "2026",
      label: "2026 · Current year",
    },
    {
      value: "2000",
      label: "2000",
    },
  ]);
  expect(seasonImportStatus({ coverage: "unavailable" })).toBe("Not imported");
  expect(
    seasonImportStatus({
      coverage: "unavailable",
      eventCount: 23,
      completedCount: 14,
    }),
  ).toBe("Partial import · 14/23 rounds");
  expect(
    seasonOptionLabel({ year: 2026, eventCount: 23, completedCount: 14 }, 2026),
  ).toContain("Current year");
  expect(
    focusEvent({ nextEvent: null, latestCompletedEvent: { id: "fixture" } }),
  ).toEqual({ id: "fixture" });
  expect(
    focusEvent({ nextEvent: null, latestCompletedEvent: null }),
  ).toBeNull();
});
test("calendar preview preserves source order and UTC dates", () => {
  const rows = Array.from({ length: 6 }, (_, i) => ({ id: String(i) }));
  expect(previewCalendar(rows, "3").map((r) => r.id)).toEqual([
    "2",
    "3",
    "4",
    "5",
  ]);
  expect(dateLabel("2024-07-07")).toBe("07 Jul 2024");
});
test("contract envelopes keep metadata and exact fractional points unchanged", () => {
  const meta = {
    coverage: "partial",
    verification: "source-only",
    snapshotId: "fixture",
  };
  const page = { total: 1, nextCursor: null, hasMore: false };
  const data = collectionResponse({
    data: { items: [{ points: "0.5" }], page },
    meta,
  });
  expect(data.items[0].points).toBe("0.5");
  expect(data.meta).toBe(meta);
  expect(
    summaryResponse({ data: { seasonSummary: null }, meta }).summary,
  ).toBeNull();
  expect(() => collectionResponse({ data: { items: [] } })).toThrow();
  for (const path of [
    "/seasons",
    "/seasons/{year}/summary",
    "/seasons/{year}/calendar",
  ])
    expect(contract.paths[path].get).toBeDefined();
});
test("RTK Query deduplicates data, retains provenance and supports explicit retry", async () => {
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  const mock = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { code: "SERVICE_UNAVAILABLE" } }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    )
    .mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              items: [],
              page: { total: 0, nextCursor: null, hasMore: false },
            },
            meta: {
              coverage: "unavailable",
              verification: "unassessed",
              snapshotId: "fixture",
            },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
    );
  vi.stubGlobal("fetch", mock);
  const first = store.dispatch(archiveApi.endpoints.getSeasons.initiate());
  expect((await first).error.status).toBe(503);
  const retry = await first.refetch();
  expect(retry.data.items).toEqual([]);
  const cached = store.dispatch(archiveApi.endpoints.getSeasons.initiate());
  await cached;
  expect(mock).toHaveBeenCalledTimes(2);
  expect(new URL(mock.mock.calls[0][0].url).pathname).toBe("/api/v1/seasons");
  expect(new URL(mock.mock.calls[0][0].url).searchParams.get("limit")).toBe(
    "200",
  );
  first.unsubscribe();
  cached.unsubscribe();
  store.dispatch(archiveApi.util.resetApiState());
});
