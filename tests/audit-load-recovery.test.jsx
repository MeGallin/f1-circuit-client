import { afterEach, expect, test, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { DataBoundary } from "../src/components/ui";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Overview from "../src/pages/Overview";
import { archiveApi } from "../src/api/archiveApi";
import { createControlledArchive } from "./browser-qa/controlledArchive";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("UX-09 eight-second slow load exposes announced recovery and deduplicates rapid clicks", async () => {
  vi.useFakeTimers();
  let finish;
  const refetch = vi.fn(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const view = render(
    <DataBoundary query={{ isLoading: true, isFetching: true, refetch }}>
      <p>Selected 2025 result</p>
    </DataBoundary>,
  );
  expect(
    screen.queryByRole("button", { name: "Retry load" }),
  ).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(7999));
  expect(
    screen.queryByRole("button", { name: "Retry load" }),
  ).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole("status")).toHaveTextContent("taking longer");
  fireEvent.click(screen.getByRole("button", { name: "Retry load" }));
  fireEvent.click(screen.getByRole("button", { name: "Retry load" }));
  expect(refetch).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status")).toHaveTextContent(
    "Checking the existing request",
  );
  await act(async () => finish());
  view.rerender(
    <DataBoundary
      query={{ isSuccess: true, currentData: { year: 2025 }, refetch }}
    >
      <p>Selected 2025 result</p>
    </DataBoundary>,
  );
  expect(screen.getByText("Selected 2025 result")).toBeInTheDocument();
  expect(screen.queryByText(/taking longer/)).not.toBeInTheDocument();
});

test("UX-09 old-argument data cannot replace current selection loading, then failure can recover", () => {
  const retry = vi.fn();
  const view = render(
    <DataBoundary
      query={{
        data: { year: 2026 },
        currentData: undefined,
        isFetching: true,
        refetch: retry,
      }}
    >
      <p>Old 2026 result</p>
    </DataBoundary>,
  );
  expect(screen.queryByText("Old 2026 result")).not.toBeInTheDocument();
  view.rerender(
    <DataBoundary
      query={{ isError: true, error: { status: 503 }, refetch: retry }}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("selection is preserved");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledTimes(1);
});

test("UX-09 rejecting recovery callback is handled, unlocks retry and survives unmount", async () => {
  vi.useFakeTimers();
  let rejectAfterUnmount;
  const retry = vi
    .fn()
    .mockRejectedValueOnce(new Error("controlled callback failure"))
    .mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectAfterUnmount = reject;
        }),
    );
  const view = render(
    <DataBoundary query={{ isLoading: true, refetch: retry }} />,
  );
  act(() => vi.advanceTimersByTime(8000));
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Retry load" })),
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Unable to check the request",
  );
  expect(screen.getByRole("button", { name: "Retry load" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Retry load" }));
  expect(retry).toHaveBeenCalledTimes(2);
  view.unmount();
  await act(async () =>
    rejectAfterUnmount(new Error("controlled unmount failure")),
  );
});

test("UX-09 real Overview keeps known season control during delayed reads and recovers without duplicate active requests", async () => {
  const transport = createControlledArchive();
  vi.stubGlobal("fetch", (request) => transport.fetch(request));
  const store = configureStore({
    reducer: { [archiveApi.reducerPath]: archiveApi.reducer },
    middleware: (g) => g().concat(archiveApi.middleware),
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?season=2025"]}>
        <Overview />
      </MemoryRouter>
    </Provider>,
  );
  const select = await screen.findByRole("combobox", { name: "Season" });
  await waitFor(() => expect(transport.snapshot().active[2025]).toBe(1));
  expect(select).toBeEnabled();
  await act(async () => new Promise((resolve) => setTimeout(resolve, 8100)));
  fireEvent.click(screen.getByRole("button", { name: "Retry load" }));
  fireEvent.click(screen.getByRole("button", { name: "Retry load" }));
  await act(async () => Promise.resolve());
  expect(transport.snapshot().counts[2025]).toBe(1);
  expect(transport.snapshot().maximum[2025]).toBe(1);
  fireEvent.change(select, { target: { value: "2024" } });
  await waitFor(() => expect(transport.snapshot().active[2024]).toBe(1));
  expect(select).toHaveValue("2024");
  expect(
    screen.queryByText(/2025 has not been imported/),
  ).not.toBeInTheDocument();
  act(() => transport.release("error"));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We could not load",
  );
  transport.setMode("hold");
  const retry = screen.getByRole("button", { name: "Try again" });
  fireEvent.click(retry);
  fireEvent.click(retry);
  await waitFor(() => expect(transport.snapshot().counts[2024]).toBe(2));
  expect(transport.snapshot().maximum[2024]).toBe(1);
  act(() => transport.release("success"));
  await waitFor(() =>
    expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
  );
  expect(select).toHaveValue("2024");
  expect(
    await screen.findByText("No race data imported for 2024"),
  ).toBeInTheDocument();
  store.dispatch(archiveApi.util.resetApiState());
}, 20000);
