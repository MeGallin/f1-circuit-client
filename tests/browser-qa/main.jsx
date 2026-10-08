import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, useLocation } from "react-router-dom";
import App from "../../src/app/App";
import { store } from "../../src/app/store";
import { Button } from "../../src/components/ui";
import { createControlledArchive } from "./controlledArchive";
import "../../src/design-system/fonts.css";
import "../../src/design-system/apex.tokens.css";
import "../../src/design-system/apex.media.css";
import "../../src/styles/base.css";
import "./qa.css";

const transport = createControlledArchive();
const realFetch = window.fetch.bind(window);
window.fetch = (request, options) => {
  const input =
    request instanceof Request ? request : new Request(request, options);
  if (input.method !== "GET")
    return Promise.reject(new Error("Isolated QA blocks non-GET requests"));
  // Overview is controlled; other pages use the configured read-only API proxy.
  return window.location.pathname === "/" &&
    new URL(input.url).pathname.startsWith("/api/v1")
    ? transport.fetch(input)
    : realFetch(input);
};

function QA() {
  const location = useLocation();
  const [stats, setStats] = useState(transport.snapshot());
  const [large, setLarge] = useState(
    new URLSearchParams(location.search).get("qaText") === "200",
  );
  useEffect(
    () => transport.subscribe(() => setStats(transport.snapshot())),
    [],
  );
  return (
    <>
      {large && <style>{":root { font-size: 200% !important; }"}</style>}
      <details className="qa-controls" open>
        <summary>Isolated QA controls — not production</summary>
        <p>
          Overview uses synthetic unavailable-season fixtures. Other routes are
          GET-only published API reads. 200% style is root-font enlargement, not
          native zoom.
        </p>
        <label>
          <input
            type="checkbox"
            checked={large}
            onChange={(event) => setLarge(event.target.checked)}
          />
          200% root-font test style
        </label>
        <div className="qa-actions">
          <Button onClick={() => transport.setMode("hold")}>
            Hold future responses
          </Button>
          <Button onClick={() => transport.release("error")}>
            Release failure (503)
          </Button>
          <Button onClick={() => transport.release("success")}>
            Release success
          </Button>
        </div>
        <output aria-label="QA request counters">
          {JSON.stringify(stats)}
        </output>
        <a href="/?season=2025">Restart controlled Overview</a>
        <a href="/standings?season=2026&qaText=200">
          Published Standings · 200% style
        </a>
        <p>
          For Race, open this server's /events/[published event id] with the
          existing season/session/view URL and optional qaText=200.
        </p>
      </details>
      <App />
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <QA />
    </BrowserRouter>
  </Provider>,
);
