import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarEvents, filterCalendarEvents } from "../src/pages/Calendar";
import { MemoryRouter } from "react-router-dom";
afterEach(cleanup);
test("calendar filters distinguish completed and upcoming events", () => {
  const events = [
    { id: "completed", status: "completed" },
    { id: "scheduled", status: "scheduled" },
    { id: "unknown", status: "unknown" },
  ];
  expect(filterCalendarEvents(events, "all").map((event) => event.id)).toEqual([
    "completed",
    "scheduled",
    "unknown",
  ]);
  expect(filterCalendarEvents(events, "completed").map((event) => event.id)).toEqual([
    "completed",
  ]);
  expect(filterCalendarEvents(events, "upcoming").map((event) => event.id)).toEqual([
    "scheduled",
  ]);
});
test("missing calendar fields stay explicit and date-only precision never invents a start time", async () => {
  const select = vi.fn();
  const event = {
    id: "test-only",
    name: "Test event",
    round: null,
    circuit: null,
    schedule: {
      date: null,
      startsAt: "2024-01-01T00:00:00Z",
      timePrecision: "date",
      circuitTimeZone: null,
    },
    status: "unknown",
    features: [{ key: "results", coverage: "partial" }],
  };
  const { rerender } = render(
    <CalendarEvents events={[event]} selectedId={null} onSelect={select} />,
    { wrapper: MemoryRouter },
  );
  expect(screen.getByText("Status not supplied")).toBeInTheDocument();
  expect(screen.getByText("Date not supplied")).toBeInTheDocument();
  expect(screen.getByText("Circuit not supplied")).toBeInTheDocument();
  expect(screen.queryByText(/00:00/)).not.toBeInTheDocument();
  screen.getByRole("button", { name: "Test event" }).focus();
  await userEvent.keyboard("{Enter}");
  expect(select).toHaveBeenCalledWith("test-only");
  rerender(
    <CalendarEvents
      events={[event]}
      selectedId="test-only"
      onSelect={select}
    />,
  );
  expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByText("results: partial")).toBeInTheDocument();
  expect(screen.getByText(/Location not supplied/)).toBeInTheDocument();
});
