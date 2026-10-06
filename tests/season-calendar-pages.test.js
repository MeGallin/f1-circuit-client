import { afterEach, expect, test, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { archiveApi } from "../src/api/archiveApi";
import { readFileSync } from "node:fs";

test("Calendar consumes the complete collection without obsolete cursor controls", () => {
  const source = readFileSync("src/pages/Calendar.jsx", "utf8");
  expect(source).toContain("useGetCalendarQuery({ year })");
  expect(source).not.toMatch(/setPages|<Pagination/);
});

test.each(["empty", "duplicate", "excess"])(
  "calendar rejects %s page progress without publishing misleading counts",
  async (failure) => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        calls++;
        return new Response(
          JSON.stringify({
            data: {
              items:
                failure === "empty" && calls === 1
                  ? []
                  : [
                      {
                        id: failure === "duplicate" ? "same" : `round-${calls}`,
                      },
                    ],
              page: {
                total: failure === "excess" ? 1 : 2,
                hasMore: calls === 1,
                nextCursor: calls === 1 ? "next" : null,
              },
            },
            meta: { snapshotId: "pinned" },
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }),
    );
    const store = calendarStore();
    const result = await store.dispatch(
      archiveApi.endpoints.getCalendar.initiate({ year: 2026 }),
    );
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(failure === "duplicate" ? 2 : 1);
    store.dispatch(archiveApi.util.resetApiState());
  },
);

afterEach(() => vi.unstubAllGlobals());

test("unavailable coverage accepts a null total and an omitted terminal cursor", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: { items: [], page: { total: null, hasMore: false } },
            meta: { snapshotId: "pinned", coverage: "unavailable" },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
    ),
  );
  const store = calendarStore();
  const result = await store.dispatch(
    archiveApi.endpoints.getCalendar.initiate({ year: 2000 }),
  );
  expect(result.error).toBeUndefined();
  expect(result.data.items).toEqual([]);
  expect(result.data.page).toEqual({
    total: null,
    hasMore: false,
    nextCursor: null,
  });
  store.dispatch(archiveApi.util.resetApiState());
});

function calendarStore() {
  return configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (getDefault) => getDefault().concat(archiveApi.middleware),
  });
}

test.each([
  {},
  { hasMore: 0, total: 1 },
  { hasMore: false, total: "1" },
  { hasMore: false, total: -1 },
  { hasMore: false, total: 2 },
])(
  "calendar rejects malformed/incomplete terminal page %j rather than publishing a partial collection",
  async (page) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              data: { items: [{ id: "only-one" }], page },
              meta: { snapshotId: "pinned" },
            }),
            { headers: { "Content-Type": "application/json" } },
          ),
      ),
    );
    const store = calendarStore();
    const result = await store.dispatch(
      archiveApi.endpoints.getCalendar.initiate({ year: 2026 }),
    );
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
    store.dispatch(archiveApi.util.resetApiState());
  },
);

test("calendar rejects a changing total within one pinned traversal", async () => {
  let calls = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      calls++;
      return new Response(
        JSON.stringify({
          data: {
            items: [{ id: `round-${calls}` }],
            page: {
              total: calls === 1 ? 2 : 3,
              hasMore: calls === 1,
              nextCursor: calls === 1 ? "next" : null,
            },
          },
          meta: { snapshotId: "pinned" },
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }),
  );
  const store = calendarStore();
  const result = await store.dispatch(
    archiveApi.endpoints.getCalendar.initiate({ year: 2026 }),
  );
  expect(result.data).toBeUndefined();
  expect(result.error).toBeDefined();
  store.dispatch(archiveApi.util.resetApiState());
});

test("RTK cancellation aborts a later in-flight page and never publishes accumulated rows", async () => {
  let pendingRequest;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      if (!new URL(request.url).searchParams.has("cursor"))
        return new Response(
          JSON.stringify({
            data: {
              items: [{ id: "first" }],
              page: { total: 2, hasMore: true, nextCursor: "next" },
            },
            meta: { snapshotId: "pinned" },
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      pendingRequest = request;
      return new Promise((_resolve, reject) =>
        request.signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        ),
      );
    }),
  );
  const store = calendarStore();
  const handle = store.dispatch(
    archiveApi.endpoints.getCalendar.initiate({ year: 2026 }),
  );
  await vi.waitFor(() => expect(pendingRequest).toBeDefined());
  handle.abort();
  const result = await handle;
  expect(pendingRequest.signal.aborted).toBe(true);
  expect(result.data).toBeUndefined();
  expect(result.error.name).toBe("AbortError");
  expect(fetch).toHaveBeenCalledTimes(2);
  store.dispatch(archiveApi.util.resetApiState());
});
test.each(["wrong", "missing", "malformed"])(
  "calendar rejects %s first-page snapshot metadata before accepting pinned data",
  async (failure) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              data: {
                items: [{ id: "untrusted" }],
                page: { hasMore: false, total: 1 },
              },
              meta:
                failure === "wrong"
                  ? { snapshotId: "other" }
                  : failure === "missing"
                    ? {}
                    : { snapshotId: 123 },
            }),
            { headers: { "Content-Type": "application/json" } },
          ),
      ),
    );
    const store = configureStore({
      reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
      middleware: (getDefault) => getDefault().concat(archiveApi.middleware),
    });
    const result = await store.dispatch(
      archiveApi.endpoints.getCalendar.initiate({
        year: 2026,
        snapshotId: "pinned",
      }),
    );
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
    store.dispatch(archiveApi.util.resetApiState());
  },
);
test.each([false, true])(
  "calendar fetches every pinned page or rejects repeated cursors (loop=%s)",
  async (loop) => {
    const requests = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (request) => {
        const url = new URL(request.url);
        requests.push(url);
        const second = url.searchParams.has("cursor");
        return new Response(
          JSON.stringify({
            data: {
              items: [{ id: second ? "round-3" : "round-1" }],
              page: {
                total: 2,
                hasMore: !second || loop,
                nextCursor: !second || loop ? "page-2" : null,
              },
            },
            meta: { snapshotId: "pinned", coverage: "partial" },
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }),
    );
    const store = configureStore({
      reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
      middleware: (getDefault) => getDefault().concat(archiveApi.middleware),
    });
    const result = await store.dispatch(
      archiveApi.endpoints.getCalendar.initiate({ year: 2026 }),
    );
    if (loop) expect(result.error?.error).toBe("Incomplete season calendar");
    else {
      expect(result.data.items.map((item) => item.id)).toEqual([
        "round-1",
        "round-3",
      ]);
      expect(result.data.page.hasMore).toBe(false);
    }
    expect(requests).toHaveLength(2);
    expect(requests[1].searchParams.get("snapshotId")).toBe("pinned");
    store.dispatch(archiveApi.util.resetApiState());
  },
);

test.each(["snapshot", "cursor", "shape", "server"])(
  "calendar rejects %s failure without exposing a partial season",
  async (failure) => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        calls++;
        const data =
          calls === 1
            ? {
                data: {
                  items: [{ id: "first" }],
                  page: { total: 2, hasMore: true, nextCursor: "next" },
                },
                meta: { snapshotId: "pinned" },
              }
            : failure === "shape"
              ? {}
              : {
                  data: {
                    items: [{ id: "second" }],
                    page: {
                      total: 2,
                      hasMore: failure === "cursor",
                      nextCursor: null,
                    },
                  },
                  meta: {
                    snapshotId: failure === "snapshot" ? "other" : "pinned",
                  },
                };
        return new Response(JSON.stringify(data), {
          status: calls === 2 && failure === "server" ? 503 : 200,
          headers: { "Content-Type": "application/json" },
        });
      }),
    );
    const store = configureStore({
      reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
      middleware: (getDefault) => getDefault().concat(archiveApi.middleware),
    });
    const result = await store.dispatch(
      archiveApi.endpoints.getCalendar.initiate({
        year: 2000,
        snapshotId: "pinned",
      }),
    );
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(calls).toBe(2);
    store.dispatch(archiveApi.util.resetApiState());
  },
);
