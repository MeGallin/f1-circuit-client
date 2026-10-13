import { afterEach, expect, test, vi } from "vitest";
import { readFileSync } from "node:fs";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StandingOutlookControl } from "../src/pages/Standings";
import { standingsResponse } from "../src/api/archiveApi";
import { ModalShell } from "../src/components/ModalShell";
import { TitleScenariosDialog } from "../src/features/season/TitleScenariosDialog";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("outlook modal keeps binding conditions visible and folds technical reasoning into one closed footer", async () => {
  render(
    <TitleScenariosDialog
      outlook={outlook}
      kind="drivers"
      onClose={() => {}}
    />,
  );
  const dialog = screen.getByRole("dialog");
  const details = dialog.querySelectorAll("details");
  expect(details).toHaveLength(1);
  expect(details[0]).not.toHaveAttribute("open");
  expect(screen.getByText(/Publication:/)).not.toBeVisible();
  expect(screen.getByText("George Russell")).toBeVisible();
  expect(screen.getAllByText(/9th or lower/)[0]).toBeVisible();
  expect(
    screen.getByText(/Additional condition under partial coverage/),
  ).toBeVisible();
  expect(
    screen.getByText(/every challenger; the nearest rival may change/),
  ).toBeVisible();
  await userEvent.click(details[0].querySelector("summary"));
  expect(screen.getByText(/Publication:/)).toBeVisible();
});

test("outlook modal reuses Apex metric cards with two compact scenario cards and concise status", () => {
  render(
    <TitleScenariosDialog
      outlook={outlook}
      kind="drivers"
      onClose={() => {}}
    />,
  );
  const dialog = screen.getByRole("dialog");
  expect(dialog.querySelectorAll(".title-scenario-card")).toHaveLength(2);
  expect(
    dialog.querySelector(".title-outlook-status .race-status"),
  ).toBeInTheDocument();
  expect(
    dialog.querySelector(".title-outlook-hero .panel-body"),
  ).toBeInTheDocument();
  expect(dialog.querySelectorAll(".title-scenario-card .metric")).toHaveLength(
    3,
  );
});

test("same next/earliest opportunity uses a compact tag, with constructive witness in closed details only", () => {
  const view = render(
    <TitleScenariosDialog
      outlook={outlook}
      kind="drivers"
      onClose={() => {}}
    />,
  );
  const dialog = screen.getByRole("dialog");
  expect(dialog.querySelector(".title-outlook-earliest")).toBeNull();
  expect(screen.getByText("Earliest possible")).toBeVisible();
  expect(screen.getByText(/Constructive path:/)).not.toBeVisible();
  expect(dialog.querySelector(".title-outlook-hero")).not.toHaveTextContent(
    "all other competitors score zero",
  );
  view.rerender(
    <TitleScenariosDialog
      outlook={{
        ...outlook,
        scenarios: {
          ...scenarios,
          earliest: {
            ...scenarios.earliest,
            event: {
              ...event,
              eventId: "event:2026:mexico",
              name: "Mexico City Grand Prix",
              round: 19,
              date: "2026-11-01",
            },
          },
        },
      }}
      kind="constructors"
      onClose={() => {}}
    />,
  );
  expect(dialog.querySelector(".title-outlook-earliest")).toHaveTextContent(
    "Mexico City Grand Prix",
  );
});

test.each(["drivers", "constructors"])(
  "winning %s pattern explicitly applies to every race and sprint until the target",
  (kind) => {
    render(
      <TitleScenariosDialog outlook={outlook} kind={kind} onClose={() => {}} />,
    );
    expect(
      screen.getByText(
        kind === "drivers"
          ? /Win each race and sprint until then; nearest challenger second/
          : /Finish 1–2 in each race and sprint until then; nearest team 3–4/,
      ),
    ).toBeVisible();
  },
);

test("title modal header matches Panel body-family typography without changing event titles", () => {
  const css = readFileSync("src/design-system/standings-context.css", "utf8");
  expect(css.match(/\.title-scenario-header h2\s*\{([^}]+)\}/)?.[1]).toContain(
    "font-family: var(--apex-font-body)",
  );
  expect(css.match(/\.title-scenario-header\s*\{([^}]+)\}/)?.[1]).toContain(
    "padding: var(--apex-space-6)",
  );
});

test("unproven next team clinch shows a blocker, retaining conditions in closed details and a different earliest date", () => {
  const teamOutlook = {
    ...outlook,
    scenarios: {
      ...scenarios,
      next: {
        ...scenarios.next,
        status: "not-proven",
        conditions: [
          {
            entityId: "ferrari",
            name: "Ferrari",
            maximumPoints: null,
            finishAtOrBelow: null,
            tieResolution: null,
          },
        ],
        unlistedCondition: {
          ...scenarios.next.unlistedCondition,
          maximumPoints: null,
          finishAtOrBelow: null,
          tieResolution: null,
        },
      },
      earliest: {
        ...scenarios.earliest,
        event: {
          ...event,
          eventId: "event:2026:mexico",
          name: "Mexico City Grand Prix",
          round: 19,
          date: "2026-11-01",
        },
      },
    },
  };
  render(
    <TitleScenariosDialog
      outlook={teamOutlook}
      kind="constructors"
      onClose={() => {}}
    />,
  );
  const hero = screen.getByRole("dialog").querySelector(".title-outlook-hero");
  expect(hero).not.toHaveTextContent("Ferrari");
  expect(hero).not.toHaveTextContent(
    "Additional condition under partial coverage",
  );
  expect(hero).toHaveTextContent(/not proven, even with/);
  expect(screen.getByText("Ferrari")).not.toBeVisible();
  expect(hero.querySelector(".title-outlook-earliest")).toHaveTextContent(
    "Mexico City Grand Prix",
  );
});
const event = {
  eventId: "event:2026:us",
  name: "United States Grand Prix",
  round: 18,
  kind: "race",
  date: "2026-10-25",
  maximum: "25",
};
const scenarios = {
  snapshotId: "pin",
  standingSnapshotId: "standing:2026:17",
  coverage: "conditional",
  reasonCode: null,
  now: { status: "not-secured", method: null },
  next: {
    status: "possible",
    event,
    leaderGain: "25",
    remainingAfter: "125",
    conditions: [
      {
        entityId: "russell",
        name: "George Russell",
        maximumPoints: "2",
        finishAtOrBelow: 9,
        tieResolution: "wins-countback",
      },
      {
        entityId: "hamilton",
        name: "Lewis Hamilton",
        maximumPoints: "10",
        finishAtOrBelow: 5,
        tieResolution: null,
      },
    ],
    unlistedCondition: {
      entityId: null,
      name: "Any unlisted challenger",
      maximumPoints: "2",
      finishAtOrBelow: 9,
      tieResolution: "wins-countback",
    },
  },
  earliest: {
    status: "possible",
    event,
    leaderPoints: "365",
    strongestRivalCeiling: "363",
    witness: "Leader wins; all other competitors score zero.",
  },
  constantGap: {
    status: "hypothetical",
    event: { ...event, round: 19 },
    remainingAfter: "100",
  },
  winningPattern: {
    status: "guaranteed-path",
    event: { ...event, round: 19 },
    leaderPoints: "390",
    strongestRivalCeiling: "374",
    outcome:
      "Leader first, nearest challenger second; other rivals take the highest remaining places.",
  },
};
const outlook = {
  year: 2026,
  round: 17,
  snapshotId: "pin",
  standingSnapshotId: "standing:2026:17",
  leaderId: "antonelli",
  leaderName: "Andrea Kimi Antonelli",
  coverage: "conditional",
  reasonCode: null,
  remainingMaximum: "150",
  sufficientAdditional: "49",
  rivalCeiling: "388",
  targetWithinAvailablePoints: true,
  remainingRaces: 6,
  remainingSprints: 0,
  ruleVersion: "rule",
  sourceUrls: [],
  assumptions: [],
  scenarios,
};

test("actual standings transform retains validated scenarios and rejects foreign or malformed scenario evidence", () => {
  const envelope = {
    data: { items: [], page: {}, titleOutlook: outlook },
    meta: { snapshotId: "pin" },
  };
  expect(standingsResponse(envelope).titleOutlook.scenarios).toEqual(scenarios);
  expect(
    standingsResponse({
      ...envelope,
      data: { ...envelope.data, titleOutlook: { ...outlook, scenarios: null } },
    }).titleOutlook.scenarios,
  ).toBeNull();
  for (const changes of [
    { snapshotId: "foreign" },
    { coverage: "invented" },
    { next: { ...scenarios.next, leaderGain: "NaN" } },
  ])
    expect(() =>
      standingsResponse({
        ...envelope,
        data: {
          ...envelope.data,
          titleOutlook: { ...outlook, scenarios: { ...scenarios, ...changes } },
        },
      }),
    ).toThrow();
});

test("compact title button opens shared modal only, shows four scenario blocks, cancel returns focus", async () => {
  render(<StandingOutlookControl outlook={outlook} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByText(/George Russell.*9th/)).not.toBeInTheDocument();
  const trigger = screen.getByRole("button", { name: "Title outlook" });
  await userEvent.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "Title outlook" });
  expect(dialog).toHaveClass("event-dialog");
  expect(
    screen.getByRole("button", { name: "Close title outlook" }),
  ).toHaveFocus();
  expect(dialog.querySelectorAll(".title-scenario")).toHaveLength(4);
  expect(dialog).toHaveTextContent("George Russell");
  expect(dialog).toHaveTextContent("9th or lower");
  expect(dialog).toHaveTextContent("wins countback");
  expect(dialog).toHaveTextContent("Unlisted lower challengers");
  expect(dialog).toHaveTextContent("Hypothetical constant gap");
  expect(dialog).toHaveTextContent(
    "Assumes the leader maintains at least the current gap over every challenger; the nearest rival may change.",
  );
  expect(dialog).toHaveTextContent("390");
  expect(dialog).toHaveTextContent("374");
  expect(dialog).toHaveTextContent("standing:2026:17");
  fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test("historical unavailable and unresolved ties do not claim a clinched title", async () => {
  const view = render(
    <StandingOutlookControl
      outlook={{
        ...outlook,
        year: 2000,
        coverage: "unavailable",
        reasonCode: "SCORING_PROFILE_UNAVAILABLE",
        scenarios: {
          ...scenarios,
          coverage: "unavailable",
          reasonCode: "SCORING_PROFILE_UNAVAILABLE",
          now: null,
          next: null,
          earliest: null,
          constantGap: null,
          winningPattern: null,
        },
      }}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Title outlook" }));
  expect(screen.getByRole("dialog")).toHaveTextContent(
    "Verified scenario evidence is not available",
  );
  view.unmount();
  render(
    <StandingOutlookControl
      outlook={{
        ...outlook,
        scenarios: {
          ...scenarios,
          now: { status: "tie-unresolved", method: null },
        },
      }}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Title outlook" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("Tie unresolved");
  expect(screen.getByRole("dialog")).not.toHaveTextContent("Already secured");
});

test("shared modal locks background scrolling and restores the prior overflow on close", () => {
  document.body.style.overflow = "auto";
  const view = render(
    <ModalShell labelledBy="test-title" onClose={() => {}}>
      <h2 id="test-title">Test</h2>
      <button>Close</button>
    </ModalShell>,
  );
  expect(document.body.style.overflow).toBe("hidden");
  view.unmount();
  expect(document.body.style.overflow).toBe("auto");
  document.body.style.overflow = "";
});

test("scenario close header remains pinned within the scrolling dialog", async () => {
  render(<StandingOutlookControl outlook={outlook} />);
  await userEvent.click(screen.getByRole("button", { name: "Title outlook" }));
  expect(
    screen
      .getByRole("button", { name: "Close title outlook" })
      .closest("header"),
  ).toHaveClass("title-scenario-header");
});

test("transport rejects impossible dates, foreign years, non-future rounds and zero opportunity budgets", () => {
  for (const changed of [
    { date: "2026-99-99" },
    { date: "2026-02-30" },
    { date: "2025-10-25" },
    { round: 17 },
    { maximum: "0" },
  ]) {
    const bad = {
      ...scenarios,
      next: { ...scenarios.next, event: { ...event, ...changed } },
    };
    expect(() =>
      standingsResponse({
        data: {
          items: [],
          page: {},
          titleOutlook: { ...outlook, scenarios: bad },
        },
        meta: { snapshotId: "pin" },
      }),
    ).toThrow();
  }
});

test("already secured title has no further result obligations or future clinch conditions", async () => {
  render(
    <StandingOutlookControl
      outlook={{
        ...outlook,
        scenarios: {
          ...scenarios,
          now: { status: "secured", method: "strict-points" },
        },
      }}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Title outlook" }));
  const dialog = screen.getByRole("dialog");
  expect(dialog).toHaveTextContent("No further points/results required");
  expect(dialog).toHaveTextContent("Current gap already sufficient");
  expect(dialog).not.toHaveTextContent("Could clinch next?");
  expect(dialog).not.toHaveTextContent("George Russell");
  expect(dialog).not.toHaveTextContent("Earliest possible");
  expect(dialog).not.toHaveTextContent(
    "Leader first, nearest challenger second",
  );
});

test("transport cannot publish a possible next clinch without event, gain and remaining budget evidence", () => {
  for (const changed of [
    { event: null },
    { leaderGain: null },
    { remainingAfter: null },
  ]) {
    expect(() =>
      standingsResponse({
        data: {
          items: [],
          page: {},
          titleOutlook: {
            ...outlook,
            scenarios: {
              ...scenarios,
              next: { ...scenarios.next, ...changed },
            },
          },
        },
        meta: { snapshotId: "pin" },
      }),
    ).toThrow();
  }
});

const inconsistentEvidence = [
  [
    "secured without method",
    (s) => {
      s.now = { status: "secured", method: null };
    },
  ],
  [
    "unresolved tie with security method",
    (s) => {
      s.now = { status: "tie-unresolved", method: "strict-points" };
    },
  ],
  [
    "possible with unproven rival",
    (s) => {
      s.next.conditions[0].maximumPoints = null;
    },
  ],
  [
    "possible with unproven unlisted bound",
    (s) => {
      s.next.unlistedCondition.maximumPoints = null;
    },
  ],
  [
    "no opportunities with future evidence",
    (s) => {
      s.next.status = "no-opportunities";
    },
  ],
  [
    "not proven without event",
    (s) => {
      s.next.status = "not-proven";
      s.next.event = null;
    },
  ],
  [
    "guaranteed without leader proof",
    (s) => {
      s.winningPattern.leaderPoints = null;
    },
  ],
  [
    "guaranteed without rival proof",
    (s) => {
      s.winningPattern.strongestRivalCeiling = null;
    },
  ],
  [
    "not-proven path carrying a target",
    (s) => {
      s.winningPattern.status = "not-proven";
    },
  ],
  [
    "earliest possible without event",
    (s) => {
      s.earliest.event = null;
    },
  ],
  [
    "earliest possible without score",
    (s) => {
      s.earliest.leaderPoints = null;
    },
  ],
  [
    "earliest proven path without ceiling",
    (s) => {
      s.earliest.status = "proven-path";
      s.earliest.strongestRivalCeiling = null;
    },
  ],
  [
    "gap threshold without budget",
    (s) => {
      s.constantGap.remainingAfter = null;
    },
  ],
  [
    "gap budget without target",
    (s) => {
      s.constantGap.event = null;
    },
  ],
];
test.each(inconsistentEvidence)(
  "transport rejects inconsistent scenario evidence: %s",
  (_name, mutate) => {
    const changed = structuredClone(scenarios);
    mutate(changed);
    expect(() =>
      standingsResponse({
        data: {
          items: [],
          page: {},
          titleOutlook: { ...outlook, scenarios: changed },
        },
        meta: { snapshotId: "pin" },
      }),
    ).toThrow();
  },
);
