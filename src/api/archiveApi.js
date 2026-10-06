import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiBase } from "./config";

export const publicApiBase = apiBase(import.meta.env.VITE_API_BASE_URL);
// Development proxy is client-only. Production requests go directly to the public API.
const baseUrl = import.meta.env.DEV
  ? `${window.location.origin}/api/v1`
  : publicApiBase;
const request = fetchBaseQuery({
  baseUrl,
  timeout: 75000,
  credentials: "omit",
});
const PUBLICATION_CONFIG_ATTEMPTS = 3;
const REFRESH_DATA_STATUSES = new Set([
  "updated",
  "unchanged",
  "pending",
  "busy",
  "cooldown",
  "no-race",
]);

export function refreshDataResponse(response) {
  if (
    !response ||
    !REFRESH_DATA_STATUSES.has(response.status) ||
    typeof response.message !== "string" ||
    !(
      response.checkedAt === null ||
      (typeof response.checkedAt === "string" &&
        Number.isFinite(Date.parse(response.checkedAt)))
    ) ||
    !(
      response.publicationId === null ||
      typeof response.publicationId === "string"
    ) ||
    (response.retryAfterMs !== undefined &&
      (!Number.isSafeInteger(response.retryAfterMs) ||
        response.retryAfterMs < 0))
  )
    throw new Error("Unexpected source refresh response");
  return response;
}

function isTransientPublicConfigError(error) {
  const status = error?.status;
  const originalStatus = error?.originalStatus;
  return (
    status === "FETCH_ERROR" ||
    status === "TIMEOUT_ERROR" ||
    status === 429 ||
    (Number.isInteger(status) && status >= 500) ||
    (status === "PARSING_ERROR" &&
      (originalStatus === 429 ||
        (Number.isInteger(originalStatus) && originalStatus >= 500)))
  );
}

function retryDelay(milliseconds, signal) {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    let timer;
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    timer = setTimeout(finish, milliseconds);
    signal.addEventListener("abort", finish, { once: true });
  });
}

async function publicationConfigQuery(_arg, api, extraOptions, baseQuery) {
  for (let attempt = 0; attempt < PUBLICATION_CONFIG_ATTEMPTS; attempt++) {
    const response = await baseQuery(
      { url: "/publication-config" },
      api,
      extraOptions,
    );
    if (!response.error) {
      const automaticRaceResults = response.data?.automaticRaceResults;
      if (
        !automaticRaceResults ||
        typeof automaticRaceResults.enabled !== "boolean" ||
        automaticRaceResults.anchor !== "scheduled-race-start"
      )
        return {
          error: {
            status: "CUSTOM_ERROR",
            error: "Unexpected publication configuration response",
          },
        };
      return { data: { automaticRaceResults } };
    }
    if (
      attempt === PUBLICATION_CONFIG_ATTEMPTS - 1 ||
      !isTransientPublicConfigError(response.error) ||
      api.signal.aborted
    )
      return response;
    await retryDelay(200 * 2 ** attempt, api.signal);
    if (api.signal.aborted) return response;
  }
  return {
    error: {
      status: "CUSTOM_ERROR",
      error: "Publication configuration unavailable",
    },
  };
}

export const entityKinds = {
  driver: "drivers",
  constructor: "constructors",
  circuit: "circuits",
};
export const sessionDatasets = [
  "results",
  "qualifying",
  "laps",
  "pit-stops",
  "stints",
  "weather",
  "race-control",
  "penalties",
  "positions",
  "intervals",
  "overtakes",
  "radio",
  "telemetry",
  "locations",
];
function entityUrl(kind, id) {
  if (!Object.hasOwn(entityKinds, kind))
    throw new Error("Unsupported entity kind");
  return "/" + entityKinds[kind] + "/" + encodeURIComponent(id);
}
export function objectResponse(response, key) {
  if (!response?.data || !(key in response.data) || !response.meta)
    throw new Error("Unexpected archive response");
  return { [key]: response.data[key], meta: response.meta };
}
export const archiveApi = createApi({
  reducerPath: "archiveApi",
  baseQuery: request,
  keepUnusedDataFor: 300,
  refetchOnReconnect: true,
  refetchOnFocus: false,
  tagTypes: ["Seasons", "Season", "SeasonSummary", "Event", "Session"],
  endpoints: (builder) => ({
    getPublicationConfig: builder.query({
      queryFn: publicationConfigQuery,
    }),
    searchEntities: builder.query({
      query: ({ q, kind, cursor, snapshotId }) => ({
        url: "/search",
        params: { q, kind, cursor, snapshotId, limit: 20 },
      }),
      transformResponse: collectionResponse,
    }),
    getProfile: builder.query({
      query: ({ kind, id, snapshotId }) => ({
        url: entityUrl(kind, id),
        params: { snapshotId },
      }),
      transformResponse: (r) => objectResponse(r, "profile"),
    }),
    getHistory: builder.query({
      query: ({ kind, id, year, cursor, snapshotId }) => ({
        url:
          entityUrl(kind, id) + (kind === "circuit" ? "/events" : "/results"),
        params: { year, cursor, snapshotId, limit: 20 },
      }),
      transformResponse: collectionResponse,
    }),
    getProgression: builder.query({
      query: ({ kind, id, year, cursor, snapshotId }) => ({
        url:
          "/seasons/" +
          year +
          "/standings/" +
          entityKinds[kind] +
          "/progression",
        params: { entityId: id, cursor, snapshotId, limit: 20 },
      }),
      transformResponse: collectionResponse,
    }),
    getLayouts: builder.query({
      query: ({ id, cursor, snapshotId }) => ({
        url: entityUrl("circuit", id) + "/layouts",
        params: { cursor, snapshotId, limit: 20 },
      }),
      transformResponse: collectionResponse,
    }),
    getComparison: builder.query({
      query: ({
        kind,
        leftId,
        rightId,
        fromYear,
        toYear,
        metric,
        snapshotId,
      }) => ({
        url: "/comparisons",
        params: { kind, leftId, rightId, fromYear, toYear, metric, snapshotId },
      }),
      transformResponse: (r) => objectResponse(r, "comparison"),
    }),
    getSources: builder.query({
      query: ({ cursor, snapshotId } = {}) => ({
        url: "/sources/status",
        params: { limit: 50, cursor, snapshotId },
      }),
      transformResponse: collectionResponse,
    }),
    getStandings: builder.query({
      query: ({
        year,
        kind,
        round,
        cursor,
        snapshotId,
        standingSnapshotId,
      }) => ({
        url: `/seasons/${year}/standings/${kind}`,
        params: { round, cursor, snapshotId, standingSnapshotId, limit: 50 },
      }),
      transformResponse: collectionResponse,
      providesTags: (_r, _e, { year }) => [{ type: "Season", id: year }],
    }),
    getEvent: builder.query({
      query: ({ eventId, snapshotId }) => ({
        url: `/events/${encodeURIComponent(eventId)}`,
        params: { snapshotId },
      }),
      transformResponse: eventResponse,
      providesTags: (_r, _e, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    getImpact: builder.query({
      query: ({ eventId, scope = "race", snapshotId }) => ({
        url: `/events/${encodeURIComponent(eventId)}/standings-impact`,
        params: { scope, snapshotId },
      }),
      transformResponse: (r) => objectResponse(r, "impact"),
      providesTags: (_r, _e, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    getEvidence: builder.query({
      query: ({ evidenceId, snapshotId }) => ({
        url: `/evidence/${encodeURIComponent(evidenceId)}`,
        params: { snapshotId },
      }),
      transformResponse: (r) => objectResponse(r, "evidence"),
    }),
    askQuestion: builder.mutation({
      query: ({ text, context }) => ({
        url: "/questions",
        method: "POST",
        body: { text, ...(context ? { context } : {}) },
      }),
      transformResponse: (r) => objectResponse(r, "questionResult"),
    }),
    refreshData: builder.mutation({
      query: ({ season }) => ({
        url: "/refresh-data",
        method: "POST",
        body: { season },
      }),
      transformResponse: refreshDataResponse,
      invalidatesTags: (_response, _error, { season }) => [
        { type: "Seasons" },
        { type: "SeasonSummary", id: season },
        { type: "Season", id: season },
        { type: "Event" },
        { type: "Session" },
      ],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (["updated", "unchanged", "pending"].includes(data.status)) {
            const refreshConfig = dispatch(
              archiveApi.endpoints.getPublicationConfig.initiate(undefined, {
                forceRefetch: true,
                subscribe: false,
              }),
            );
            void refreshConfig.unwrap().catch(() => undefined);
          }
        } catch {
          // Mutation errors are handled by the refresh control.
        }
      },
    }),
    getSessionData: builder.query({
      query: ({
        sessionId,
        dataset,
        cursor,
        snapshotId,
        limit = 20,
        driverId,
        from,
        to,
        resolution,
        sourceId,
        category,
      }) => {
        if (!sessionDatasets.includes(dataset))
          throw new Error("Unsupported dataset");
        return {
          url: `/sessions/${encodeURIComponent(sessionId)}/${dataset}`,
          params: {
            cursor,
            snapshotId,
            limit,
            driverId,
            from,
            to,
            resolution,
            sourceId,
            category,
          },
        };
      },
      transformResponse: collectionResponse,
      providesTags: (_r, _e, { sessionId, dataset }) => [
        { type: "Session", id: `${sessionId}:${dataset}` },
      ],
    }),
    getSeasons: builder.query({
      async queryFn(_arg, _api, _extra, baseQuery) {
        const items = [];
        let cursor, snapshotId, first;
        const visited = new Set();
        do {
          const response = await baseQuery({
            url: "/seasons",
            params: { limit: 200, cursor, snapshotId },
          });
          if (response.error) return { error: response.error };
          let page;
          try {
            page = collectionResponse(response.data);
          } catch {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Unexpected season catalogue response",
              },
            };
          }
          first ||= page;
          snapshotId = first.meta.snapshotId;
          items.push(...page.items);
          cursor = page.page.hasMore ? page.page.nextCursor : undefined;
          if (page.page.hasMore && (!cursor || visited.has(cursor)))
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Incomplete season catalogue",
              },
            };
          if (cursor) visited.add(cursor);
        } while (cursor);
        return {
          data: {
            items,
            meta: first.meta,
            page: { total: items.length, hasMore: false, nextCursor: null },
          },
        };
      },
      providesTags: ["Seasons"],
    }),
    getSeasonSummary: builder.query({
      query: ({ year, snapshotId }) => ({
        url: `/seasons/${year}/summary`,
        params: { snapshotId },
      }),
      transformResponse: summaryResponse,
      providesTags: (_r, _e, { year }) => [{ type: "SeasonSummary", id: year }],
    }),
    getCalendar: builder.query({
      async queryFn({ year, snapshotId }, _api, _extra, baseQuery) {
        const items = [];
        const visited = new Set();
        const eventIds = new Set();
        let cursor;
        let first;
        do {
          const response = await baseQuery({
            url: `/seasons/${year}/calendar`,
            params: { snapshotId, cursor, limit: 200 },
          });
          if (response.error) return { error: response.error };
          let page;
          try {
            page = collectionResponse(response.data);
          } catch {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Unexpected season calendar response",
              },
            };
          }
          if (typeof page.meta.snapshotId !== "string" || !page.meta.snapshotId)
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Unexpected season calendar snapshot",
              },
            };
          if (snapshotId != null && page.meta.snapshotId !== snapshotId)
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Season calendar snapshot changed",
              },
            };
          const { total, hasMore, nextCursor } = page.page;
          if (
            typeof hasMore !== "boolean" ||
            !(total === null || (Number.isSafeInteger(total) && total >= 0)) ||
            (first && total !== first.page.total) ||
            (hasMore &&
              (typeof nextCursor !== "string" ||
                !nextCursor ||
                !page.items.length)) ||
            (!hasMore && nextCursor != null) ||
            page.items.some((event) => {
              if (
                typeof event?.id !== "string" ||
                !event.id ||
                eventIds.has(event.id)
              )
                return true;
              eventIds.add(event.id);
              return false;
            }) ||
            (total !== null &&
              (items.length + page.items.length > total ||
                (hasMore
                  ? items.length + page.items.length >= total
                  : items.length + page.items.length !== total)))
          )
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Incomplete season calendar",
              },
            };
          first ||= page;
          snapshotId = first.meta.snapshotId;
          items.push(...page.items);
          cursor = page.page.hasMore ? page.page.nextCursor : undefined;
          if (page.page.hasMore && (!cursor || visited.has(cursor)))
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Incomplete season calendar",
              },
            };
          if (cursor) visited.add(cursor);
        } while (cursor);
        return {
          data: {
            items,
            meta: first.meta,
            page: { total: first.page.total, hasMore: false, nextCursor: null },
          },
        };
      },
      providesTags: (_r, _e, { year }) => [{ type: "Season", id: year }],
    }),
    getAnalyticsDashboard: builder.query({
      query: ({
        season,
        fromRound,
        toRound,
        driverIds,
        constructorIds,
        circuitIds,
        sessionType = "race",
        snapshotId,
      }) => ({
        url: "/analytics/dashboard",
        params: {
          season,
          fromRound,
          toRound,
          driverIds: driverIds?.join(","),
          constructorIds: constructorIds?.join(","),
          circuitIds: circuitIds?.join(","),
          sessionType,
          snapshotId,
        },
      }),
      transformResponse: (r) => objectResponse(r, "analyticsDashboard"),
    }),
    getDriverComparison: builder.query({
      query: ({
        season,
        fromRound,
        toRound,
        drivers,
        constructorIds,
        circuitIds,
        sessionType = "race",
        snapshotId,
      }) => ({
        url: "/analytics/driver-comparison",
        params: {
          season,
          fromRound,
          toRound,
          drivers: drivers?.join(","),
          constructorIds: constructorIds?.join(","),
          circuitIds: circuitIds?.join(","),
          sessionType,
          snapshotId,
        },
      }),
      transformResponse: (r) => objectResponse(r, "driverComparison"),
    }),
  }),
});
export function collectionResponse(response) {
  if (
    !Array.isArray(response?.data?.items) ||
    !response.meta ||
    !response.data.page
  )
    throw new Error("Unexpected archive response");
  return {
    items: response.data.items,
    page: response.data.page,
    meta: response.meta,
  };
}
export function summaryResponse(response) {
  if (!response?.data || !("seasonSummary" in response.data) || !response.meta)
    throw new Error("Unexpected summary response");
  return { summary: response.data.seasonSummary, meta: response.meta };
}
export function eventResponse(response) {
  if (!response?.data || !("eventDetail" in response.data) || !response.meta)
    throw new Error("Unexpected event response");
  return { detail: response.data.eventDetail, meta: response.meta };
}
export const {
  useGetPublicationConfigQuery,
  useSearchEntitiesQuery,
  useGetProfileQuery,
  useGetHistoryQuery,
  useGetProgressionQuery,
  useGetLayoutsQuery,
  useGetComparisonQuery,
  useGetSourcesQuery,
  useGetStandingsQuery,
  useGetEventQuery,
  useGetImpactQuery,
  useGetEvidenceQuery,
  useAskQuestionMutation,
  useRefreshDataMutation,
  useGetSessionDataQuery,
  useGetSeasonsQuery,
  useGetSeasonSummaryQuery,
  useGetCalendarQuery,
  useGetAnalyticsDashboardQuery,
  useGetDriverComparisonQuery,
} = archiveApi;
