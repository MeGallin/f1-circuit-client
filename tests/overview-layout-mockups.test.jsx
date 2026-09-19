import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import OverviewLayoutMockups from "../src/pages/OverviewLayoutMockups";

test("overview layout study presents the focused season-around-the-race mock-up", () => {
  render(<OverviewLayoutMockups />);
  expect(screen.getByRole("heading", { level: 1, name: /put the season around the race/i })).toBeInTheDocument();
  expect(
    screen.getAllByRole("heading", { name: "Spanish Grand Prix" }),
  ).toHaveLength(1);
  expect(screen.getAllByText("Championship snapshot")).toHaveLength(1);
  expect(screen.getAllByText("NEXT EVENT")).toHaveLength(1);
  expect(screen.getAllByText("PREVIOUS EVENT")).toHaveLength(1);
  expect(
    screen.getAllByText(
      (_, element) =>
        element?.tagName === "STRONG" &&
        element.textContent.replace(/\s+/g, " ").trim() === "14 of 23 events",
    ),
  ).toHaveLength(1);
  expect(screen.getAllByLabelText("Driver number 12")).toHaveLength(2);
});
