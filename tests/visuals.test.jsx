import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CircuitSilhouette,
  CountryFlag,
  countryCode,
  countryFlagEmoji,
} from "../src/components/visuals";

describe("country visuals", () => {
  it("normalises supported country names to a native flag", () => {
    expect(countryCode("British")).toBe("GB");
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

  it("renders a supplied asset with attribution and a safe fallback", () => {
    render(
      <CircuitSilhouette
        circuitName="Test Circuit"
        layout={{
          assetUrl: "https://example.com/test-circuit.svg",
          attribution: "Circuit source",
          licence: "CC BY 4.0",
        }}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Test Circuit track layout" }),
    ).toHaveAttribute("src", "https://example.com/test-circuit.svg");
    expect(screen.getByText("Circuit source · CC BY 4.0")).toBeInTheDocument();
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
});
