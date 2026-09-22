import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import OverviewLayoutMockups from "../src/pages/OverviewLayoutMockups";

test("overview layout study presents ten next-event comparison directions", () => {
  const { container } = render(<OverviewLayoutMockups />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /put the season around the race/i,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getAllByRole("heading", { name: "Spanish Grand Prix" }),
  ).toHaveLength(10);
  expect(screen.getAllByText("Championship snapshot")).toHaveLength(10);
  expect(screen.getAllByText("NEXT EVENT")).toHaveLength(10);
  expect(screen.getAllByText("PREVIOUS EVENT")).toHaveLength(10);
  expect(
    screen.getAllByText(
      (_, element) =>
        element?.tagName === "STRONG" &&
        element.textContent.replace(/\s+/g, " ").trim() === "14 of 23 events",
    ),
  ).toHaveLength(10);
  expect(screen.getAllByLabelText("Driver number 12")).toHaveLength(20);
  expect(
    container.querySelector(".mockup-event-legend i.is-complete"),
  ).toBeInTheDocument();
  expect(
    screen.getAllByText("Tap or click a marker to inspect that round."),
  ).toHaveLength(10);
});
