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
export const archiveApi = createApi({
  reducerPath: "archiveApi",
  baseQuery: request,
  keepUnusedDataFor: 300,
  refetchOnReconnect: true,
  refetchOnFocus: false,
  tagTypes: ["Seasons", "Season", "Event"],
  endpoints: (builder) => ({
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
    getSessionData: builder.query({
      query: ({ sessionId, dataset, cursor, snapshotId, limit = 20 }) => {
        if (!["results", "qualifying", "laps", "pit-stops"].includes(dataset))
          throw new Error("Unsupported dataset");
        return {
          url: `/sessions/${encodeURIComponent(sessionId)}/${dataset}`,
          params: { cursor, snapshotId, limit },
        };
      },
      transformResponse: collectionResponse,
    }),
    getSeasons: builder.query({
      query: () => ({ url: "/seasons", params: { limit: 200 } }),
      transformResponse: collectionResponse,
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
  useGetSourcesQuery,
  useGetStandingsQuery,
  useGetEventQuery,
  useGetSessionDataQuery,
  useGetSeasonsQuery,
  useGetSeasonSummaryQuery,
  useGetCalendarQuery,
} = archiveApi;
