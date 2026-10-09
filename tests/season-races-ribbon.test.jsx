import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { SeasonEventStrip } from "../src/features/season/SeasonEventStrip";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete HTMLElement.prototype.scrollTo;
});
const race = (id, round, coverage, status = "unknown") => ({
  id,
  round,
  name: `${id} Grand Prix`,
  status,
  schedule: { date: "2026-10-04" },
  features: [{ key: "results", coverage }],
});
const events = [
  race("future", 7, "unavailable", "scheduled"),
  race("latest", 5, "partial"),
  race("cancelled", 2, "unavailable", "cancelled"),
  race("earlier", 1, "complete"),
  race("missing", 3, "unavailable", "completed"),
];

test("same-latest calendar replacement preserves history scroll/focus, while return to ribbon re-centres", () => {
  const scrollTo = vi.fn(function ({ left }) {
    this.scrollLeft = left;
  });
  HTMLElement.prototype.scrollTo = scrollTo;
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(1000);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function () {
      return {
        left:
          this.dataset.eventId === "latest"
            ? 600 - this.parentElement.scrollLeft
            : 0,
        width: this.dataset.eventId ? 200 : 400,
      };
    },
  );
  const view = render(<SeasonEventStrip events={events} />);
  const list = screen.getByRole("list");
  list.scrollLeft = 0;
  const earlier = within(
    list.querySelector('[data-event-id="earlier"]'),
  ).getByRole("button");
  earlier.focus();
  scrollTo.mockClear();
  view.rerender(
    <SeasonEventStrip events={events.map((event) => ({ ...event }))} />,
  );
  expect(scrollTo).not.toHaveBeenCalled();
  expect(list.scrollLeft).toBe(0);
  expect(earlier).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Show all rounds" }));
  fireEvent.click(screen.getByRole("button", { name: "Return to ribbon" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 500, behavior: "auto" });
});

test("viewport resize re-centres latest results and disconnects its observer on unmount", () => {
  let width = 400;
  let resized;
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback) {
        resized = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  const scrollTo = vi.fn(function ({ left }) {
    this.scrollLeft = left;
  });
  HTMLElement.prototype.scrollTo = scrollTo;
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
    () => width,
  );
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(1000);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function () {
      return {
        left:
          this.dataset.eventId === "latest"
            ? 600 - this.parentElement.scrollLeft
            : 0,
        width: this.dataset.eventId ? 200 : width,
      };
    },
  );
  const view = render(<SeasonEventStrip events={events} />);
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 500, behavior: "auto" });
  width = 200;
  act(() => resized());
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 600, behavior: "auto" });
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

test("ribbon sorts actual rounds, counts published coverage, and never invents missing cards", () => {
  render(<SeasonEventStrip events={events} eventCount={23} resultsCount={4} />);
  const list = screen.getByRole("list", { name: "Season races" });
  expect(
    within(list)
      .getAllByRole("listitem")
      .map((item) => item.dataset.eventId),
  ).toEqual(["earlier", "cancelled", "missing", "latest", "future"]);
  expect(
    screen.getByText("2 of 5 races have published results"),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Select a race to view details and results."),
  ).toBeInTheDocument();
  expect(screen.getAllByText("Latest results")).toHaveLength(1);
  expect(list.querySelector('[data-event-id="latest"]')).toHaveClass(
    "season-race-card--latest",
  );
  expect(
    within(list.querySelector('[data-event-id="missing"]')).getByText(
      "View event",
    ),
  ).toBeInTheDocument();
  expect(
    within(list.querySelector('[data-event-id="missing"]')).getByText(
      "Results not published",
    ),
  ).toBeInTheDocument();
  expect(screen.getByText("Cancelled")).toBeInTheDocument();
  expect(
    within(list.querySelector('[data-event-id="future"]')).getByText(
      "Upcoming",
    ),
  ).toBeInTheDocument();
});

test("cards select exact API identity without navigation, and expanded grid uses the same cards", () => {
  const onSelect = vi.fn();
  render(
    <SeasonEventStrip
      events={events}
      selectedEventId="cancelled"
      onSelect={onSelect}
    />,
  );
  const button = screen.getByRole("button", {
    name: /Round 2: cancelled Grand Prix/,
  });
  expect(button).toHaveAttribute("aria-current", "true");
  fireEvent.click(button);
  expect(onSelect).toHaveBeenCalledWith(events[2]);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  const toggle = screen.getByRole("button", { name: "Show all rounds" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("list")).toHaveClass("season-races-list--expanded");
  expect(screen.getAllByRole("listitem")).toHaveLength(5);
  expect(
    screen.queryByRole("button", { name: "Show later races" }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Return to ribbon" }));
  expect(screen.getByRole("list")).not.toHaveClass(
    "season-races-list--expanded",
  );
});

test("no published results means no latest label or fabricated completed results", () => {
  render(
    <SeasonEventStrip
      events={[race("missing", 1, "unavailable", "completed")]}
    />,
  );
  expect(
    screen.getByText("0 of 1 races have published results"),
  ).toBeInTheDocument();
  expect(screen.queryByText("Latest results")).not.toBeInTheDocument();
  expect(screen.queryByText("View results")).not.toBeInTheDocument();
});

test.each(["scheduled", "unknown"])(
  "precise past %s race is pending rather than upcoming",
  (status) => {
    const pending = {
      ...race("pending", 16, "unavailable", status),
      schedule: {
        date: "2026-10-04",
        startsAt: "2026-10-04T07:00:00Z",
        timePrecision: "second",
      },
    };
    render(<SeasonEventStrip events={[pending]} now="2026-10-06T12:00:00Z" />);
    expect(screen.getByText("Results pending")).toBeInTheDocument();
    expect(screen.queryByText("Upcoming")).not.toBeInTheDocument();
    expect(screen.getByText("View event")).toBeInTheDocument();
  },
);

test("empty calendar does not invent rounds", () => {
  render(<SeasonEventStrip events={[]} eventCount={23} />);
  expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  expect(screen.getByText("No calendar races supplied")).toBeInTheDocument();
});

test("legacy normalized calendar retains published result markers when optional features are omitted", () => {
  const records = [
    { ...race("Spanish", 14, undefined, "completed"), features: [] },
    { ...race("Azerbaijan", 15, undefined, "completed"), features: [] },
    race("Bahrain in Malaysia", 16, "partial", "completed"),
    { ...race("Singapore", 17, undefined, "scheduled"), features: [] },
  ];
  render(<SeasonEventStrip events={records} />);
  expect(
    screen.getByText("3 of 4 races have published results"),
  ).toBeInTheDocument();
  expect(screen.getAllByText("View results")).toHaveLength(2);
  expect(
    screen.getByRole("button", { name: /Round 16:.*Latest results/ }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Results not published")).not.toBeInTheDocument();
});

test.each([false, true])(
  "scroll arrows measure viewport, target latest ID not count index, and reduced motion=%s",
  (reduce) => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: reduce })),
    );
    const scrollTo = vi.fn(function ({ left }) {
      this.scrollLeft = left;
    });
    HTMLElement.prototype.scrollTo = scrollTo;
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(1000);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function () {
        return {
          left: this.dataset.eventId === "latest" ? 600 : 0,
          width: this.dataset.eventId ? 200 : 400,
        };
      },
    );
    render(<SeasonEventStrip events={events} resultsCount={1} />);
    expect(scrollTo).toHaveBeenCalledWith({ left: 500, behavior: "auto" });
    const next = screen.getByRole("button", { name: "Show later races" });
    const previous = screen.getByRole("button", { name: "Show earlier races" });
    expect(previous).toBeEnabled();
    fireEvent.click(next);
    expect(scrollTo).toHaveBeenLastCalledWith({
      left: 600,
      behavior: reduce ? "auto" : "smooth",
    });
    fireEvent.scroll(screen.getByRole("list"));
    expect(next).toBeDisabled();
    const list = screen.getByRole("list");
    list.scrollLeft = 0;
    fireEvent.scroll(list);
    expect(previous).toBeDisabled();
  },
);
