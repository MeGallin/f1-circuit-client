import { DriverNumber } from "./ui";
import "../design-system/driver-identity.css";

export function DriverIdentity({
  number,
  name,
  team,
  stackOnMobile = false,
  presentation = "home",
  inline = false,
}) {
  const Root = inline ? "span" : "div";
  const Line = inline ? "span" : "div";
  return (
    <Root
      className={`driver-identity${presentation !== "home" ? ` driver-identity--${presentation}` : ""}${stackOnMobile ? " driver-identity--stack-mobile" : ""}`}
    >
      <Line className="driver-identity-line">
        <DriverNumber number={number} />
        <strong className="driver-identity-name">{name}</strong>
      </Line>
      {team && <Line className="driver-identity-team">{team}</Line>}
    </Root>
  );
}
