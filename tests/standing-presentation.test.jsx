import { afterEach, expect, test, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import Standings from "../src/pages/Standings";
import { archiveApi } from "../src/api/archiveApi";
import { SourceNote } from "../src/components/ui";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("SourceNote retains its default collapsed source disclosure and supports inline details inside a parent disclosure", () => {
  const meta = {
    coverage: "partial",
    verification: "source-only",
    sources: [{ id: "source", attribution: "Retained source rights" }],
    warnings: [{ message: "Retained warning" }],
  };
  const view = render(
    <MemoryRouter>
      <SourceNote meta={meta} />
    </MemoryRouter>,
  );
  expect(view.container.querySelectorAll("details")).toHaveLength(1);
  expect(screen.getByText("Retained source rights")).not.toBeVisible();
  view.rerender(
    <MemoryRouter>
      <SourceNote meta={meta} collapsible={false} />
    </MemoryRouter>,
  );
  expect(view.container.querySelectorAll("details")).toHaveLength(0);
  expect(screen.getByText("Retained source rights")).toBeVisible();
  expect(screen.getByText("Retained warning")).toBeVisible();
  expect(screen.getByText("Partial coverage")).toBeVisible();
  expect(screen.getByRole("link", { name: "About the data" })).toBeVisible();
});
async function page(kind = "drivers", pinned = false, initialPin = false) {
  const outlook = {
    year: 2026,
    round: 17,
    snapshotId: "pin",
    standingSnapshotId: "standing:2026:17",
    coverage: "conditional",
    reasonCode: null,
    leaderId: "fixture",
    leaderName: "Fixture leader",
    remainingMaximum: "150",
    sufficientAdditional: "49",
    rivalCeiling: "388",
    targetWithinAvailablePoints: true,
    remainingRaces: 6,
    remainingSprints: 0,
    ruleVersion: "fixture-rule",
    assumptions: [
      "Full points, unchanged rules.",
      "Published ranks bound lower rivals.",
    ],
    sourceUrls: ["https://www.fia.com/example"],
  };
  const meta = {
    snapshotId: "pin",
    coverage: "partial",
    verification: "source-only",
    lastSuccessfulRetrieval: null,
    sources: [{ id: "fixture", attribution: "Fixture source attribution" }],
    warnings: [{ message: "Fixture source limitation" }],
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (request) => {
      const url = new URL(request.url);
      const standing = url.pathname.includes("/standings/");
      const matchingPin = url.searchParams.get("snapshotId") === "pin";
      const items = url.pathname.endsWith("/seasons")
        ? [{ year: 2026 }]
        : url.pathname.endsWith("/calendar")
          ? [
              {
                id: "event:fixture",
                round: 17,
                year: 2026,
                status: "completed",
                ...(pinned
                  ? {
                      name: matchingPin
                        ? "Pinned original race"
                        : "Latest changed race",
                      schedule: {
                        date: matchingPin ? "2026-10-11" : "2026-10-12",
                      },
                    }
                  : {}),
              },
            ]
          : [
              {
                id: "row",
                entity: { id: "fixture", displayName: "Fixture row" },
                constructors: [],
                rank: 1,
                points: "340",
                wins: 5,
                podiums: 14,
                gapToLeader: "0",
                standingSnapshotId: "standing:2026:17",
                podiumCoverage: {
                  coverage: "complete",
                  verifiedRaces: 17,
                  expectedRaces: 17,
                  throughRound: 17,
                },
              },
            ];
      return new Response(
        JSON.stringify({
          data: {
            items,
            page: { total: items.length, hasMore: false, nextCursor: null },
            ...(standing ? { titleOutlook: outlook } : {}),
          },
          meta:
            pinned && url.pathname.endsWith("/calendar") && !matchingPin
              ? { ...meta, snapshotId: "latest-other-publication" }
              : meta,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }),
  );
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  const view = render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[
          `/standings?season=2026&kind=${kind}${initialPin ? "&snapshot=pin" : ""}`,
        ]}
      >
        <Standings />
      </MemoryRouter>
    </Provider>,
  );
  await screen.findByText("Fixture row");
  return {
    ...view,
    finish: () => {
      view.unmount();
      store.dispatch(archiveApi.util.resetApiState());
    },
  };
}

test.each(["drivers", "constructors"])(
  "all %s calculation/source information lives in one collapsed footer after the standings",
  async (kind) => {
    const view = await page(kind);
    const disclosures = view.container.querySelectorAll("details");
    expect(disclosures).toHaveLength(1);
    const footer = disclosures[0];
    expect(footer).not.toHaveAttribute("open");
    expect(footer.querySelector("summary")).toHaveTextContent(
      "Calculation and source details",
    );
    const rows = screen.getByRole("list", {
      name: kind === "drivers" ? "Driver standings" : "Constructor standings",
    });
    expect(
      rows.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const text of [
      /Podiums are calculated/,
      /Full points, unchanged rules/,
      /Sprint and qualifying results are excluded/,
      /Fixture source attribution/,
      /Fixture source limitation/,
      /Missing round data is never replaced/,
    ]) {
      const node = screen.getByText(text);
      expect(footer).toContainElement(node);
      expect(node).not.toBeVisible();
    }
    view.finish();
  },
);

test("one native footer disclosure reveals every explanation and source, supports focus and closes again", async () => {
  const view = await page();
  const summary = screen.getByText("Calculation and source details");
  const footer = summary.closest("details");
  summary.focus();
  expect(summary.tagName).toBe("SUMMARY");
  expect(summary).toHaveFocus();
  await userEvent.click(summary);
  expect(footer).toHaveAttribute("open");
  expect(screen.getByText(/Podiums are calculated/)).toBeVisible();
  expect(screen.getByText("Fixture source attribution")).toBeVisible();
  expect(screen.getByRole("link", { name: "Rule source 1" })).toBeVisible();
  await userEvent.tab();
  expect(screen.getByRole("link", { name: "Rule source 1" })).toHaveFocus();
  await userEvent.click(summary);
  expect(footer).not.toHaveAttribute("open");
  expect(screen.getByText(/Podiums are calculated/)).not.toBeVisible();
  view.finish();
});

test.each([false, true])(
  "cutoff calendar follows the standing publication, explicit URL pin=%s",
  async (initialPin) => {
    const view = await page("drivers", true, initialPin);
    expect(
      await screen.findByText(/Standings after Pinned original race/),
    ).toBeVisible();
    expect(
      screen.queryByText(/Standings after Latest changed race/),
    ).not.toBeInTheDocument();
    const calendarCalls = fetch.mock.calls
      .map(([request]) => new URL(request.url))
      .filter((url) => url.pathname.endsWith("/calendar"));
    expect(
      calendarCalls.some((url) => url.searchParams.get("snapshotId") === "pin"),
    ).toBe(true);
    view.finish();
  },
);

test("title summary reuses padded Apex body and shared Metric components without explanatory paragraphs or disclosure", async () => {
  const view = await page();
  const summary = screen.getByRole("region", { name: "Title outlook" });
  expect(summary.querySelector(".panel-body")).toBeInTheDocument();
  expect(summary.querySelectorAll(".metric")).toHaveLength(2);
  expect(summary).toHaveTextContent("Fixture leader");
  expect(
    screen.getByRole("heading", { name: "Championship leader" }),
  ).toHaveClass("eyebrow");
  expect(summary).toHaveTextContent("Safe target (not minimum)");
  expect(summary).not.toHaveTextContent(
    /Full points|rank.*bound|Sprint|assumptions|guarantee/,
  );
  expect(summary.querySelector("details")).toBeNull();
  expect(view.container.querySelectorAll(".standing-stats > div")).toHaveLength(
    4,
  );
  view.finish();
});

test("single unified title outlook trigger belongs to the existing context note row, not metrics", async () => {
  const view = await page();
  const trigger = screen.getByRole("button", { name: "Title outlook" });
  const context = screen.getByRole("group", { name: "Standings context" });
  expect(context).toContainElement(trigger);
  expect(
    trigger.closest(".standing-context-note").querySelector(".standing-note"),
  ).toHaveTextContent(/Latest published standings|Standings after/);
  expect(
    screen
      .getByRole("button", { name: "Refresh standings" })
      .compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    screen.getByRole("region", { name: "Title outlook" }),
  ).not.toContainElement(trigger);
  expect(
    screen.queryByRole("heading", { name: "Title outlook" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Title scenarios" }),
  ).not.toBeInTheDocument();
  await userEvent.click(trigger);
  expect(
    screen.getByRole("dialog", { name: "Title outlook" }),
  ).toBeInTheDocument();
  view.finish();
});

test("podium coverage explanations are only in the footer, not row hover tooltips", async () => {
  const view = await page();
  expect(screen.getByText("Podiums").nextElementSibling).not.toHaveAttribute(
    "title",
  );
  expect(
    screen.getByText(/17 of 17 races/).closest("details"),
  ).not.toHaveAttribute("open");
  view.finish();
});
