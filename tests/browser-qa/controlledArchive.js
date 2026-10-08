// Isolated deterministic QA transport; never installed by the production entry.
export function createControlledArchive() {
  let mode = "hold";
  const pending = new Set();
  const listeners = new Set();
  const counts = new Map();
  const active = new Map();
  const maximum = new Map();
  const meta = {
    snapshotId: "qa-fixture",
    coverage: "unavailable",
    sources: [],
  };
  const collection = (items) => ({
    data: {
      items,
      page: { total: items.length, hasMore: false, nextCursor: null },
    },
    meta,
  });
  const notify = () => listeners.forEach((listener) => listener());
  const response = (year, outcome) =>
    new Response(
      JSON.stringify(
        outcome === "error"
          ? { error: { code: "QA_CONTROLLED_FAILURE" } }
          : {
              data: {
                seasonSummary: { season: { year, coverage: "unavailable" } },
              },
              meta,
            },
      ),
      {
        status: outcome === "error" ? 503 : 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    snapshot() {
      return {
        mode,
        pending: pending.size,
        counts: Object.fromEntries(counts),
        active: Object.fromEntries(active),
        maximum: Object.fromEntries(maximum),
      };
    },
    setMode(next) {
      mode = next;
      notify();
    },
    release(outcome) {
      mode = outcome;
      [...pending].forEach((item) => item.finish(outcome));
      notify();
    },
    async fetch(request) {
      if (request.method !== "GET")
        throw new Error("QA transport permits read-only GET requests only");
      const url = new URL(request.url);
      if (url.pathname.endsWith("/seasons"))
        return new Response(
          JSON.stringify(
            collection([
              { year: 2025, coverage: "unavailable" },
              { year: 2024, coverage: "unavailable" },
            ]),
          ),
          { headers: { "Content-Type": "application/json" } },
        );
      const match = url.pathname.match(/\/seasons\/(\d+)\/summary$/);
      if (!match)
        return new Response(JSON.stringify(collection([])), {
          headers: { "Content-Type": "application/json" },
        });
      const year = Number(match[1]);
      counts.set(year, (counts.get(year) || 0) + 1);
      active.set(year, (active.get(year) || 0) + 1);
      maximum.set(year, Math.max(maximum.get(year) || 0, active.get(year)));
      notify();
      return new Promise((resolve, reject) => {
        let ended = false;
        const close = () => {
          ended = true;
          pending.delete(item);
          request.signal?.removeEventListener("abort", abort);
          active.set(year, active.get(year) - 1);
          notify();
        };
        const item = {
          finish(outcome) {
            if (ended) return;
            close();
            resolve(response(year, outcome));
          },
        };
        const abort = () => {
          if (ended) return;
          close();
          reject(new DOMException("QA request cancelled", "AbortError"));
        };
        request.signal?.addEventListener("abort", abort, { once: true });
        if (request.signal?.aborted) {
          abort();
          return;
        }
        if (mode === "hold") {
          pending.add(item);
          notify();
        } else item.finish(mode);
      });
    },
  };
}
