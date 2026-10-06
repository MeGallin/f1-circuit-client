import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { EntityLink } from "../src/features/entities/shared";
import { HistoryRows } from "../src/pages/Profile";
import { RaceResultTable } from "../src/pages/RaceDetail";

afterEach(cleanup);
const team = { id: "constructor:red_bull", displayName: "Red Bull" };
const row = {
  id: "result:2010",
  position: 1,
  points: "25",
  statusLabel: "Finished",
  entry: {
    drivers: [{ id: "driver:published", displayName: "Published driver" }],
    constructor: team,
  },
  eventContext: {
    event: {
      id: "event:2010",
      year: 2010,
      name: "Published 2010 race",
      schedule: {},
    },
    session: { id: "session:2010", label: "Race", schedule: {} },
  },
};
test("undated constructor links do not borrow the ambient browsing season for the badge", () => {
  const { container } = render(
    <MemoryRouter initialEntries={["/compare?season=2010"]}>
      <EntityLink kind="constructor" entity={team} />
    </MemoryRouter>,
  );
  expect(container.querySelector("img")).toHaveAttribute(
    "src",
    "/images/constructors/red-bull-2026.svg",
  );
});
test.each([
  [2010, team, "red-bull-archive.png"],
  [
    2000,
    { id: "constructor:williams", displayName: "Williams" },
    "williams-archive.png",
  ],
])(
  "cross-year profile history uses its %s year rather than ambient route season",
  (year, constructor, file) => {
    const { container } = render(
      <MemoryRouter initialEntries={["/drivers/driver:published?season=2026"]}>
        <HistoryRows
          kind="driver"
          rows={[
            {
              ...row,
              entry: { ...row.entry, constructor },
              eventContext: {
                ...row.eventContext,
                event: { ...row.eventContext.event, year },
              },
            },
          ]}
        />
      </MemoryRouter>,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      `/images/constructors/${file}`,
    );
    expect(
      screen.getByRole("link", { name: constructor.displayName }),
    ).toHaveAttribute(
      "href",
      `/constructors/${encodeURIComponent(constructor.id)}?season=${year}`,
    );
  },
);
test("race classification uses its supplied result context even without a season URL", () => {
  const { container } = render(
    <MemoryRouter>
      <RaceResultTable
        rows={[{ ...row, eventContext: undefined }]}
        evidenceContext={{ season: "2010" }}
      />
    </MemoryRouter>,
  );
  expect(container.querySelector("img")).toHaveAttribute(
    "src",
    "/images/constructors/red-bull-archive.png",
  );
});
