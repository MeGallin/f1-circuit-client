import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import { EntityLink } from "../src/features/entities/shared";
import { StandingRows } from "../src/pages/Standings";
import { RaceResultTable } from "../src/pages/RaceDetail";
import { ConstructorIdentity } from "../src/components/ConstructorIdentity";
import AnalyticsPerformanceSnapshot from "../src/features/analytics/components/AnalyticsPerformanceSnapshot";
import Design from "../src/pages/Design";

afterEach(cleanup);
test("development gallery exposes clearly labelled canonical record identity fixtures", () => {
  const { container } = render(<Design />);
  expect(
    screen.getByText("Identity component fixtures — not archive records"),
  ).toBeInTheDocument();
  expect(
    container.querySelector(
      ".driver-identity--record.driver-identity--stack-mobile",
    ),
  ).not.toBeNull();
  expect(
    container.querySelector(".constructor-identity--compact"),
  ).not.toBeNull();
});
test("record-supplied season owns historical artwork, while an undated record keeps its identity default", () => {
  const entity = { id: "constructor:mercedes", displayName: "Mercedes" };
  const { container } = render(
    <MemoryRouter initialEntries={["/?season=2000"]}>
      <EntityLink entity={entity} kind="constructor" season={2015} />
      <EntityLink entity={entity} kind="constructor" />
    </MemoryRouter>,
  );
  const [dated, undated] = container.querySelectorAll("a");
  expect(dated).toHaveAttribute(
    "href",
    "/constructors/constructor%3Amercedes?season=2015",
  );
  expect(dated.querySelector("img")).toHaveAttribute(
    "src",
    "/images/constructors/mercedes-archive.svg",
  );
  expect(undated.querySelector("img")).toHaveAttribute(
    "src",
    "/images/constructors/mercedes.svg",
  );
  expect(undated).toHaveAttribute(
    "href",
    "/constructors/constructor%3Amercedes",
  );
});
const driver = {
  id: "driver:fixture",
  displayName: "Independent historical driver",
};
const constructor = { id: "constructor:mercedes", displayName: "Mercedes" };

test("Analytics spotlight uses shared identity rather than recreating a driver badge", () => {
  const { container } = render(
    <AnalyticsPerformanceSnapshot
      year={2000}
      intelligence={{
        championshipLeader: {
          driverName: driver.displayName,
          number: 18,
          points: 18,
          constructor,
        },
      }}
    />,
  );
  expect(
    container.querySelector(".analytics-spotlight-identity .driver-identity"),
  ).not.toBeNull();
  expect(screen.getByText("Driver number 18")).toBeInTheDocument();
});

test("record links use canonical driver presentation without inventing a missing number", () => {
  const { container } = render(
    <MemoryRouter>
      <EntityLink entity={driver} kind="driver" season={2000} />
    </MemoryRouter>,
  );
  expect(container.querySelector(".driver-identity--record")).not.toBeNull();
  expect(screen.queryByText(/Driver number/)).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: driver.displayName }),
  ).toHaveAttribute("href", "/drivers/driver%3Afixture?season=2000");
});

test("standings and race classification reuse canonical identity with only published numbers and own season", () => {
  const { container } = render(
    <MemoryRouter initialEntries={["/?season=2026"]}>
      <StandingRows
        year={2000}
        kind="drivers"
        rows={[
          {
            id: "standing",
            rank: 2,
            entity: driver,
            number: 18,
            constructors: [constructor],
            points: "18.50",
          },
        ]}
      />
      <RaceResultTable
        rows={[
          {
            id: "result",
            position: 2,
            entry: { drivers: [driver], number: 18, constructor },
            eventContext: { event: { year: 2000 } },
          },
        ]}
      />
    </MemoryRouter>,
  );
  expect(container.querySelectorAll(".driver-identity--record")).toHaveLength(
    2,
  );
  expect(screen.getAllByText("Driver number 18")).toHaveLength(2);
  for (const link of screen.getAllByRole("link", { name: driver.displayName }))
    expect(link).toHaveAttribute(
      "href",
      "/drivers/driver%3Afixture?season=2000",
    );
  expect(screen.getByText("18.50")).toBeInTheDocument();
});

test("default constructor records use compact variant whose responsive sizing belongs to shared Apex identity stylesheet", () => {
  const { container } = render(
    <ConstructorIdentity constructor={constructor} year={2026} />,
  );
  expect(
    container.querySelector(".constructor-identity--compact"),
  ).not.toBeNull();
  const css = readFileSync(
    "src/design-system/constructor-identity.css",
    "utf8",
  );
  expect(css).toMatch(
    /\.constructor-identity--compact[\s\S]*font-size: var\(--apex-type-body-size\)/,
  );
  expect(css).toMatch(
    /@media[^}]*\.constructor-identity--compact[\s\S]*--constructor-logo-size: var\(--apex-size-icon\)/,
  );
});
