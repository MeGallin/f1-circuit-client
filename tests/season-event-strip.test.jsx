import { expect, test, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { SeasonEventStrip } from "../src/features/season/SeasonEventStrip";

test("season event strip exposes each event as an accessible selectable block", () => {
  const onSelect = vi.fn();
  const events = [
    {
      id: "event-1",
      round: 1,
      name: "Australian Grand Prix",
      features: [{ key: "results", coverage: "complete" }],
    },
    {
      id: "event-2",
      round: 2,
      name: "Chinese Grand Prix",
      features: [{ key: "results", coverage: "complete" }],
    },
    {
      id: "event-3",
      round: 3,
      name: "Japanese Grand Prix",
      status: "scheduled",
    },
  ];
  render(
    <SeasonEventStrip
      events={events}
      eventCount={3}
      resultsCount={2}
      selectedEventId="event-2"
      onSelect={onSelect}
    />,
  );
  const buttons = within(screen.getByRole("list")).getAllByRole("button");
  expect(buttons).toHaveLength(3);
  expect(buttons[0]).toHaveAccessibleName(
    "Round 1: Australian Grand Prix. Completed. Results available. View results. Select to view event details.",
  );
  expect(buttons[2]).toHaveAccessibleName(
    "Round 3: Japanese Grand Prix. Upcoming. View event. Select to view event details.",
  );
  expect(buttons[1]).toHaveAttribute("aria-current", "true");
  fireEvent.click(buttons[2]);
  expect(onSelect).toHaveBeenCalledWith(events[2]);
});
