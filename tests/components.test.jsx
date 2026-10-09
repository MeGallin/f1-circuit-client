import { test, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  Tabs,
  Button,
  DataBoundary,
  FreshnessSummary,
} from "../src/components/ui";
import { seasonImportStatus } from "../src/features/season/selectors";
import { Navigation, routeTitle } from "../src/components/AppShell";
import { MemoryRouter } from "react-router-dom";
afterEach(cleanup);
test("navigation does not leak Compare kind into Standings while retaining season/event/publication context", () => {
  render(
    <MemoryRouter
      initialEntries={[
        "/compare?kind=season&season=2026&event=event%3A2026%3A16&snapshot=publication&cursor=old",
      ]}
    >
      <Navigation />
    </MemoryRouter>,
  );
  const standings = new URL(
    screen.getByRole("link", { name: "Standings" }).getAttribute("href"),
    "http://fixture",
  );
  expect(standings.searchParams.get("kind")).toBeNull();
  expect(standings.searchParams.get("season")).toBe("2026");
  expect(standings.searchParams.get("event")).toBe("event:2026:16");
  expect(standings.searchParams.get("snapshot")).toBe("publication");
  expect(standings.searchParams.has("cursor")).toBe(false);
});
test("navigation preserves owned championship selection but not its kind or round on another route", () => {
  render(
    <MemoryRouter
      initialEntries={[
        "/standings?kind=constructors&season=2000&round=17&snapshot=publication&standingSnapshotId=standing%3A2000%3A17",
      ]}
    >
      <Navigation />
    </MemoryRouter>,
  );
  const standings = new URL(
    screen.getByRole("link", { name: "Standings" }).getAttribute("href"),
    "http://fixture",
  );
  expect(standings.searchParams.get("kind")).toBe("constructors");
  expect(standings.searchParams.get("round")).toBe("17");
  expect(standings.searchParams.get("standingSnapshotId")).toBe(
    "standing:2000:17",
  );
  const calendar = new URL(
    screen.getByRole("link", { name: "Calendar" }).getAttribute("href"),
    "http://fixture",
  );
  expect(calendar.searchParams.has("kind")).toBe(false);
  expect(calendar.searchParams.has("round")).toBe(false);
  expect(calendar.searchParams.get("snapshot")).toBe("publication");
});
test("tabs support keyboard movement and selection semantics", async () => {
  function Sample() {
    const [value, setValue] = useState("one");
    return (
      <Tabs
        label="Samples"
        value={value}
        onChange={setValue}
        items={[
          { value: "one", label: "One" },
          { value: "two", label: "Two" },
        ]}
      >
        <p>{value}</p>
      </Tabs>
    );
  }
  render(<Sample />);
  const user = userEvent.setup();
  screen.getByRole("tab", { name: "One" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
  expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("tabpanel")).toHaveTextContent("two");
});
test("disabled actions cannot fire and errors offer explicit retry", async () => {
  const action = vi.fn();
  render(
    <Button disabled onClick={action}>
      Unavailable
    </Button>,
  );
  await userEvent.click(screen.getByRole("button"));
  expect(action).not.toHaveBeenCalled();
  cleanup();
  render(
    <DataBoundary
      query={{ isError: true, error: { status: 503 }, refetch: action }}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(action).toHaveBeenCalledOnce();
});
test("refreshing keeps current data visible and announces the update", () => {
  render(
    <DataBoundary
      query={{
        currentData: { items: [{ id: "one" }] },
        isFetching: true,
        isError: false,
        refetch: vi.fn(),
      }}
    >
      <p>Current archive data</p>
    </DataBoundary>,
  );
  expect(screen.getByText("Current archive data")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Updating this view");
  expect(screen.getByRole("status").parentElement).toHaveAttribute(
    "aria-busy",
    "true",
  );
});
test("mobile navigation keeps primary tasks visible and groups secondary routes", async () => {
  render(
    <MemoryRouter initialEntries={["/questions?season=2026"]}>
      <Navigation mobile />
    </MemoryRouter>,
  );
  expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Calendar" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Standings" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute(
    "href",
    "/explore",
  );
  const more = screen.getByRole("button", { name: "More" });
  expect(more).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(more);
  expect(more).toHaveAttribute("aria-expanded", "true");
  expect(
    screen.queryByRole("link", { name: "Records" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Ask" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Sources" })).toBeInTheDocument();
  expect(more).toHaveClass("active");
});
test("route titles identify the current archive journey", () => {
  expect(routeTitle("/")).toBe("Season overview");
  expect(routeTitle("/events/event%3Aone")).toBe("Race detail");
  expect(routeTitle("/drivers/driver%3Aone")).toBe("Driver profile");
  expect(routeTitle("/unknown")).toBe("F1 Circuit");
});
test("freshness and archive coverage use distinct language", () => {
  render(
    <FreshnessSummary
      meta={{
        freshness: {
          throughEventName: "Spanish Grand Prix",
          throughDate: "13 Sept 2026",
        },
      }}
    />,
  );
  expect(
    screen.getByText("Results through Spanish Grand Prix · 13 Sept 2026"),
  ).toBeInTheDocument();
  expect(seasonImportStatus({ eventCount: 23, completedCount: 14 })).toBe(
    "Partial import · 14/23 rounds",
  );
});
