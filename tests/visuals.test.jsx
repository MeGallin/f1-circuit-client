import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CircuitSilhouette,
  CountryFlag,
  countryCode,
  countryFlagEmoji,
  selectLayout,
} from "../src/components/visuals";

describe("country visuals", () => {
  it("normalises supported country names to a native flag", () => {
    expect(countryCode("British")).toBe("GB");
    expect(countryCode("UK")).toBe("GB");
    expect(countryFlagEmoji("British")).toBe("🇬🇧");

    render(<CountryFlag country="British" label="Driver nationality" />);

    expect(screen.getByRole("img", { name: "British flag" })).toBeVisible();
  });

  it("keeps missing or unmapped countries explicit", () => {
    render(<CountryFlag country="Atlantis" showFallback />);
    expect(screen.getByText("Atlantis")).toHaveAttribute(
      "aria-label",
      "Country: Atlantis",
    );
  });
});

describe("circuit visuals", () => {
  it("does not invent a layout when the API supplies no asset", () => {
    const { container } = render(<CircuitSilhouette layout={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a supplied asset with an accessible source disclosure", () => {
    render(
      <CircuitSilhouette
        circuitName="Test Circuit"
        layout={{
          assetUrl: "https://example.com/test-circuit.svg",
          attribution: "Circuit source",
          licence: "CC BY 4.0",
          evidenceId: "evidence:test-layout",
        }}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Test Circuit track layout" }),
    ).toHaveAttribute("src", "https://example.com/test-circuit.svg");
    expect(screen.getByText("Layout source")).toBeVisible();
    expect(screen.getByText(/Source:/)).toHaveClass("sr-only");
    screen.getByText("Layout source").click();
    expect(
      screen.getByRole("link", { name: "View layout evidence" }),
    ).toHaveAttribute("href", "/evidence/evidence%3Atest-layout");
  });

  it("shows an explicit unavailable state when requested", () => {
    render(
      <CircuitSilhouette
        circuitName="Unknown Circuit"
        layout={null}
        showFallback
      />,
    );

    expect(screen.getByText("Track layout not supplied")).toBeInTheDocument();
  });

  it("selects the layout that covers an event year and keeps the size/theme contract", () => {
    const layouts = [
      {
        id: "layout:old",
        validFrom: "2000-01-01",
        validTo: "2010-12-31",
        assetUrl: "https://example.com/old.svg",
      },
      {
        id: "layout:current",
        validFrom: "2011-01-01",
        validTo: "2025-12-31",
        assetUrl: "https://example.com/current.svg",
      },
    ];
    expect(selectLayout(layouts, 2024).id).toBe("layout:current");

    render(
      <CircuitSilhouette
        layout={{ assetUrl: "https://example.com/current.svg" }}
        circuitName="Test Circuit"
        country="UK"
        size="compact"
        theme="light"
        fallback="message"
      />,
    );
    expect(
      screen
        .getByRole("img", { name: "Test Circuit, UK track layout" })
        .closest("figure"),
    ).toHaveClass(
      "circuit-silhouette--compact",
      "circuit-silhouette--theme-light",
    );
  });
});
