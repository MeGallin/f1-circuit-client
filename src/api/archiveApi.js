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
  tagTypes: ["Seasons", "Season", "Event"],
  endpoints: (builder) => ({
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
      providesTags: (_r, _e, { year }) => [{ type: "Season", id: year }],
    }),
    getCalendar: builder.query({
      query: ({ year, snapshotId, cursor }) => ({
        url: `/seasons/${year}/calendar`,
        params: { snapshotId, cursor, limit: 200 },
      }),
      transformResponse: collectionResponse,
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
      query: ({ season, fromRound, toRound, drivers, snapshotId }) => ({
        url: "/analytics/driver-comparison",
        params: {
          season,
          fromRound,
          toRound,
          drivers: drivers?.join(","),
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
  useGetSessionDataQuery,
  useGetSeasonsQuery,
  useGetSeasonSummaryQuery,
  useGetCalendarQuery,
  useGetAnalyticsDashboardQuery,
  useGetDriverComparisonQuery,
} = archiveApi;
