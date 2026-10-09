import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { LeaderList } from "../src/features/season/RaceSummary";

afterEach(() => {
  cleanup();
  document
    .querySelectorAll("style[data-separator-test]")
    .forEach((node) => node.remove());
});

function applyCascade(width) {
  const source = document.createElement("style");
  source.dataset.separatorTest = "source";
  // Resolve only the two separator tokens for jsdom's cascade diagnostic;
  // actual browser geometry/theme colours are verified separately by the parent.
  source.textContent = [
    "src/styles/overview.css",
    "src/design-system/home-fidelity.css",
    "src/design-system/compact-charts.css",
  ]
    .map((path) => readFileSync(path, "utf8"))
    .join("\n")
    .replaceAll("var(--apex-shape-border)", "1px")
    .replaceAll("var(--apex-color-line)", "rgb(41, 47, 56)")
    .replaceAll("var(--apex-space-4)", "8px")
    .replaceAll("var(--apex-space-5)", "12px")
    .replaceAll("var(--apex-space-7)", "20px");
  document.head.append(source);
  function activeRules(rules) {
    return [...rules].flatMap((rule) => {
      if (!rule.conditionText) return [rule.cssText];
      const minimum = rule.conditionText.match(/min-width:\s*(\d+)px/);
      const maximum = rule.conditionText.match(/max-width:\s*(\d+)px/);
      if (
        (minimum && width < Number(minimum[1])) ||
        (maximum && width > Number(maximum[1]))
      )
        return [];
      return activeRules(rule.cssRules);
    });
  }
  const resolved = document.createElement("style");
  resolved.dataset.separatorTest = "resolved";
  resolved.textContent = activeRules(source.sheet.cssRules).join("\n");
  source.remove();
  document.head.append(resolved);
}

const entries = (kind, count) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${kind}-${index}`,
    rank: index + 1,
    points: 30 - index,
    number: index + 10,
    entity: {
      id: `fixture-${index}`,
      displayName: `${kind} fixture ${index + 1}`,
    },
  }));

test.each([320, 390, 1440])(
  "Home graphic previews end with the same divider and unchanged row spacing at %ipx",
  (width) => {
    applyCascade(width);
    const { container } = render(
      <section className="home-completed-race">
        <div className="home-summary-panels">
          {["drivers", "constructors"].map((kind) => (
            <section
              key={kind}
              className={`home-championship home-championship--${kind}`}
            >
              <div className="home-championship-records">
                <LeaderList
                  sharedIdentity
                  entries={entries(kind, 3)}
                  kind={kind}
                  year={2026}
                />
              </div>
              <section className="home-championship-graphic" />
            </section>
          ))}
        </div>
      </section>,
    );
    for (const list of container.querySelectorAll(".leader-list")) {
      expect(list.children).toHaveLength(3);
      if (width >= 900)
        expect(getComputedStyle(list).gridAutoRows).toBe("auto");
      const middle = getComputedStyle(list.children[1]);
      const last = getComputedStyle(list.children[2]);
      expect(last.borderBottomWidth).toBe("1px");
      expect(last.borderBottomStyle).toBe(middle.borderTopStyle);
      expect(last.borderBottomColor).toBe(middle.borderTopColor);
      expect(last.paddingBlock).toBe(width >= 900 ? "12px" : "8px");
      expect(last.paddingBlock).toBe(middle.paddingBlock);
      expect(last.margin).toBe(middle.margin);
      expect(
        list.closest(".home-championship-records").nextElementSibling,
      ).toHaveClass("home-championship-graphic");
      const graphic = list.closest(
        ".home-championship-records",
      ).nextElementSibling;
      const graphicStyle = getComputedStyle(graphic);
      expect(graphicStyle.marginBlockStart).toBe("20px");
      expect(graphicStyle.marginBlock).toBe("8px");
    }
  },
);

test.each([320, 390, 1440])(
  "Home top-three previews have all between-row separators at %ipx",
  (width) => {
    applyCascade(width);
    const { container } = render(
      <section className="home-completed-race">
        {["drivers", "constructors"].map((kind) => (
          <section
            key={kind}
            className={`home-championship home-championship--${kind}`}
          >
            <LeaderList
              sharedIdentity
              entries={entries(kind, 3)}
              kind={kind}
              year={2026}
            />
          </section>
        ))}
      </section>,
    );
    for (const list of container.querySelectorAll(".leader-list")) {
      const rows = [...list.children];
      for (const [index, row] of rows.entries()) {
        const style = getComputedStyle(row);
        // Keep the existing desktop header line; every later row owns its
        // preceding separator, including the final entry. No trailing border.
        const topExpected = index > 0 || width >= 520 ? "1px" : "0px";
        const topWidth =
          !style.borderTopStyle || style.borderTopStyle === "none"
            ? "0px"
            : style.borderTopWidth;
        const bottomWidth =
          !style.borderBottomStyle || style.borderBottomStyle === "none"
            ? "0px"
            : style.borderBottomWidth;
        expect(topWidth).toBe(topExpected);
        expect(bottomWidth).toBe("0px");
        if (topExpected === "1px") {
          expect(style.borderTopStyle).toBe("solid");
          expect(style.borderTopColor).toBe("rgb(41, 47, 56)");
        }
      }
    }
  },
);

test("one Home-owned selector supplies tokenized separators for both preview kinds", () => {
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(css).toMatch(
    /\.home-completed-race \.leader-list > li \+ li\s*\{[^}]*border-top: var\(--apex-shape-border\) solid var\(--apex-color-line\);/,
  );
  expect(css).not.toMatch(
    /\.home-championship--(?:drivers|constructors)[^{]*\{[^}]*border-(?:top|bottom):/,
  );
});
