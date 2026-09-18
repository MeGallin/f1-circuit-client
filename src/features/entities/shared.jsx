import { useSearchParams, useInRouterContext } from "react-router-dom";
import { entityKinds } from "../../api/archiveApi";
import { Button, TextLink } from "../../components/ui";
export function entityPath(kind, id, season) {
  if (!Object.hasOwn(entityKinds, kind)) return null;
  const query = new URLSearchParams();
  if (season) query.set("season", season);
  return `/${entityKinds[kind]}/${encodeURIComponent(id)}${query.size ? `?${query}` : ""}`;
}
export function EntityLink(props) {
  const routed = useInRouterContext();
  if (!props.entity) return "Not supplied";
  if (!routed || !props.entity.id) return props.entity.displayName;
  return <RoutedEntityLink {...props} />;
}
function RoutedEntityLink({ entity, kind, season }) {
  const [params] = useSearchParams();
  if (!entity) return "Not supplied";
  return (
    <TextLink to={entityPath(kind, entity.id, season || params.get("season"))}>
      {entity.displayName}
    </TextLink>
  );
}
export function changeFilters(params, values) {
  const next = new URLSearchParams(params);
  for (const key of ["cursor", "snapshot"]) next.delete(key);
  for (const [key, value] of Object.entries(values)) {
    if (value == null || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  return next;
}
export function CollectionPages({
  data,
  query,
  params,
  setParams,
  label = "Archive pages",
}) {
  if (!data) return null;
  return (
    <nav className="pagination" aria-label={label}>
      <Button
        variant="quiet"
        disabled={!params.has("cursor") || query.isFetching}
        onClick={() => {
          const next = new URLSearchParams(params);
          next.delete("cursor");
          setParams(next);
        }}
      >
        First page
      </Button>
      <span>
        {data.items.length} shown · {data.page.total ?? "Unknown total"} records
      </span>
      <Button
        variant="secondary"
        disabled={
          !data.page.hasMore || !data.page.nextCursor || query.isFetching
        }
        onClick={() => {
          const next = new URLSearchParams(params);
          next.set("cursor", data.page.nextCursor);
          next.set("snapshot", data.meta.snapshotId);
          setParams(next);
        }}
      >
        Next page
      </Button>
    </nav>
  );
}
export function refreshSelection(params, setParams, query) {
  if (params.has("snapshot") || params.has("cursor"))
    setParams(changeFilters(params, {}));
  else query.refetch();
}
