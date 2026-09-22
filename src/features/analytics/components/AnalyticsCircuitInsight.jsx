import { MapTrifoldIcon, TrophyIcon } from "@phosphor-icons/react";
import { CircuitSilhouette, CountryFlag } from "../../../components/visuals";

export function buildAnalyticsCircuitInsightModel({
  circuit,
  profile,
  performance,
} = {}) {
  const circuitId = circuit?.id;
  const drivers = new Map(
    (performance?.drivers || []).map((driver) => [driver.id, driver.name]),
  );
  const cells = (performance?.cells || [])
    .filter((cell) => cell.circuitId === circuitId && cell.value != null)
    .map((cell) => ({
      position: Number(cell.value),
      driverName: drivers.get(cell.driverId) || "Driver not supplied",
    }));
  const bestFinish = [...cells].sort((a, b) => a.position - b.position)[0] || null;
  return {
    name: circuit?.displayName || "Circuit not supplied",
    country: profile?.country || circuit?.country || null,
    publishedFinishes: cells.length,
    driverCount: new Set(cells.map((cell) => cell.driverName)).size,
    bestFinish,
  };
}

function CircuitFact({ label, value, detail }) {
  return (
    <div className="analytics-circuit-fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export default function AnalyticsCircuitInsight({
  circuit,
  profile,
  layout,
  performance,
}) {
  const model = buildAnalyticsCircuitInsightModel({
    circuit,
    profile,
    performance,
  });
  return (
    <div className="analytics-circuit-insight">
      <div className="analytics-circuit-visual">
        <CircuitSilhouette
          layout={layout}
          circuitName={model.name}
          country={model.country}
          size="compact"
          fallback="message"
        />
      </div>
      <div className="analytics-circuit-copy">
        <div className="analytics-readout-heading">
          <div>
            <p className="eyebrow">LATEST CIRCUIT</p>
            <h3>{model.name}</h3>
            <div className="analytics-circuit-country">
              <CountryFlag country={model.country} label="Circuit country" showFallback />
              <span>{model.country || "Country not supplied"}</span>
            </div>
          </div>
          <MapTrifoldIcon size={24} aria-hidden />
        </div>
        <dl className="analytics-circuit-facts">
          <CircuitFact
            label="Best published finish"
            value={model.bestFinish?.position ? `P${model.bestFinish.position}` : "—"}
            detail={model.bestFinish?.driverName || "No finish supplied"}
          />
          <CircuitFact
            label="Driver coverage"
            value={model.driverCount || "—"}
            detail="Drivers with published finishes"
          />
          <CircuitFact
            label="Published finishes"
            value={model.publishedFinishes || "—"}
            detail="Cells in the circuit view"
          />
        </dl>
        <p className="analytics-circuit-note">
          <TrophyIcon size={16} aria-hidden />
          Facts are limited to the selected archive publication.
        </p>
      </div>
    </div>
  );
}
