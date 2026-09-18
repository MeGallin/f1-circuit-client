import { test, expect } from "vitest";
import { apiBase } from "../src/api/config";
test("public API configuration rejects credentials and insecure remote origins", () => {
  expect(apiBase("http://localhost:3001/")).toBe(
    "http://localhost:3001/api/v1",
  );
  expect(() => apiBase("https://user:password@example.com")).toThrow();
  expect(() => apiBase("http://example.com")).toThrow();
});
