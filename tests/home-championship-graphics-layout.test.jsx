import { readFileSync } from "node:fs";
import { render, cleanup } from "@testing-library/react";
import { afterEach, test, expect } from "vitest";
afterEach(() => {
  cleanup();
  document
    .querySelectorAll("style[data-home-layout-test]")
    .forEach((style) => style.remove());
});
test("compact Home preview minimum is keyed80 and never a fixed row height", () => {
  const tokens = JSON.parse(
    readFileSync("src/design-system/apex.tokens.json", "utf8"),
  );
  const css = readFileSync("src/design-system/home-fidelity.css", "utf8");
  expect(tokens.homeFidelity.championshipPreviewRowMinHeight).toBe(80);
  expect(css).toContain("--apex-size-home-championship-preview-row-min: 80px;");
  expect(css).toContain(
    "min-block-size: var(--apex-size-home-championship-preview-row-min)",
  );
  expect(css).not.toMatch(
    /\.leader-list li\s*\{[^}]*(?<![\w-])(?:height|block-size):/,
  );
});
test.each(
  [320, 390, 899, 1440].flatMap((width) =>
    [false, true].map((expanded) => [width, expanded]),
  ),
)(
  "race card and platforms retain natural size at %spx, expanded=%s",
  (width, expanded) => {
    const { container } = render(
      <section className="home-completed-race">
        <div
          className={`home-summary-panels${expanded ? " home-summary-panels--expanded-results" : ""}`}
        >
          <section className="home-race-result">
            <header className="home-completed-header" />
            <section className="race-focus-results">
              <div className="race-focus-results-heading" />
              <ol className="race-podium race-podium--aligned">
                {["second", "winner", "third"].map((place) => (
                  <li
                    key={place}
                    className={`race-podium-row race-podium-row--${place}`}
                  >
                    <div className="race-podium-driver" />
                    <div className="race-podium-block" />
                  </li>
                ))}
              </ol>
            </section>
          </section>
          {expanded && <section className="home-expanded" />}
          <section className="home-championship home-championship--drivers" />
          <section className="home-championship home-championship--constructors" />
        </div>
      </section>,
    );
    const parser = document.createElement("style");
    parser.textContent = readFileSync(
      "src/design-system/home-fidelity.css",
      "utf8",
    )
      .replaceAll("var(--apex-space-5)", "12px")
      .replaceAll("var(--apex-space-2)", "4px")
      .replaceAll("var(--apex-space-4)", "8px");
    document.head.append(parser);
    const flatten = (rules) =>
      [...rules]
        .flatMap((rule) =>
          rule.conditionText
            ? Number(
                rule.conditionText.match(/min-width:\s*(\d+)px/)?.[1] ?? 0,
              ) <= width
              ? flatten(rule.cssRules)
              : []
            : [rule.cssText],
        )
        .join("\n");
    const styles = document.createElement("style");
    styles.dataset.homeLayoutTest = "resolved";
    styles.textContent = flatten(parser.sheet.cssRules);
    parser.remove();
    document.head.append(styles);
    const race = container.querySelector(".home-race-result");
    const raceStyle = getComputedStyle(race);
    const podiumStyle = getComputedStyle(
      race.querySelector(".race-focus-results"),
    );
    expect(raceStyle.display).toBe(width >= 900 ? "flex" : "block");
    expect(podiumStyle.marginTop).toBe("12px");
    const podium = race.querySelector(".race-podium");
    expect(getComputedStyle(podium).gridTemplateRows).toBe("auto auto");
    expect(podiumStyle.display).toBe(width >= 900 ? "flex" : "block");
    if (width >= 900) {
      expect(raceStyle.flexDirection).toBe("column");
      expect(podiumStyle.flexGrow).toBe("1");
      expect(podiumStyle.flexDirection).toBe("column");
      expect(getComputedStyle(podium).marginTop).toBe("auto");
    } else {
      expect(podiumStyle.flexGrow).not.toBe("1");
      expect(getComputedStyle(podium).marginTop).not.toBe("auto");
    }
    expect(getComputedStyle(podium).flexGrow).not.toBe("1");
    for (const block of podium.querySelectorAll(".race-podium-block")) {
      expect(getComputedStyle(block).alignSelf).toBe("end");
      expect(getComputedStyle(block).marginBlockStart).not.toBe("32px");
    }
    for (const row of podium.querySelectorAll(".race-podium-row")) {
      const rowStyle = getComputedStyle(row);
      expect(rowStyle.gridTemplateRows).toBe("auto auto");
      expect(rowStyle.alignContent).toBe("end");
      expect(rowStyle.rowGap).toBe("12px");
      const driverStyle = getComputedStyle(
        row.querySelector(".race-podium-driver"),
      );
      expect(driverStyle.padding).toBe("0px");
      expect(driverStyle.paddingBlockStart).not.toBe("32px");
      expect(driverStyle.paddingBlockEnd).not.toBe("32px");
    }
    if (width >= 900) {
      expect(raceStyle.gridRow).toBe("1");
    }
    if (expanded) {
      const results = container.querySelector(".home-expanded");
      expect(results.parentElement).toBe(race.parentElement);
      expect(getComputedStyle(results).gridColumn).toBe("1 / -1");
      if (width >= 900) expect(getComputedStyle(results).gridRow).toBe("2");
    }
  },
);
test("chart spacing is compact without shrinking existing captions or touch targets", () => {
  const css = readFileSync("src/design-system/compact-charts.css", "utf8");
  expect(css).toMatch(
    /\.home-championship-graphic\s*\{[^}]*margin-block: var\(--apex-space-4\)/,
  );
  expect(css).toMatch(
    /\.compact-chart-note\s*\{[^}]*margin-block: var\(--apex-space-2\)/,
  );
  expect(css).toMatch(
    /\.compact-chart-details summary\s*\{[^}]*min-height: var\(--apex-size-control\)/,
  );
  expect(css).toContain("var(--apex-type-caption-size)");
});
test.each([320, 390, 899, 1440])(
  "chart cards have readable full-width mobile layout at %s and bottom-aligned shared actions",
  (viewport) => {
    const { container } = render(
      <div className="home-completed-race">
        <div className="home-summary-panels">
          <div className="home-championship">
            <div className="home-panel-link" />
          </div>
        </div>
      </div>,
    );
    const parser = document.createElement("style");
    parser.textContent = readFileSync(
      "src/design-system/home-fidelity.css",
      "utf8",
    );
    document.head.append(parser);
    const flatten = (rules) =>
      [...rules]
        .flatMap((rule) =>
          rule.conditionText
            ? Number(
                rule.conditionText.match(/min-width:\s*(\d+)px/)?.[1] ?? 0,
              ) <= viewport
              ? flatten(rule.cssRules)
              : []
            : [rule.cssText],
        )
        .join("\n");
    const styles = document.createElement("style");
    styles.dataset.homeLayoutTest = "resolved";
    styles.textContent = flatten(parser.sheet.cssRules);
    parser.remove();
    document.head.append(styles);
    expect(
      getComputedStyle(container.querySelector(".home-summary-panels"))
        .gridTemplateColumns,
    ).toBe(
      viewport < 900
        ? "minmax(0, 1fr)"
        : "minmax(0, 47fr) minmax(0, 27fr) minmax(0, 26fr)",
    );
    expect(
      getComputedStyle(container.querySelector(".home-panel-link")).marginTop,
    ).toBe("auto");
  },
);
