import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  toUtcIso,
  seriesWindowError,
  SeriesWindowControls,
} from "../src/pages/RaceDetail";
afterEach(cleanup);

test.each([
  ["2026-10-11T12:00", "2026-10-11T12:00:00.000Z"],
  ["2026-10-11T12:00:17", "2026-10-11T12:00:17.000Z"],
  ["2026-10-11T12:00:17.125", "2026-10-11T12:00:17.125Z"],
  ["2026-10-11T12:00:17Z", "2026-10-11T12:00:17.000Z"],
  ["2026-10-11T13:00:17+01:00", "2026-10-11T12:00:17.000Z"],
  ["2026-10-12T00:00:17+09:00", "2026-10-11T15:00:17.000Z"],
])("UX-10 strict UTC input preserves seconds %s", (input, expected) => {
  expect(toUtcIso(input)).toBe(expected);
});

test.each([
  null,
  "",
  "not a date",
  "2026-02-30T12:00:00Z",
  "2026-10-11T24:00:00Z",
  "2026-13-11T12:00:00Z",
  "2026-10-11",
  "2026-10-11T12:00:00+25:00",
])("UX-10 malformed/missing input is not silently normalized %s", (input) => {
  expect(toUtcIso(input)).toBeNull();
});

test("UX-10 malformed, reversed and oversized windows give distinct guidance", () => {
  expect(
    seriesWindowError("driver", "2026-02-30T12:00:00Z", "2026-03-02T12:01:00Z"),
  ).toContain("valid UTC");
  expect(seriesWindowError("driver", "bad", "2026-10-11T12:01:00Z")).toContain(
    "valid UTC",
  );
  expect(
    seriesWindowError("driver", "2026-10-11T12:01:00Z", "2026-10-11T12:00:00Z"),
  ).toContain("after");
  expect(
    seriesWindowError("driver", "2026-10-11T12:00:17Z", "2026-10-11T12:02:17Z"),
  ).toBe("");
  expect(
    seriesWindowError(
      "driver",
      "2026-10-11T12:00:17Z",
      "2026-10-11T12:02:17.001Z",
    ),
  ).toContain("120 seconds");
});

test("UX-10 unknown published range and illustrative UTC format precede empty inputs", () => {
  render(
    <SeriesWindowControls
      dataset="telemetry"
      params={new URLSearchParams()}
      setParams={vi.fn()}
      drivers={[{ id: "driver", name: "Fixture Driver" }]}
      identities={{}}
    />,
  );
  const range = screen.getByText(/Published observation range is not supplied/);
  const example = screen.getByText(/Format example only/);
  const from = screen.getByLabelText("From (UTC)");
  expect(
    range.compareDocumentPosition(from) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    example.compareDocumentPosition(from) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(from).toHaveValue("");
  expect(screen.getByLabelText("To (UTC)")).toHaveValue("");
  expect(from).toHaveAttribute("step", "1");
});

test("UX-10 selected seconds survive rendered inputs and submission without changing scope", () => {
  const params = new URLSearchParams(
    "season=2026&session=fixture&snapshot=pub&view=telemetry&driver=driver&from=2026-10-11T12%3A00%3A17Z&to=2026-10-11T12%3A02%3A17Z&resolution=raw&cursor=old",
  );
  const setParams = vi.fn();
  render(
    <SeriesWindowControls
      dataset="telemetry"
      params={params}
      setParams={setParams}
      drivers={[{ id: "driver", name: "Fixture Driver" }]}
      identities={{}}
    />,
  );
  expect(toUtcIso(screen.getByLabelText("From (UTC)").value)).toBe(
    "2026-10-11T12:00:17.000Z",
  );
  expect(toUtcIso(screen.getByLabelText("To (UTC)").value)).toBe(
    "2026-10-11T12:02:17.000Z",
  );
  fireEvent.submit(
    screen.getByRole("button", { name: "Load telemetry" }).closest("form"),
  );
  const next = setParams.mock.calls[0][0];
  expect(next.get("from")).toBe("2026-10-11T12:00:17.000Z");
  expect(next.get("to")).toBe("2026-10-11T12:02:17.000Z");
  expect(next.get("resolution")).toBe("raw");
  expect(next.get("season")).toBe("2026");
  expect(next.get("snapshot")).toBe("pub");
  expect(next.has("cursor")).toBe(false);
});

test.each([
  ["", "2026-10-11T12:00:17", "both UTC"],
  ["2026-10-11T12:02:17", "2026-10-11T12:00:17", "after"],
  ["2026-10-11T12:00:17", "2026-10-11T12:02:18", "120 seconds"],
])("UX-10 form rejects %s..%s before requesting", (from, to, guidance) => {
  const setParams = vi.fn();
  render(
    <SeriesWindowControls
      dataset="telemetry"
      params={new URLSearchParams("driver=driver&resolution=100ms")}
      setParams={setParams}
      drivers={[{ id: "driver", name: "Fixture Driver" }]}
      identities={{}}
      availability="unavailable"
    />,
  );
  fireEvent.change(screen.getByLabelText("From (UTC)"), {
    target: { value: from },
  });
  fireEvent.change(screen.getByLabelText("To (UTC)"), {
    target: { value: to },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Load telemetry" }).closest("form"),
  );
  expect(screen.getByRole("status")).toHaveTextContent(guidance);
  expect(setParams).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Resolution")).toHaveValue("100ms");
  expect(
    screen.getByText(/Published telemetry coverage: unavailable/),
  ).toBeInTheDocument();
});

test("UX-10 malformed URL calendar remains explained; no replacement default", () => {
  render(
    <SeriesWindowControls
      dataset="telemetry"
      params={
        new URLSearchParams(
          "driver=driver&from=2026-02-30T12%3A00%3A17Z&to=2026-03-02T12%3A01%3A17Z",
        )
      }
      setParams={vi.fn()}
      drivers={[{ id: "driver", name: "Fixture Driver" }]}
      identities={{}}
    />,
  );
  expect(screen.getByLabelText("From (UTC)")).toHaveValue("");
  expect(screen.getByRole("status")).toHaveTextContent("valid UTC");
});

test("UX-10 supplied fractional seconds remain exact with subsecond input step", () => {
  render(
    <SeriesWindowControls
      dataset="telemetry"
      params={
        new URLSearchParams(
          "driver=driver&from=2026-10-11T12%3A00%3A17.125Z&to=2026-10-11T12%3A00%3A37.125Z",
        )
      }
      setParams={vi.fn()}
      drivers={[{ id: "driver", name: "Fixture Driver" }]}
      identities={{}}
    />,
  );
  expect(screen.getByLabelText("From (UTC)")).toHaveValue(
    "2026-10-11T12:00:17.125",
  );
  expect(screen.getByLabelText("From (UTC)")).toHaveAttribute("step", "0.001");
});
