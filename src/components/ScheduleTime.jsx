import { Button, Select } from "./ui";
import {
  formatScheduleTime,
  setTimeDisplayPreference,
  useTimeDisplayPreference,
  viewerTimeZone,
  validTimeZone,
} from "../features/season/timeDisplay";
import "../design-system/schedule-time.css";
export function TimeDisplayPreference() {
  const mode = useTimeDisplayPreference();
  return (
    <div className="time-display-preference">
      <Select
        label="Time display"
        value={mode}
        options={[
          { value: "local", label: "Viewer local" },
          { value: "utc", label: "UTC" },
        ]}
        onChange={(event) => setTimeDisplayPreference(event.target.value)}
      />
      <Button variant="quiet" onClick={() => setTimeDisplayPreference("local")}>
        Reset time display
      </Button>
    </div>
  );
}
export function ScheduleTime({ schedule, prefix = "", showVenue = false }) {
  const mode = useTimeDisplayPreference();
  const model = formatScheduleTime(schedule, { mode });
  const zone = viewerTimeZone();
  return (
    <span className="schedule-time">
      <time dateTime={model.instant || schedule?.date || undefined}>
        {mode === "local" && model.precise ? (
          <>
            <span>
              {prefix}
              {model.primary}
            </span>
            <small>{model.utc}</small>
          </>
        ) : (
          <>
            {prefix}
            {model.primary}
          </>
        )}
      </time>
      {model.precise ? (
        <small>
          {mode === "utc"
            ? "UTC display"
            : model.zone
              ? `Viewer time · ${zone}`
              : "Viewer time zone unavailable; UTC shown"}
        </small>
      ) : (
        <small>Published calendar date; start time not supplied.</small>
      )}
      {showVenue && (
        <small>
          {schedule?.circuitTimeZone
            ? validTimeZone(schedule.circuitTimeZone)
              ? `Venue time zone: ${schedule.circuitTimeZone}`
              : "Venue time zone unavailable."
            : "Venue time zone not supplied."}
        </small>
      )}
    </span>
  );
}
