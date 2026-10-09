// All-or-nothing GET collection for Home's explicitly expanded panels.
export async function publishedCollection(baseQuery, url, params, signal) {
  const cancelled = () => ({
    error: { status: "CUSTOM_ERROR", error: "Published collection cancelled" },
  });
  const items = [],
    ids = new Set(),
    cursors = new Set();
  let cursor, first;
  do {
    if (signal?.aborted) return cancelled();
    const response = await baseQuery({
      url,
      params: { ...params, cursor, limit: 200 },
    });
    if (signal?.aborted) return cancelled();
    if (response.error) return { error: response.error };
    const { data, meta } = response.data || {};
    const page = data?.page;
    const fail = () => ({
      error: {
        status: "CUSTOM_ERROR",
        error: "Incomplete or mismatched published collection",
      },
    });
    if (
      !Array.isArray(data?.items) ||
      !page ||
      !meta ||
      !["complete", "partial", "unavailable"].includes(meta.coverage) ||
      !params.snapshotId ||
      meta.snapshotId !== params.snapshotId ||
      typeof page.hasMore !== "boolean" ||
      !(
        (Number.isSafeInteger(page.total) && page.total >= 0) ||
        (page.total === null && meta.coverage === "unavailable")
      ) ||
      (first &&
        (first.data.page.total !== page.total ||
          first.meta.coverage !== meta.coverage)) ||
      (meta.coverage === "unavailable" && data.items.length) ||
      (page.hasMore &&
        (!data.items.length ||
          typeof page.nextCursor !== "string" ||
          !page.nextCursor ||
          cursors.has(page.nextCursor))) ||
      (!page.hasMore && page.nextCursor != null)
    )
      return fail();
    for (const item of data.items) {
      if (typeof item?.id !== "string" || !item.id || ids.has(item.id))
        return fail();
      ids.add(item.id);
      items.push(item);
    }
    if (
      page.total != null &&
      (items.length > page.total ||
        (!page.hasMore && items.length !== page.total))
    )
      return fail();
    first ||= { data, meta };
    cursor = page.hasMore ? page.nextCursor : undefined;
    if (cursor) cursors.add(cursor);
  } while (cursor);
  return {
    data: {
      items,
      meta: first.meta,
      page: { total: first.data.page.total, hasMore: false, nextCursor: null },
    },
  };
}
