import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as time from "../src/components/RaceCountdown";
import { setTimeDisplayPreference } from "../src/features/season/timeDisplay";
afterEach(() => {
  cleanup();
  localStorage.removeItem("apex-time-display");
  vi.restoreAllMocks();
  setTimeDisplayPreference("local");
  localStorage.removeItem("apex-time-display");
});
const schedule = (startsAt) => ({
  startsAt,
  timePrecision: "second",
  date: startsAt.slice(0, 10),
});

test("review: malformed clock values do not normalize into an invented published start", () => {
  expect(
    time.formatScheduleTime(schedule("2026-10-11T24:00:00Z")).precise,
  ).toBe(false);
});

test("review: malformed venue timezone is explicitly unavailable, not a validated zone claim", () => {
  render(
    <time.ScheduleTime
      schedule={{
        ...schedule("2026-10-11T12:00:00Z"),
        circuitTimeZone: "not/a-zone",
      }}
      showVenue
    />,
  );
  expect(
    screen.queryByText("Venue time zone: not/a-zone"),
  ).not.toBeInTheDocument();
  expect(screen.getByText("Venue time zone unavailable.")).toBeInTheDocument();
});

test("UX-07 venue label uses supplied source zone without changing viewer time", () => {
  const original = Intl.DateTimeFormat.prototype.resolvedOptions;
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(
    function () {
      return { ...original.call(this), timeZone: "Europe/London" };
    },
  );
  render(
    <time.ScheduleTime
      schedule={{
        ...schedule("2026-10-11T12:00:00Z"),
        circuitTimeZone: "Asia/Singapore",
      }}
      showVenue
    />,
  );
  expect(
    screen.getByText("Venue time zone: Asia/Singapore"),
  ).toBeInTheDocument();
  expect(
    screen.queryByText("Venue time zone not supplied."),
  ).not.toBeInTheDocument();
  expect(screen.getByText(/13:00 BST/)).toBeInTheDocument();
  expect(screen.getByText(/12:00 UTC/)).toBeInTheDocument();
});

test("UX-07 failed preference writes still change all mounted consumers in memory", () => {
  localStorage.removeItem("apex-time-display");
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota fixture");
  });
  render(
    <>
      <time.TimeDisplayPreference />
      <time.ScheduleTime schedule={schedule("2026-10-11T12:00:00Z")} />
      <time.ScheduleTime schedule={schedule("2026-10-11T12:00:00Z")} />
    </>,
  );
  fireEvent.change(screen.getByRole("combobox", { name: "Time display" }), {
    target: { value: "utc" },
  });
  expect(screen.getByRole("combobox", { name: "Time display" })).toHaveValue(
    "utc",
  );
  expect(screen.getAllByText("11 Oct 2026, 12:00 UTC")).toHaveLength(2);
  expect(localStorage.getItem("apex-time-display")).toBeNull();
});

test("UX-07 viewer London shows 13 BST alongside 12 UTC without changing countdown instant", () => {
  const original = Intl.DateTimeFormat.prototype.resolvedOptions;
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(
    function () {
      return { ...original.call(this), timeZone: "Europe/London" };
    },
  );
  localStorage.removeItem("apex-time-display");
  const { container } = render(
    <time.RaceCountdown
      startsAt="2026-10-11T12:00:00Z"
      timePrecision="second"
      now={Date.parse("2026-10-11T11:00:00Z")}
    />,
  );
  expect(screen.getByText(/13:00 BST/)).toBeInTheDocument();
  expect(screen.getByText(/12:00 UTC/)).toBeInTheDocument();
  expect(screen.getByText(/Europe\/London/)).toBeInTheDocument();
  expect(screen.getByRole("timer")).toHaveAccessibleName(
    "Race starts in 1 hours",
  );
  expect(container.querySelector("time")).toHaveAttribute(
    "datetime",
    "2026-10-11T12:00:00.000Z",
  );
});

test.each([
  ["2026-10-11T12:00:00Z", "Europe/London", "13:00 BST"],
  ["2026-12-11T12:00:00Z", "Europe/London", "12:00 GMT"],
  ["2026-03-29T00:30:00Z", "Europe/London", "00:30 GMT"],
  ["2026-03-29T01:30:00Z", "Europe/London", "02:30 BST"],
  ["2026-10-25T00:30:00Z", "Europe/London", "01:30 BST"],
  ["2026-10-25T01:30:00Z", "Europe/London", "01:30 GMT"],
  ["2026-10-11T23:30:00Z", "Asia/Tokyo", "12 Oct 2026, 08:30"],
])("UX-07 Intl conversion %s in %s => %s", (instant, zone, expected) => {
  const model = time.formatScheduleTime(schedule(instant), {
    mode: "local",
    timeZone: zone,
  });
  expect(model.primary).toContain(expected);
  expect(model.utc).toContain("UTC");
  expect(model.instant).toBe(new Date(instant).toISOString());
});

test("UX-07 date-only/missing/invalid do not imply midnight or shift published date", () => {
  const dateOnly = time.formatScheduleTime(
    { date: "2026-10-11", timePrecision: "date" },
    { mode: "local", timeZone: "America/Los_Angeles" },
  );
  expect(dateOnly.primary).toBe("11 Oct 2026");
  expect(dateOnly.precise).toBe(false);
  expect(dateOnly.instant).toBeNull();
  expect(time.formatScheduleTime({ date: "2026-02-30" }).primary).toBe(
    "Date not supplied",
  );
  expect(time.formatScheduleTime(schedule("not-a-time")).precise).toBe(false);
  expect(time.formatScheduleTime({}).primary).toBe("Date not supplied");
  expect(
    time.formatScheduleTime({
      startsAt: "2026-10-11T12:00:00",
      timePrecision: "second",
    }).precise,
  ).toBe(false);
});

test("UX-07 UTC preference persists, updates multiple consumers and resets to viewer-local", () => {
  render(
    <>
      <time.TimeDisplayPreference />
      <time.ScheduleTime schedule={schedule("2026-10-11T12:00:00Z")} />
      <time.ScheduleTime schedule={schedule("2026-10-11T12:00:00Z")} />
    </>,
  );
  const select = screen.getByRole("combobox", { name: "Time display" });
  expect(select).toHaveValue("local");
  fireEvent.change(select, { target: { value: "utc" } });
  expect(localStorage.getItem("apex-time-display")).toBe("utc");
  expect(screen.getAllByText("11 Oct 2026, 12:00 UTC")).toHaveLength(2);
  cleanup();
  render(<time.TimeDisplayPreference />);
  expect(screen.getByRole("combobox", { name: "Time display" })).toHaveValue(
    "utc",
  );
  fireEvent.click(screen.getByRole("button", { name: "Reset time display" }));
  expect(screen.getByRole("combobox", { name: "Time display" })).toHaveValue(
    "local",
  );
  expect(localStorage.getItem("apex-time-display")).toBe("local");
});
