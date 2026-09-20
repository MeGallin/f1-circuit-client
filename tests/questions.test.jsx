import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Questions from "../src/pages/Questions";
import { archiveApi } from "../src/api/archiveApi";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function mount() {
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/questions"]}>
        <Routes>
          <Route path="/questions" element={<Questions />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

test("question form posts structured context and renders exact values with evidence", async () => {
  vi.stubEnv("VITE_ENABLE_QUESTION_LAYER", "true");
  let body;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      if (new URL(request.url).pathname.endsWith("/search"))
        return new Response(
          JSON.stringify({
            data: {
              items: [
                {
                  id: "driver:one",
                  kind: "driver",
                  entity: { displayName: "Example Driver" },
                  context: null,
                },
              ],
              page: { total: 1, hasMore: false, nextCursor: null },
            },
            meta: { snapshotId: "search", coverage: "complete", sources: [] },
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      body = await request.json();
      return new Response(
        JSON.stringify({
          data: {
            questionResult: {
              status: "answered",
              resolvedIntent: "driver.wins",
              templateKey: "driver.metric",
              values: {
                answer: "Lewis Hamilton has 0.50 wins in the archive.",
                value: "0.50",
                covered: true,
              },
              evidenceIds: ["evidence:one"],
            },
          },
          meta: {
            snapshotId: "snapshot:one",
            coverage: "partial",
            freshness: "fresh",
            verification: "source-only",
            sources: [],
          },
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }),
  );
  mount();
  await userEvent.type(
    screen.getByLabelText("Question"),
    "How many wins?",
  );
  await userEvent.type(screen.getByLabelText("Season year"), "2024");
  await userEvent.type(screen.getByLabelText("Driver"), "Example");
  await userEvent.click(
    await screen.findByRole("option", { name: /Example Driver/ }),
  );
  await userEvent.click(screen.getByRole("button", { name: "Ask question" }));
  expect(
    await screen.findByText("Lewis Hamilton has 0.50 wins in the archive."),
  ).toBeInTheDocument();
  expect(screen.getByText("0.50")).toBeInTheDocument();
  expect(screen.getByText("true")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "View source evidence" }),
  ).toHaveAttribute(
    "href",
    "/evidence/evidence%3Aone",
  );
  expect(body).toEqual({
    text: "How many wins?",
    context: {
      year: 2024,
      eventId: null,
      sessionId: null,
      driverId: "driver:one",
      constructorId: null,
    },
  });
});

test("question clarification stays explicit and offers supplied choices", async () => {
  vi.stubEnv("VITE_ENABLE_QUESTION_LAYER", "true");
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              questionResult: {
                status: "clarification",
                message: "Which season do you mean?",
                choices: [
                  {
                    label: "2024 season",
                    context: {
                      year: 2024,
                      eventId: null,
                      sessionId: null,
                      driverId: null,
                      constructorId: null,
                    },
                  },
                ],
              },
            },
            meta: {
              snapshotId: "snapshot:one",
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
  mount();
  await userEvent.type(screen.getByLabelText("Question"), "Who won?");
  await userEvent.click(screen.getByRole("button", { name: "Ask question" }));
  expect(await screen.findByText("Which season do you mean?")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "2024 season" })).toBeInTheDocument();
});

test("question capability is available before any submission", () => {
  vi.stubEnv("VITE_ENABLE_QUESTION_LAYER", "true");
  mount();
  expect(screen.getByRole("heading", { name: "Ask a question" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Ask question" })).toBeInTheDocument();
});
