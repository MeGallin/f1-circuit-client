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
  tagTypes: ["Seasons", "Season"],
  endpoints: (builder) => ({
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
export const {
  useGetSeasonsQuery,
  useGetSeasonSummaryQuery,
  useGetCalendarQuery,
} = archiveApi;
