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

test("question form toggles to an answer result and resets to the form", async () => {
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
  await userEvent.type(screen.getByLabelText("Question"), "How many wins?");
  expect(screen.getByText("Add context")).toBeInTheDocument();
  expect(screen.getByLabelText("Season year")).not.toBeVisible();
  await userEvent.click(screen.getByText("Add context"));
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
    screen.getByRole("button", { name: "Clear question" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Archive result" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Submitted question")).toBeInTheDocument();
  expect(screen.getByText("Browse matching archive items")).toBeInTheDocument();
  expect(screen.queryByLabelText("Question")).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "View source evidence" }),
  ).toHaveAttribute("href", "/evidence/evidence%3Aone");
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
  const clearButton = screen.getByRole("button", { name: "Clear question" });
  clearButton.focus();
  expect(clearButton).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(screen.getByLabelText("Question")).toHaveValue("");
  expect(
    screen.queryByText("Lewis Hamilton has 0.50 wins in the archive."),
  ).not.toBeInTheDocument();
  expect(await screen.findByText("Ready when you are")).toBeInTheDocument();
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
  expect(
    await screen.findByText("Which season do you mean?"),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "2024 season" }),
  ).toBeInTheDocument();
});

test("question capability is available before any submission", () => {
  vi.stubEnv("VITE_ENABLE_QUESTION_LAYER", "true");
  mount();
  expect(
    screen.getByRole("heading", { name: "Ask the archive" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Write a complete question" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Ask question" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Ask in one sentence/)).toBeInTheDocument();
  expect(
    screen.getByText(
      "The published archive covers Formula 1 seasons from 2000 onward.",
    ),
  ).toBeInTheDocument();
});

test("question context is collapsed and examples only fill the composer", async () => {
  vi.stubEnv("VITE_ENABLE_QUESTION_LAYER", "true");
  mount();
  expect(
    screen.getByRole("heading", { name: "Example prompts" }),
  ).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", {
      name: /How many wins does Lewis Hamilton have\?.*Use example/,
    }),
  );
  expect(screen.getByLabelText("Question")).toHaveValue(
    "How many wins does Lewis Hamilton have?",
  );
  expect(
    screen.getByRole("button", { name: "Ask question" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Archive result" }),
  ).not.toBeInTheDocument();
  const form = screen
    .getByRole("region", { name: "Write a complete question" })
    .querySelector("form");
  const childIndex = (selector) =>
    [...form.children].indexOf(form.querySelector(selector));
  expect(childIndex(".question-examples")).toBeLessThan(
    childIndex(".question-form-actions"),
  );
  expect(childIndex(".question-form-actions")).toBeLessThan(
    childIndex(".question-context-disclosure"),
  );
  expect(
    screen.getByText("Add context").closest("details"),
  ).not.toHaveAttribute("open");
});

test("loading switches to a focused result view with a clear action", async () => {
  vi.stubEnv("VITE_ENABLE_QUESTION_LAYER", "true");
  let resolveRequest;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    ),
  );
  mount();
  await userEvent.type(
    screen.getByLabelText("Question"),
    "Which driver has the most wins?",
  );
  await userEvent.click(screen.getByRole("button", { name: "Ask question" }));
  expect(screen.queryByLabelText("Question")).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Archive result" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Interpreting the published archive"),
  ).toBeInTheDocument();
  const clearButton = screen.getByRole("button", { name: "Clear question" });
  clearButton.focus();
  await userEvent.keyboard("{Enter}");
  expect(await screen.findByText("Ready when you are")).toBeInTheDocument();
  expect(screen.getByLabelText("Question")).toBeInTheDocument();
  resolveRequest(
    new Response(
      JSON.stringify({
        data: {
          questionResult: {
            status: "unavailable",
            message: "The optional interpreter is not available.",
          },
        },
      }),
      { headers: { "Content-Type": "application/json" } },
    ),
  );
});

test("request errors switch to the result view and can be cleared", async () => {
  vi.stubEnv("VITE_ENABLE_QUESTION_LAYER", "true");
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "Service unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
    ),
  );
  mount();
  await userEvent.type(
    screen.getByLabelText("Question"),
    "Which driver has the most wins?",
  );
  await userEvent.click(screen.getByRole("button", { name: "Ask question" }));
  expect(
    await screen.findByText("We could not load this data"),
  ).toBeInTheDocument();
  expect(screen.queryByLabelText("Question")).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Clear question" }),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Clear question" }));
  expect(await screen.findByText("Ready when you are")).toBeInTheDocument();
});

test("unavailable answers stay explicit and can be cleared", async () => {
  vi.stubEnv("VITE_ENABLE_QUESTION_LAYER", "true");
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              questionResult: {
                status: "unavailable",
                message: "The optional interpreter is not available.",
                reasonCode: "QUESTION_INTERPRETER_DISABLED",
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
  await userEvent.type(
    screen.getByLabelText("Question"),
    "Which driver has the most finishes?",
  );
  await userEvent.click(screen.getByRole("button", { name: "Ask question" }));
  expect(
    await screen.findByText("The optional interpreter is not available."),
  ).toBeInTheDocument();
  expect(screen.queryByLabelText("Question")).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Clear question" }),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Clear question" }));
  expect(await screen.findByText("Ready when you are")).toBeInTheDocument();
});
