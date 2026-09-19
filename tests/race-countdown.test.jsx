import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  getCountdownParts,
  RaceCountdown,
} from "../src/components/RaceCountdown";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const raceStart = "2026-09-26T11:00:00Z";
const oneWeekBefore = Date.parse("2026-09-19T11:00:00Z");

test("countdown parts use the API race-start timestamp", () => {
  expect(getCountdownParts(raceStart, oneWeekBefore)).toEqual([
    { value: 1, unit: "week", label: "1 week" },
  ]);
  expect(
    getCountdownParts(raceStart, Date.parse("2026-09-25T10:59:58Z")),
  ).toEqual([
    { value: 1, unit: "day", label: "1 day" },
    { value: 2, unit: "second", label: "2 seconds" },
  ]);
});

test("countdown renders the exact start target and accessible timer label", () => {
  render(
    <RaceCountdown
      startsAt={raceStart}
      timePrecision="second"
      now={oneWeekBefore}
    />,
  );
  expect(screen.getByRole("timer")).toHaveAccessibleName("Race starts in 1 week");
  expect(screen.getByText("Starts 26 Sept 2026, 11:00 UTC")).toBeInTheDocument();
});

test("wide countdown keeps the start date in the header and enlarges the timer", () => {
  const { container } = render(
    <RaceCountdown
      startsAt={raceStart}
      timePrecision="second"
      now={oneWeekBefore}
      variant="wide"
    />,
  );
  expect(container.querySelector(".race-countdown--wide")).toBeInTheDocument();
  expect(container.querySelector(".race-countdown-meta time")).toHaveTextContent(
    "Starts 26 Sept 2026, 11:00 UTC",
  );
  expect(screen.getByRole("timer")).toHaveAccessibleName("Race starts in 1 week");
});

test("countdown refuses to invent a time from a date-only schedule", () => {
  render(
    <RaceCountdown
      startsAt="2026-09-26T00:00:00Z"
      timePrecision="date"
      now={oneWeekBefore}
    />,
  );
  expect(
    screen.getByText("Race start time not supplied by the schedule."),
  ).toBeInTheDocument();
});
