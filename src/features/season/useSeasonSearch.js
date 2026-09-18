import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { runtimeYear } from "./selectors";
export default function useSeasonSearch() {
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    if (!params.has("season")) {
      const next = new URLSearchParams(params);
      next.set("season", String(runtimeYear()));
      setParams(next, { replace: true });
    }
  }, [params, setParams]);
  return [params, setParams];
}
