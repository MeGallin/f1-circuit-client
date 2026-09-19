import { test, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Tabs, Button, DataBoundary } from "../src/components/ui";
import { Navigation, routeTitle } from "../src/components/AppShell";
import { MemoryRouter } from "react-router-dom";
afterEach(cleanup);
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
    <MemoryRouter initialEntries={["/records?season=2026"]}>
      <Navigation mobile />
    </MemoryRouter>,
  );
  expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Calendar" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Standings" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();
  const more = screen.getByRole("button", { name: "More" });
  expect(more).toHaveAttribute("aria-expanded", "false");
  await userEvent.click(more);
  expect(more).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Records" })).toBeInTheDocument();
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
