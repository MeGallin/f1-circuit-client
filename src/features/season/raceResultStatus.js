const PRECISE_TIME = new Set(["minute", "second"]);

function validTimingConfig(config) {
  return (
    config &&
    typeof config.enabled === "boolean" &&
    config.anchor === "scheduled-race-start" &&
    Number.isSafeInteger(config.graceMs) &&
    config.graceMs >= 0 &&
    Number.isSafeInteger(config.intervalMs) &&
    config.intervalMs > 0 &&
    Number.isSafeInteger(config.windowMs) &&
    config.windowMs > 0
  );
}

export function raceResultTiming(event, config) {
  const startsAt = Date.parse(event?.schedule?.startsAt || "");
  if (
    !PRECISE_TIME.has(event?.schedule?.timePrecision) ||
    !Number.isFinite(startsAt)
  )
    return {
      phase: "unknown-schedule",
      startsAt: null,
      activatesAt: null,
      endsAt: null,
      automaticConfigAvailable: validTimingConfig(config),
    };

  if (!validTimingConfig(config))
    return {
      phase: "timing-unavailable",
      startsAt,
      activatesAt: null,
      endsAt: null,
      automaticConfigAvailable: false,
    };

  const activatesAt = startsAt + config.graceMs;
  return {
    phase: "scheduled",
    startsAt,
    activatesAt,
    endsAt: activatesAt + config.windowMs,
    graceMs: config.graceMs,
    intervalMs: config.intervalMs,
    windowMs: config.windowMs,
    automaticEnabled: config.enabled,
    automaticConfigAvailable: true,
  };
}

export function raceResultStatus(
  event,
  now = Date.now(),
  resultRows = null,
  config,
) {
  const timing = raceResultTiming(event, config);
  const hasPublishedResults =
    Array.isArray(resultRows) && resultRows.length > 0;
  if (timing.phase === "unknown-schedule")
    return hasPublishedResults ? { ...timing, phase: "published" } : timing;

  const nowMs = typeof now === "number" ? now : Date.parse(now);
  let phase;
  if (!Number.isFinite(nowMs)) phase = "unknown-schedule";
  else if (nowMs < timing.startsAt) phase = "before-start";
  else if (hasPublishedResults) phase = "published";
  else if (timing.phase === "timing-unavailable") phase = "after-start";
  else if (nowMs < timing.activatesAt) phase = "grace";
  else if (nowMs < timing.endsAt) phase = "check-window";
  else phase = "window-ended";

  return { ...timing, phase };
}
