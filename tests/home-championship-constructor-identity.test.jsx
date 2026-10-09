import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { LeaderList, RacePodium } from "../src/features/season/RaceSummary";

afterEach(cleanup);
const constructor = { id: "constructor:mercedes", displayName: "Mercedes" };

test("Home podium displays the same published constructor logo/name variant as both championship uses", () => {
  const { container } = render(
    <>
      <RacePodium
        aligned
        year={2026}
        detail={{
          podium: [
            {
              id: "podium-record",
              position: 1,
              points: 25,
              entry: {
                number: 44,
                drivers: [{ displayName: "Fixture driver" }],
                constructor,
              },
            },
          ],
        }}
      />
      <LeaderList
        sharedIdentity
        kind="drivers"
        year={2026}
        entries={[
          {
            id: "fixture-driver-standing",
            rank: 1,
            points: 30,
            entity: { displayName: "Fixture driver" },
            constructors: [constructor],
          },
        ]}
      />
      <LeaderList
        sharedIdentity
        kind="constructors"
        year={2026}
        entries={[
          {
            id: "fixture-constructor-standing",
            rank: 1,
            points: 30,
            entity: constructor,
          },
        ]}
      />
    </>,
  );
  const identities = [...container.querySelectorAll(".constructor-identity")];
  expect(identities).toHaveLength(3);
  const sources = identities.map((identity) => {
    expect(identity).toHaveClass("constructor-identity--championship");
    expect(
      identity.querySelector(".constructor-identity-name"),
    ).toHaveTextContent("Mercedes");
    const image = identity.querySelector(".constructor-logo > img");
    expect(image).toBeVisible();
    return image.getAttribute("src");
  });
  expect(new Set(sources).size).toBe(1);
  expect(sources[0]).toMatch(/^\/images\/constructors\//);
});
test("shared compact constructor layout outranks legacy podium descendant-span display rules", () => {
  const css = readFileSync(
    "src/design-system/constructor-identity.css",
    "utf8",
  );
  expect(css).toMatch(
    /\.constructor-identity\.constructor-identity--championship[^{}]*\{[^}]*display: inline-flex;/,
  );
});

test("Home constructor preview reserves the real badge width plus shared gap without a fake badge", () => {
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(css).toMatch(
    /\.home-championship--constructors \.leader-driver-line\s*\{[^}]*padding-inline-start: calc\(var\(--apex-size-icon\) \+ var\(--apex-space-2\)\);/,
  );
  const { container } = render(
    <LeaderList
      sharedIdentity
      kind="constructors"
      year={2026}
      entries={[{ id: "standing", rank: 1, points: 556, entity: constructor }]}
    />,
  );
  expect(container.querySelector(".driver-number")).toBeNull();
  expect(container.querySelector(".leader-rank")).toHaveTextContent("01");
  expect(container.querySelector(".leader-points")).toHaveTextContent("556");
  expect(container.querySelectorAll(".constructor-identity")).toHaveLength(1);
});
test("constructor reservation is desktop-only, mirroring the shared driver inline breakpoint", () => {
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8");
  const [base, desktop] = css.split("/* Home desktop breakpoint */");
  expect(base).not.toContain(
    ".home-championship--constructors .leader-driver-line",
  );
  expect(desktop).toMatch(
    /\.home-championship--constructors \.leader-driver-line\s*\{[^}]*padding-inline-start: calc\(var\(--apex-size-icon\) \+ var\(--apex-space-2\)\);/,
  );
  expect(css).not.toMatch(
    /\.home-championship--constructors \.leader-points\s*\{/,
  );
});

test("both Home championship lists use the same explicit constructor identity presentation", () => {
  const { container } = render(
    <>
      <LeaderList
        sharedIdentity
        kind="drivers"
        year={2026}
        entries={[
          {
            id: "driver-standing",
            rank: 1,
            points: 320,
            number: 12,
            entity: { displayName: "Andrea Kimi Antonelli" },
            constructors: [constructor],
          },
        ]}
      />
      <LeaderList
        sharedIdentity
        kind="constructors"
        year={2026}
        entries={[
          {
            id: "constructor-standing",
            rank: 1,
            points: 556,
            entity: constructor,
          },
        ]}
      />
    </>,
  );
  const identities = [...container.querySelectorAll(".constructor-identity")];
  expect(identities).toHaveLength(2);
  for (const identity of identities) {
    expect(identity).toHaveClass("constructor-identity--championship");
    expect(
      identity.querySelector(".constructor-identity-name"),
    ).toHaveTextContent("Mercedes");
  }
  expect(identities[0].className).toBe(identities[1].className);
  expect(container.querySelector(".driver-identity")).toHaveClass(
    "driver-identity--stack-mobile",
  );
});

test("championship constructor variant owns tokenized size, font, weight, line and gap without Home overrides", () => {
  const css = readFileSync(
    "src/design-system/constructor-identity.css",
    "utf8",
  );
  expect(css).toMatch(
    /\.constructor-identity--championship[^{}]*\{[^}]*font-family: var\(--apex-font-body\);[^}]*font-size: var\(--apex-type-body-size\);[^}]*font-weight: var\(--apex-type-body-weight\);[^}]*line-height: var\(--apex-type-control-line\);[^}]*gap: var\(--apex-space-4\);/,
  );
  expect(css).toContain(
    "--constructor-logo-size: var(--apex-size-icon-small);",
  );
  const home = readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(css).toMatch(
    /@media[^}]*\.constructor-identity--championship,\s*\.constructor-identity--compact\s*\{[^}]*--constructor-logo-size: var\(--apex-size-icon\);/,
  );
  expect(home).not.toContain("--constructor-logo-size:");
  expect(home).not.toMatch(/\.home-championship \.constructor-identity\s*\{/);
});

test("non-Home constructor lists retain the default presentation", () => {
  const { container } = render(
    <LeaderList
      kind="constructors"
      year={2026}
      entries={[
        { id: "default-standing", rank: 1, points: 556, entity: constructor },
      ]}
    />,
  );
  expect(container.querySelector(".constructor-identity")).not.toHaveClass(
    "constructor-identity--championship",
  );
});
