import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as evidencePage from "../src/pages/Evidence";
import { RaceResultTable, RaceRecords } from "../src/pages/RaceDetail";
const field = (path, selectedValue) => ({
  path,
  selectedValue,
  coverage: "partial",
  verification: "source-only",
  assertions: [
    {
      sourceId: "fixture-source",
      value: selectedValue,
      retrievedAt: "2024-07-07T14:00:00Z",
    },
  ],
});
const fields = [
  field("/items/4/id", "result:first"),
  field("/items/4/points", "25"),
  field("/items/4/entry/drivers/0/displayName", "First Driver"),
  field("/items/7/id", "result:second"),
  field("/items/7/points", "18"),
  field("/items/7/position", 2),
  field("/items/7/entry/drivers/0/displayName", "Second Driver"),
];
const state = vi.hoisted(() => ({ detail: null }));
vi.mock("../src/api/archiveApi", () => ({
  useGetEvidenceQuery: () => ({
    currentData: {
      evidence: { evidenceId: "shared", snapshotId: "publication", fields },
    },
  }),
  useGetEventQuery: () => ({ currentData: { detail: state.detail } }),
}));
afterEach(() => {
  cleanup();
  state.detail = null;
});

test("review: evidence return context cannot become a protocol-relative external navigation", () => {
  render(
    <MemoryRouter
      initialEntries={["/evidence/shared?from=%2F%5Coutside.example"]}
    >
      <Routes>
        <Route
          path="/evidence/:evidenceId"
          element={<evidencePage.default />}
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("link", { name: "Back to selected record" }),
  ).toHaveAttribute("href", "/sources");
});

test.each([false, true])(
  "review: evidence event attribution requires session membership: %s",
  (belongs) => {
    fields.push(field("/items/7/sessionId", "session:selected"));
    state.detail = {
      event: { id: "event:other", name: "Other Race", year: 2023 },
      sessions: [
        {
          id: belongs ? "session:selected" : "session:unrelated",
          eventId: "event:other",
        },
      ],
    };
    try {
      render(
        <MemoryRouter
          initialEntries={[
            "/evidence/shared?recordId=result%3Asecond&session=session%3Aselected&event=event%3Aother",
          ]}
        >
          <Routes>
            <Route
              path="/evidence/:evidenceId"
              element={<evidencePage.default />}
            />
          </Routes>
        </MemoryRouter>,
      );
      const region = screen.getByRole("region", {
        name: "Selected record evidence",
      });
      if (belongs) expect(region).toHaveTextContent("Other Race · 2023");
      else expect(region).not.toHaveTextContent("Other Race");
    } finally {
      fields.pop();
    }
  },
);
test.each(["qualifying", "laps", "pit-stops"])(
  "UX-04 generic %s link requests its record without invented points field",
  (dataset) => {
    render(
      <MemoryRouter>
        <RaceRecords
          dataset={dataset}
          rows={[
            {
              id: "generic:row",
              evidenceId: "shared",
              entryId: "second",
              phases: [],
              sectors: [],
            },
          ]}
        />
      </MemoryRouter>,
    );
    const url = new URL(
      screen
        .getByRole("link", { name: "View field evidence" })
        .getAttribute("href"),
      "http://fixture",
    );
    expect(url.searchParams.get("recordId")).toBe("generic:row");
    expect(url.searchParams.has("field")).toBe(false);
  },
);
test("UX-04 selected record matches assertion ID, not first/page-local index", () => {
  const model = evidencePage.buildEvidenceViewModel(
    { fields },
    "result:second",
    "points",
  );
  expect(model.name).toBe("Second Driver");
  expect(model.focusedField.selectedValue).toBe("18");
  expect(model.humanFields.map((item) => item.path)).not.toContain(
    "/items/4/points",
  );
  expect(model.technicalFields).toHaveLength(fields.length);
});
test("UX-04 missing record or unknown field cannot silently show first points", () => {
  const absent = evidencePage.buildEvidenceViewModel(
    { fields },
    "missing",
    "points",
  );
  expect(absent.recordFound).toBe(false);
  expect(absent.humanFields).toEqual([]);
  expect(absent.focusedField).toBeNull();
  const unknown = evidencePage.buildEvidenceViewModel(
    { fields },
    "result:second",
    "bogus",
  );
  expect(unknown.fieldFound).toBe(false);
  expect(unknown.focusedField).toBeNull();
});
test("UX-04 links carry row identity, field and publication-pinned return context", () => {
  render(
    <MemoryRouter>
      <RaceResultTable
        snapshotId="publication"
        evidenceContext={{
          season: "2024",
          event: "event:fixture",
          session: "session:race",
          from: "/events/event%3Afixture?season=2024&session=session%3Arace&view=results&cursor=page-two",
        }}
        rows={[
          {
            id: "result:second",
            evidenceId: "shared",
            entryId: "second",
            position: 2,
            points: "18",
          },
        ]}
        names={{ second: "Second Driver" }}
      />
    </MemoryRouter>,
  );
  const url = new URL(
    screen.getByRole("link", { name: "View evidence" }).getAttribute("href"),
    "http://fixture",
  );
  expect(url.searchParams.get("recordId")).toBe("result:second");
  expect(url.searchParams.get("field")).toBe("points");
  const back = new URL(url.searchParams.get("from"), "http://fixture");
  expect(back.searchParams.get("snapshot")).toBe("publication");
  expect(back.searchParams.get("cursor")).toBe("page-two");
});
test("UX-04 initial selected evidence prioritises human field and correct value while retaining technical assertions", () => {
  render(
    <MemoryRouter
      initialEntries={[
        "/evidence/shared?recordId=result%3Asecond&field=points",
      ]}
    >
      <Routes>
        <Route
          path="/evidence/:evidenceId"
          element={<evidencePage.default />}
        />
      </Routes>
    </MemoryRouter>,
  );
  const summary = screen.getByRole("region", {
    name: "Selected record evidence",
  });
  expect(summary).toHaveTextContent("Second Driver");
  expect(summary).toHaveTextContent("Points: 18");
  expect(summary).not.toHaveTextContent("Points: 25");
  expect(summary).toHaveTextContent(
    "Source-only: no cross-source check. Partial: records or fields may be missing. Assertions are not an independent accuracy guarantee.",
  );
  expect(
    screen.getByText("Complete technical assertions").closest("details"),
  ).not.toHaveAttribute("open");
});
