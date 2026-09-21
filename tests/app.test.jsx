import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, test, expect, vi } from "vitest";
import App from "../src/app/App";
import { store } from "../src/app/store";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("the deferred Records route resolves to the deliberate not-found state", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/records?season=2026"]}>
        <App />
      </MemoryRouter>
    </Provider>,
  );

  expect(
    screen.getByRole("heading", { name: "This page is not available." }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Records" })).not.toBeInTheDocument();
});
