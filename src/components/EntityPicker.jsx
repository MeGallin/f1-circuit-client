import { useEffect, useId, useState } from "react";
import { useSearchEntitiesQuery } from "../api/archiveApi";
import { Button } from "./ui";

const kindLabels = {
  driver: "driver",
  constructor: "constructor",
  circuit: "circuit",
  event: "race",
  season: "season",
};

export default function EntityPicker({
  label,
  kind,
  value = "",
  displayName = "",
  onChange,
  onResolvedChange,
  placeholder = "Search by name",
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(value);
  const [selected, setSelected] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const search = selected ? "" : term || value;
  const query = useSearchEntitiesQuery(
    { q: search, kind: kind || undefined },
    { skip: (!open && !value) || search.trim().length < 2 },
  );
  const options = query.currentData?.items || [];
  const safeActiveIndex = open && activeIndex >= 0 && options.length
    ? Math.min(activeIndex, options.length - 1)
    : -1;
  const resolved =
    selected?.id === value
      ? selected
      : query.currentData?.items?.find((item) => item.id === value) ||
        (value && displayName
          ? {
              id: value,
              kind,
              entity: { displayName },
            context: null,
          }
          : null);

  const resolvedId = resolved?.id || "";
  const resolvedKind = resolved?.kind || kind || "";
  const resolvedDisplayName = resolved?.entity?.displayName || "";
  const resolvedContext = resolved?.context || "";
  useEffect(() => {
    if (!onResolvedChange) return;
    onResolvedChange(
      resolvedId
        ? {
            id: resolvedId,
            kind: resolvedKind,
            entity: { displayName: resolvedDisplayName },
            context: resolvedContext || null,
          }
        : null,
    );
  }, [
    onResolvedChange,
    resolvedContext,
    resolvedDisplayName,
    resolvedId,
    resolvedKind,
  ]);

  const choose = (item) => {
    setSelected(item);
    setTerm("");
    setOpen(false);
    setActiveIndex(-1);
    onChange(item.id, item);
  };
  const clear = () => {
    setSelected(null);
    setTerm("");
    setOpen(false);
    setActiveIndex(-1);
    onChange("", null);
  };
  return (
    <div className="field entity-picker">
      <label htmlFor={id}>{label}</label>
      {resolved ? (
        <div className="entity-picker-selected">
          <span>
            <strong>{resolved.entity.displayName}</strong>
            <small>
              {kindLabels[resolved.kind] || resolved.kind}
              {resolved.context ? ` · ${resolved.context}` : ""}
            </small>
          </span>
          <Button variant="quiet" onClick={clear} aria-label={`Clear ${label}`}>
            Clear
          </Button>
        </div>
      ) : (
        <div className="entity-picker-input">
          <input
            id={id}
            value={term}
            placeholder={placeholder}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={`${id}-results`}
            aria-activedescendant={
              safeActiveIndex >= 0 ? `${id}-option-${safeActiveIndex}` : undefined
            }
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setTerm(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && options.length) {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((current) =>
                  current < options.length - 1 ? current + 1 : 0,
                );
              }
              if (event.key === "ArrowUp" && options.length) {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((current) =>
                  current > 0 ? current - 1 : options.length - 1,
                );
              }
              if (event.key === "Home" && options.length) {
                event.preventDefault();
                setActiveIndex(0);
              }
              if (event.key === "End" && options.length) {
                event.preventDefault();
                setActiveIndex(options.length - 1);
              }
              if (event.key === "Enter" && safeActiveIndex >= 0 && options[safeActiveIndex]) {
                event.preventDefault();
                choose(options[safeActiveIndex]);
              }
              if (event.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
              }
            }}
          />
        </div>
      )}
      {open && !resolved && search.trim().length >= 2 && (
        <div className="entity-picker-results" id={`${id}-results`} role="listbox">
          {query.isFetching && <p className="entity-picker-message">Searching the archive…</p>}
          {!query.isFetching && options.length === 0 && (
            <p className="entity-picker-message">No matching {kindLabels[kind] || "record"} found.</p>
          )}
          {options.map((item, index) => (
            <button
              className="entity-picker-option"
              key={`${item.kind}:${item.id}`}
              id={`${id}-option-${index}`}
              type="button"
              role="option"
              aria-selected={safeActiveIndex === index}
              onClick={() => choose(item)}
            >
              <strong>{item.entity.displayName}</strong>
              <small>
                {kindLabels[item.kind] || item.kind}
                {item.context ? ` · ${item.context}` : ""}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
