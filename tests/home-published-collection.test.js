import { expect, test, vi } from "vitest";
import { publishedCollection } from "../src/api/publishedCollection";
const page = (
  ids,
  {
    total = 3,
    hasMore = false,
    nextCursor = null,
    snapshot = "pinned",
    coverage = "complete",
  } = {},
) => ({
  data: {
    data: {
      items: ids.map((id) => ({ id })),
      page: { total, hasMore, nextCursor },
    },
    meta: { snapshotId: snapshot, coverage },
  },
});
test("complete multi-page collection pins every request and preserves source order", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(
      page(["a", "b"], { hasMore: true, nextCursor: "next" }),
    )
    .mockResolvedValueOnce(page(["c"]));
  const result = await publishedCollection(request, "/fixture", {
    snapshotId: "pinned",
  });
  expect(result.data.items.map((row) => row.id)).toEqual(["a", "b", "c"]);
  expect(request.mock.calls.map((call) => call[0].params.snapshotId)).toEqual([
    "pinned",
    "pinned",
  ]);
  expect(request.mock.calls[1][0].params.cursor).toBe("next");
});
test.each([
  "duplicate",
  "cursor-loop",
  "total-change",
  "snapshot-change",
  "empty-more",
  "missing-id",
  "terminal-cursor",
  "wrong-total",
  "unavailable-items",
  "unknown-coverage",
  "nonstring-id",
])("rejects %s without publishing partial rows", async (failure) => {
  const first = page(["a"], { hasMore: true, nextCursor: "next" });
  const second = page(["b", "c"]);
  if (failure === "duplicate") second.data.data.items[0].id = "a";
  if (failure === "cursor-loop")
    Object.assign(second.data.data.page, { hasMore: true, nextCursor: "next" });
  if (failure === "total-change") second.data.data.page.total = 4;
  if (failure === "snapshot-change") second.data.meta.snapshotId = "other";
  if (failure === "empty-more") first.data.data.items = [];
  if (failure === "missing-id") second.data.data.items[0].id = null;
  if (failure === "terminal-cursor") second.data.data.page.nextCursor = "extra";
  if (failure === "wrong-total") second.data.data.items = [{ id: "b" }];
  if (failure === "unavailable-items") first.data.meta.coverage = "unavailable";
  if (failure === "unknown-coverage") {
    first.data.meta.coverage = "unknown";
    second.data.meta.coverage = "unknown";
  }
  if (failure === "nonstring-id") second.data.data.items[0].id = {};
  const result = await publishedCollection(
    vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second),
    "/fixture",
    { snapshotId: "pinned" },
  );
  expect(result.error).toBeDefined();
  expect(result.data).toBeUndefined();
});
test.each([409, 503])(
  "preserves %s failure and exposes no partial collection",
  async (status) => {
    const result = await publishedCollection(
      vi
        .fn()
        .mockResolvedValueOnce(
          page(["a"], { hasMore: true, nextCursor: "next" }),
        )
        .mockResolvedValueOnce({ error: { status } }),
      "/fixture",
      { snapshotId: "pinned" },
    );
    expect(result).toEqual({ error: { status } });
  },
);
test("unavailable collection remains unavailable with null total, not an invented zero", async () => {
  const result = await publishedCollection(
    vi
      .fn()
      .mockResolvedValue(page([], { total: null, coverage: "unavailable" })),
    "/fixture",
    { snapshotId: "pinned" },
  );
  expect(result.data.page.total).toBeNull();
  expect(result.data.meta.coverage).toBe("unavailable");
});
test("cancellation prevents advancing to the next page or publishing old data", async () => {
  const controller = new AbortController();
  const request = vi.fn(async () => {
    controller.abort();
    return page(["a"], { hasMore: true, nextCursor: "next" });
  });
  const result = await publishedCollection(
    request,
    "/fixture",
    { snapshotId: "pinned" },
    controller.signal,
  );
  expect(request).toHaveBeenCalledTimes(1);
  expect(result.data).toBeUndefined();
});
