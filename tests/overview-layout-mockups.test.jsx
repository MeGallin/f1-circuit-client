import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import OverviewLayoutMockups from "../src/pages/OverviewLayoutMockups";

test("overview layout study presents four complete static alternatives", () => {
  render(<OverviewLayoutMockups />);
  expect(screen.getByRole("heading", { name: /four ways/i })).toBeInTheDocument();
  expect(
    screen.getAllByRole("heading", { name: "Spanish Grand Prix" }),
  ).toHaveLength(4);
  expect(screen.getAllByText("Championship snapshot")).toHaveLength(4);
  expect(screen.getAllByText("Previous and next events")).toHaveLength(4);
  expect(
    screen.getAllByText(
      (_, element) =>
        element?.tagName === "STRONG" &&
        element.textContent.replace(/\s+/g, " ").trim() === "14 of 23 events",
    ),
  ).toHaveLength(4);
});
