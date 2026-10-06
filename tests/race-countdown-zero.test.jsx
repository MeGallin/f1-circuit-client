import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { RaceCountdown } from "../src/components/RaceCountdown";

const target = "2026-10-11T12:00:00Z";
const targetMs = Date.parse(target);
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function visibleParts(container) {
  return [...container.querySelectorAll(".race-countdown-part")].map((part) => [
    part.querySelector("span").textContent,
    part.querySelector("strong").textContent,
  ]);
}
test.each(
  ["default", "wide"].flatMap((variant) => [
    [
      variant,
      3600000,
      [
        ["H", "01"],
        ["M", "00"],
        ["S", "00"],
      ],
    ],
    [
      variant,
      60000,
      [
        ["H", "00"],
        ["M", "01"],
        ["S", "00"],
      ],
    ],
    [
      variant,
      1000,
      [
        ["H", "00"],
        ["M", "00"],
        ["S", "01"],
      ],
    ],
  ]),
)(
  "%s keeps zero clock units visible at %sms remaining",
  (variant, remaining, expected) => {
    const { container } = render(
      <RaceCountdown
        startsAt={target}
        timePrecision="second"
        now={targetMs - remaining}
        variant={variant}
      />,
    );
    expect(visibleParts(container)).toEqual(expected);
  },
);
test("live second ticks display 01 then 00 then 59 without removing a unit", () => {
  vi.useFakeTimers();
  vi.setSystemTime(targetMs - 61000);
  const { container } = render(
    <RaceCountdown startsAt={target} timePrecision="second" />,
  );
  expect(visibleParts(container)).toEqual([
    ["H", "00"],
    ["M", "01"],
    ["S", "01"],
  ]);
  act(() => vi.advanceTimersByTime(1000));
  expect(visibleParts(container)).toEqual([
    ["H", "00"],
    ["M", "01"],
    ["S", "00"],
  ]);
  act(() => vi.advanceTimersByTime(1000));
  expect(visibleParts(container)).toEqual([
    ["H", "00"],
    ["M", "00"],
    ["S", "59"],
  ]);
});
test.each([
  [
    "minute",
    [3660000, 3600000, 3599000],
    [
      [
        ["H", "01"],
        ["M", "01"],
        ["S", "00"],
      ],
      [
        ["H", "01"],
        ["M", "00"],
        ["S", "00"],
      ],
      [
        ["H", "00"],
        ["M", "59"],
        ["S", "59"],
      ],
    ],
  ],
  [
    "hour/day",
    [90000000, 86400000, 86399000],
    [
      [
        ["days", "01"],
        ["H", "01"],
        ["M", "00"],
        ["S", "00"],
      ],
      [
        ["days", "01"],
        ["H", "00"],
        ["M", "00"],
        ["S", "00"],
      ],
      [
        ["H", "23"],
        ["M", "59"],
        ["S", "59"],
      ],
    ],
  ],
])(
  "%s rollover preserves zero and padded clock units",
  (_unit, remaining, expected) => {
    const { container, rerender } = render(
      <RaceCountdown
        startsAt={target}
        timePrecision="second"
        now={targetMs - remaining[0]}
      />,
    );
    remaining.forEach((value, index) => {
      rerender(
        <RaceCountdown
          startsAt={target}
          timePrecision="second"
          now={targetMs - value}
        />,
      );
      expect(visibleParts(container)).toEqual(expected[index]);
    });
  },
);
test("zero placeholders never replace the elapsed, pending or unavailable states", () => {
  const { rerender } = render(
    <RaceCountdown
      startsAt={target}
      timePrecision="second"
      now={targetMs}
      elapsedMessage="Results pending"
    />,
  );
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  expect(screen.getByText("Results pending")).toBeInTheDocument();
  rerender(
    <RaceCountdown
      startsAt={target}
      timePrecision="date"
      now={targetMs - 60000}
    />,
  );
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  expect(
    screen.getByText("Race start time not supplied by the schedule."),
  ).toBeInTheDocument();
});
test("a positive subsecond interval retains the existing one-second minimum", () => {
  const { container } = render(
    <RaceCountdown
      startsAt={target}
      timePrecision="second"
      now={targetMs - 500}
    />,
  );
  expect(visibleParts(container)).toEqual([
    ["H", "00"],
    ["M", "00"],
    ["S", "01"],
  ]);
  expect(screen.getByRole("timer")).toHaveAccessibleName(
    "Race starts in 1 seconds",
  );
});
