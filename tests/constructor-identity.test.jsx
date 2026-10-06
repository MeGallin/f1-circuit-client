import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ConstructorIdentity,
  ConstructorLogo,
  ConstructorIdentities,
} from "../src/components/ConstructorIdentity";
import { MemoryRouter } from "react-router-dom";
import { StandingRows } from "../src/pages/Standings";
import AnalyticsChampionshipSnapshot from "../src/features/analytics/components/AnalyticsChampionshipSnapshot";
import AnalyticsRecentResults from "../src/features/analytics/components/AnalyticsRecentResults";

const mercedes = { id: "constructor:mercedes", displayName: "Mercedes" };
afterEach(cleanup);
describe("constructor identity", () => {
  it("keeps contract-valid repeated team records without duplicate React keys", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const { container } = render(
        <ConstructorIdentities
          constructors={[mercedes, mercedes]}
          year={2026}
        />,
      );
      expect(container.querySelectorAll("img")).toHaveLength(2);
      expect(error).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });
  it.each([
    ["constructor:rb", 2026],
    ["constructor:hrt", 2012],
  ])(
    "uses a contrast-safe manifest tile for unchanged pale %s artwork",
    (id, year) => {
      const { container } = render(
        <ConstructorIdentity
          constructor={{ id, displayName: "Published team name" }}
          year={year}
        />,
      );
      expect(container.querySelector(".constructor-logo")).toHaveClass(
        "constructor-logo--dark",
      );
    },
  );
  it("keeps the supplied name with a local decorative known-season logo", () => {
    const { container } = render(
      <ConstructorIdentity constructor={mercedes} year="2026" />,
    );
    expect(screen.getByText("Mercedes")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/images/constructors/mercedes.svg",
    );
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
  it("uses an explicit season-neutral canonical identity when no year is supplied", () => {
    const { container } = render(
      <ConstructorIdentity constructor={mercedes} />,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/images/constructors/mercedes.svg",
    );
    expect(screen.getByText("Mercedes")).toBeInTheDocument();
  });
  it.each(["unknown", "2026-01-01", 1955, 2027])(
    "does not infer a logo for an unverified year %s",
    (year) => {
      const { container } = render(
        <ConstructorIdentity constructor={mercedes} year={year} />,
      );
      expect(screen.getByText("Mercedes")).toBeInTheDocument();
      expect(container.querySelector("img")).toBeNull();
    },
  );
  it.each([
    "constructor:renault",
    "constructor:bmw_sauber",
    "constructor:unknown",
    "mercedes",
  ])("never aliases %s to a modern mark by name", (id) => {
    const { container } = render(
      <ConstructorIdentity
        constructor={{ id, displayName: "Mercedes" }}
        year={2026}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Mercedes")).toBeInTheDocument();
  });
  it("handles missing constructor data without inventing a brand", () => {
    const { container } = render(<ConstructorIdentity year={2026} />);
    expect(screen.getByText("Constructor not supplied")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });
  it("removes failed images, retains the name, and resets for a different asset", () => {
    const { container, rerender } = render(
      <ConstructorIdentity constructor={mercedes} year={2026} />,
    );
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Mercedes")).toBeInTheDocument();
    rerender(
      <ConstructorIdentity
        constructor={{ id: "constructor:mclaren", displayName: "McLaren" }}
        year={2026}
      />,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/images/constructors/mclaren.svg",
    );
  });
  it("labels a standalone logo and provides text after image failure", () => {
    render(<ConstructorLogo constructor={mercedes} year={2026} />);
    fireEvent.error(screen.getByRole("img", { name: "Mercedes" }));
    expect(screen.getByText("Mercedes")).toBeInTheDocument();
  });
  it("keeps constructor standings links named and year scoped after image errors", () => {
    const { container } = render(
      <MemoryRouter>
        <StandingRows
          kind="constructors"
          year={2026}
          rows={[{ id: "s1", entity: mercedes, constructors: [], rank: 1 }]}
        />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Mercedes" });
    expect(link).toHaveAttribute(
      "href",
      "/constructors/constructor%3Amercedes?season=2026",
    );
    fireEvent.error(container.querySelector("img"));
    expect(link).toHaveAccessibleName("Mercedes");
  });
  it("renders affiliation marks without replacing driver identity or multi-team names", () => {
    const { container } = render(
      <StandingRows
        kind="drivers"
        year={2026}
        rows={[
          {
            id: "d1",
            entity: { displayName: "Published driver" },
            constructors: [
              mercedes,
              { id: "constructor:mclaren", displayName: "McLaren" },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText("Published driver")).toBeInTheDocument();
    expect(screen.getByText("Mercedes")).toBeInTheDocument();
    expect(screen.getByText("McLaren")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });
  it("applies the selected analytics season without injecting logos into driver rows", () => {
    const { container, rerender } = render(
      <AnalyticsChampionshipSnapshot
        year={2026}
        constructors={[
          {
            constructorId: mercedes.id,
            constructorName: mercedes.displayName,
            totalPoints: 10,
          },
        ]}
      />,
    );
    expect(container.querySelector("img")).not.toBeNull();
    rerender(
      <AnalyticsChampionshipSnapshot
        year={2000}
        constructors={[
          {
            constructorId: mercedes.id,
            constructorName: mercedes.displayName,
            totalPoints: 10,
          },
        ]}
      />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Mercedes")).toBeInTheDocument();
  });
  it("uses the result event year rather than an assumed current year", () => {
    const race = {
      name: "Published race",
      year: 2026,
      round: 1,
      results: [
        {
          position: 1,
          driverId: "d",
          driverName: "Published driver",
          constructorId: mercedes.id,
          constructorName: mercedes.displayName,
        },
      ],
    };
    const { container, rerender } = render(
      <AnalyticsRecentResults race={race} />,
    );
    expect(container.querySelector("img")).not.toBeNull();
    rerender(<AnalyticsRecentResults race={{ ...race, year: 1955 }} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Mercedes")).toBeInTheDocument();
  });
});
