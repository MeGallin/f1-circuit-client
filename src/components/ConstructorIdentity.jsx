import { useState } from "react";
import { constructorLogoAsset } from "./constructorLogos";
import "../design-system/constructor-identity.css";
import "../design-system/constructor-media.css";

function LogoImage({ src, name, decorative, tile }) {
  const [failed, setFailed] = useState(false);
  if (failed) return decorative ? null : <span>{name}</span>;
  return (
    <span
      className={`constructor-logo${tile === "dark" ? " constructor-logo--dark" : ""}`}
    >
      <img
        src={src}
        alt={decorative ? "" : name}
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export function ConstructorLogo({ constructor, year, decorative = false }) {
  const name = constructor?.displayName || "Constructor not supplied";
  const asset = constructorLogoAsset(constructor?.id, year);
  if (!asset) return decorative ? null : <span>{name}</span>;
  const src = `/images/constructors/${asset.file}`;
  return (
    <LogoImage
      key={src}
      src={src}
      name={name}
      decorative={decorative}
      tile={asset.tile}
    />
  );
}

export function ConstructorIdentity({ constructor, year }) {
  return (
    <span className="constructor-identity">
      <ConstructorLogo constructor={constructor} year={year} decorative />
      <span className="constructor-identity-name">
        {constructor?.displayName || "Constructor not supplied"}
      </span>
    </span>
  );
}

export function ConstructorIdentities({ constructors = [], year }) {
  return Array.isArray(constructors) && constructors.length
    ? constructors.map((constructor, index) => (
        <span key={`${constructor.id}:${index}`}>
          {index > 0 && " / "}
          <ConstructorIdentity constructor={constructor} year={year} />
        </span>
      ))
    : "Constructor not supplied";
}
