import { readFileSync } from "node:fs";
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { SeasonEventStrip } from "../src/features/season/SeasonEventStrip";

afterEach(cleanup);

test("card accessible names include their visible action and completed/upcoming state", () => {
  render(<SeasonEventStrip events={events} />);
  expect(within(card("older")).getByRole("button")).toHaveAccessibleName(
    /Completed.*View results/,
  );
  expect(within(card("latest")).getByRole("button")).toHaveAccessibleName(
    /Completed.*Latest results/,
  );
  expect(within(card("next")).getByRole("button")).toHaveAccessibleName(
    /Upcoming.*View event/,
  );
});

test("production overview no longer retains superseded progress selectors", () => {
  const css = readFileSync("src/styles/overview.css", "utf8");
  expect(css).not.toMatch(/\.season-(?:progress|event-strip)\b/);
  const calendar = readFileSync("src/styles/calendar.css", "utf8");
  expect(calendar).toContain(".calendar-season-progress");
});
const events = [
  {
    id: "older",
    round: 14,
    name: "Spanish Grand Prix",
    status: "completed",
    schedule: { date: "2026-09-13" },
  },
  {
    id: "latest",
    round: 16,
    name: "Bahrain Grand Prix in Malaysia",
    status: "completed",
    schedule: { date: "2026-10-04" },
    circuit: { displayName: "Sepang International Circuit" },
  },
  {
    id: "next",
    round: 17,
    name: "Singapore Grand Prix",
    status: "scheduled",
    schedule: { date: "2026-10-11" },
  },
];
const card = (id) =>
  screen.getByRole("list").querySelector(`[data-event-id="${id}"]`);

test("approved cards keep one shared whole-card button with an outlined noninteractive CTA", () => {
  const onSelect = vi.fn();
  render(<SeasonEventStrip events={events} onSelect={onSelect} />);
  for (const id of ["older", "latest", "next"]) {
    const button = within(card(id)).getByRole("button");
    expect(button).toHaveClass("button", "season-race-card-button");
    expect(button.querySelector("button, a, [role=button]")).toBeNull();
    expect(button.querySelector(".season-race-card-action")).toHaveClass(
      "button",
      "button--secondary",
    );
  }
  fireEvent.click(within(card("latest")).getByText("Latest results"));
  expect(onSelect).toHaveBeenCalledWith(events[1]);
});

test("published cards show a substantial filled flag and Completed, future cards show a calendar", () => {
  render(<SeasonEventStrip events={events} />);
  expect(within(card("older")).getByText("Completed")).toBeInTheDocument();
  expect(
    card("older").querySelector(".season-race-status-icon--completed"),
  ).toHaveAttribute("data-weight", "fill");
  expect(
    card("next").querySelector(".season-race-status-icon--upcoming"),
  ).toHaveAttribute("data-kind", "calendar");
  for (const svg of screen.getByRole("list").querySelectorAll("svg"))
    expect(svg).toHaveAttribute("aria-hidden", "true");
});

test("published count is a compact inline count and circuit metadata is source-only", () => {
  render(<SeasonEventStrip events={events} />);
  const count = screen
    .getByText("2 of 3 races have published results")
    .closest(".season-races-count");
  expect(count.querySelector("strong")).toHaveTextContent(/^2$/);
  expect(count.querySelector('span[aria-hidden="true"]')).toHaveTextContent(
    /^of 3$/,
  );
  expect(count.querySelector("br")).toBeNull();
  expect(
    within(card("latest")).getByText("Sepang International Circuit"),
  ).toBeInTheDocument();
  expect(card("older").querySelector(".season-race-card-circuit")).toBeNull();
});

test("approved footer restores distinct outlined Earlier races and Show all rounds controls", () => {
  render(<SeasonEventStrip events={events} />);
  expect(screen.getByRole("button", { name: "Earlier races" })).toHaveClass(
    "button--secondary",
  );
  const toggle = screen.getByRole("button", { name: "Show all rounds" });
  expect(toggle).toHaveClass("button--secondary");
  expect(toggle.querySelector("svg")).not.toBeNull();
  fireEvent.click(toggle);
  expect(
    screen.queryByRole("button", { name: "Earlier races" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Return to ribbon" }),
  ).toBeInTheDocument();
});

test("footer actions share equal responsive tracks and stretch height with a bounded desktop size", () => {
  const css = readFileSync("src/design-system/season-races.css", "utf8");
  expect(css).toMatch(
    /\.season-races-footer\s*\{[^}]*display: grid;[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[^}]*align-items: stretch;/s,
  );
  expect(css).toMatch(
    /\.season-races-footer > \.button\s*\{[^}]*min-inline-size: 0;[^}]*inline-size: 100%;[^}]*max-inline-size: calc\([^}]*var\(--apex-space-6\)[^}]*white-space: normal;/s,
  );
  expect(css).toMatch(
    /\.season-races-footer > \.season-races-toggle\s*\{[^}]*grid-column: 2;[^}]*justify-self: end;/s,
  );
  render(<SeasonEventStrip events={events} />);
  const earlier = screen.getByRole("button", { name: "Earlier races" });
  const toggle = screen.getByRole("button", { name: "Show all rounds" });
  expect(earlier.parentElement).toBe(toggle.parentElement);
  expect(earlier).toHaveClass("button", "button--secondary");
  expect(toggle).toHaveClass("button", "button--secondary");
  fireEvent.click(toggle);
  expect(screen.getByRole("button", { name: "Return to ribbon" })).toHaveClass(
    "season-races-toggle",
  );
});

test("approved display/mono hierarchy and latest outlined tint belong to Apex, not feature inline styles", () => {
  const css = readFileSync("src/design-system/season-races.css", "utf8");
  expect(css).toMatch(
    /\.season-races-heading h3\s*\{[^}]*font-family: var\(--apex-font-display\)[^}]*text-transform: uppercase/s,
  );
  expect(css).toMatch(
    /\.season-race-card-name\s*\{[^}]*font-family: var\(--apex-font-display\)[^}]*text-transform: uppercase/s,
  );
  expect(css).toMatch(
    /\.season-race-card-meta\s*\{[^}]*font-family: var\(--apex-font-numeric\)[^}]*text-transform: uppercase/s,
  );
  expect(css).toMatch(
    /\.season-race-card--latest[^}]*\.season-race-card-round\s*\{[^}]*accent-text/s,
  );
  expect(css).toMatch(
    /\.season-race-card--latest \.season-race-card-action\s*\{[^}]*background:[^}]*season-races-latest-tint[^}]*border-color:[^}]*accent-border/s,
  );
  expect(css).toContain("height: var(--apex-season-races-arrow-height)");
  expect(css).toContain("width: var(--apex-season-races-status-icon)");
});
