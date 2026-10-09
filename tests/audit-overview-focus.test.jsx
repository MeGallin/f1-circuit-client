import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { existsSync, readFileSync } from "node:fs";
import { RaceFocus } from "../src/features/season/SeasonPanels";
vi.mock("../src/api/archiveApi", () => ({
  useGetProfileQuery: () => ({}),
  useGetLayoutsQuery: () => ({}),
  useGetCalendarQuery: () => ({ currentData: { items: [] } }),
  useGetStandingsQuery: () => ({}),
  useGetEventQuery: () => ({
    currentData: {
      detail: {
        event: { year: 2024 },
        podium: [
          {
            id: "result:fixture",
            position: 1,
            entry: {
              drivers: [
                { id: "driver:fixture", displayName: "Fixture Winner" },
              ],
            },
            points: "25",
          },
        ],
      },
    },
  }),
}));
afterEach(cleanup);

test("UX-06 countdown compaction survives the newly authorized equal-height Home card reflow", () => {
  const extension = "src/design-system/overview-focus.css";
  const css =
    readFileSync("src/styles/overview.css", "utf8") +
    (existsSync(extension) ? readFileSync(extension, "utf8") : "") +
    readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(
    /--apex-size-overview-track-compact:\s*8rem/.test(
      readFileSync("src/design-system/audit-layout.tokens.css", "utf8"),
    ),
  ).toBe(true);
  expect(
    /\.overview-adjacent-event--countdown-hero\s*\{[^}]*padding-block:\s*var\(--apex-space-5\)/s.test(
      css,
    ),
  ).toBe(true);
  // a5098 reference supersedes the former full-width race/unstretched-preview arrangement.
  expect(css).toContain("align-items: stretch");
  expect(css).toContain("font-size: var(--apex-type-title-size)");
  expect(
    /\.race-focus-content[^}]*\.circuit-silhouette\s+img\s*\{[^}]*height:\s*var\(--apex-size-overview-track-compact\)/s.test(
      css,
    ),
  ).toBe(true);
});

test.each([
  "Short Grand Prix",
  "Independent Extra Long Named International Grand Prix",
])(
  "UX-06 preserves readable title, source winner and event-owned action: %s",
  (title) => {
    render(
      <MemoryRouter>
        <RaceFocus
          compact
          includeSeasonProgress={false}
          summary={{
            season: { year: 2024, eventCount: 23 },
            latestCompletedEvent: {
              id: "event:fixture",
              year: 2024,
              round: 1,
              name: title,
              status: "completed",
              schedule: { date: "2024-07-07" },
            },
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getByText("Fixture Winner")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open race detail" }),
    ).toHaveAttribute("href", "/events/event%3Afixture?season=2024");
    expect(document.querySelector(".race-focus-copy")).toContainElement(
      screen.getByRole("link", { name: "Open race detail" }),
    );
  },
);
