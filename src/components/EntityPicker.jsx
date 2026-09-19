import { useId, useState } from "react";
import { useSearchEntitiesQuery } from "../api/archiveApi";
import { Button } from "./ui";

const kindLabels = {
  driver: "driver",
  constructor: "team",
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
  placeholder = "Search by name",
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(value);
  const [selected, setSelected] = useState(null);
  const search = selected ? "" : term || value;
  const query = useSearchEntitiesQuery(
    { q: search, kind: kind || undefined },
    { skip: (!open && !value) || search.trim().length < 2 },
  );
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
  const choose = (item) => {
    setSelected(item);
    setTerm("");
    setOpen(false);
    onChange(item.id, item);
  };
  const clear = () => {
    setSelected(null);
    setTerm("");
    setOpen(false);
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
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setTerm(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
          />
        </div>
      )}
      {open && !resolved && search.trim().length >= 2 && (
        <div className="entity-picker-results" id={`${id}-results`} role="listbox">
          {query.isFetching && <p className="entity-picker-message">Searching the archive…</p>}
          {!query.isFetching && query.currentData?.items?.length === 0 && (
            <p className="entity-picker-message">No matching {kindLabels[kind] || "record"} found.</p>
          )}
          {query.currentData?.items?.map((item) => (
            <button
              className="entity-picker-option"
              key={`${item.kind}:${item.id}`}
              type="button"
              role="option"
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
