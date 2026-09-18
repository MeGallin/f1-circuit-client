import { test, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Tabs, Button, DataBoundary } from "../src/components/ui";
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
