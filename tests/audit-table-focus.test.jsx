import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DataTable } from "../src/components/ui";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("queued table focus correction ignores rapid focus replacement and unmount", () => {
  const frames = [];
  vi.stubGlobal("requestAnimationFrame", (callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("getComputedStyle", () => ({
    position: "sticky",
    outlineWidth: "0",
    outlineOffset: "0",
    getPropertyValue: () => "",
  }));
  const view = render(
    <DataTable
      stickyIdentity
      caption="Independent focus fixture"
      columns={[
        {
          key: "driver",
          label: "Driver",
          rowHeader: true,
          stickyIdentity: true,
        },
        {
          key: "action",
          label: "Evidence",
          render: (row) => <a href={`#${row.id}`}>Evidence {row.id}</a>,
        },
      ]}
      rows={[
        { id: "one", driver: "First" },
        { id: "two", driver: "Second" },
      ]}
    />,
  );
  const region = screen.getByRole("region", {
    name: "Independent focus fixture",
  });
  const scroll = vi.fn();
  region.scrollBy = scroll;
  region.getBoundingClientRect = () => ({ left: 0, right: 200 });
  region.querySelector(".table-sticky-identity").getBoundingClientRect =
    () => ({ right: 100 });
  const first = screen.getByRole("link", { name: "Evidence one" });
  const second = screen.getByRole("link", { name: "Evidence two" });
  first.getBoundingClientRect = () => ({ left: 250, right: 300 });
  second.getBoundingClientRect = () => ({ left: 120, right: 180 });
  first.focus();
  second.focus();
  expect(second).toHaveFocus();
  frames.splice(0).forEach((callback) => callback());
  expect(scroll).not.toHaveBeenCalled();
  first.focus();
  frames.splice(0).forEach((callback) => callback());
  expect(scroll).toHaveBeenCalledExactlyOnceWith({
    left: 100,
    behavior: "instant",
  });
  scroll.mockClear();
  second.focus();
  first.focus();
  view.unmount();
  frames.splice(0).forEach((callback) => callback());
  expect(scroll).not.toHaveBeenCalled();
});
