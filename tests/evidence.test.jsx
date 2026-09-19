import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Evidence from "../src/pages/Evidence";
import { archiveApi } from "../src/api/archiveApi";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("evidence detail preserves field coverage and safe source references", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              evidence: {
                id: "evidence-fixture",
                evidenceId: "evidence-fixture",
                snapshotId: "snapshot-fixture",
                resourceId: "results-fixture",
                derivationVersion: null,
                fields: [
                  {
                    path: "/items/0/points",
                    verification: "source-only",
                    coverage: "partial",
                    reasonCode: null,
                    selectedValue: "25",
                    selectionReason: "Published source value",
                    ruleVersion: null,
                    assertions: [
                      {
                        sourceId: "jolpica",
                        value: "25",
                        retrievedAt: "2026-09-18T12:00:00.000Z",
                        sourceVersion: null,
                        lineageGroup: "jolpica",
                        referenceUrl: "https://example.com/source",
                      },
                    ],
                  },
                ],
              },
            },
            meta: {
              coverage: "partial",
              freshness: "fresh",
              verification: "source-only",
              sources: [],
            },
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
    ),
  );
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/evidence/evidence-fixture"]}>
        <Routes>
          <Route path="/evidence/:evidenceId" element={<Evidence />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  expect(await screen.findByText("/items/0/points")).toBeInTheDocument();
  expect(screen.getByText("source-only · partial")).toBeInTheDocument();
  expect(screen.getByText("25")).toBeInTheDocument();
  expect(screen.getByText("Open source reference")).toHaveAttribute(
    "href",
    "https://example.com/source",
  );
});
