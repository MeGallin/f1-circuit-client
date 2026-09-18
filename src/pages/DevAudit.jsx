import { useState } from "react";
import { Button } from "../components/ui";
export default function DevAudit() {
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section
      className="audit-control"
      aria-label="Development accessibility audit"
    >
      <Button
        disabled={busy}
        variant="quiet"
        onClick={async () => {
          setBusy(true);
          try {
            const { default: axe } = await import("axe-core");
            const report = await axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            });
            setResult(
              JSON.stringify({
                violations: report.violations.map((item) => ({
                  id: item.id,
                  impact: item.impact,
                  targets: item.nodes.map((node) => node.target),
                })),
                incomplete: report.incomplete.map((item) => ({
                  id: item.id,
                  nodes: item.nodes.map((node) => ({
                    target: node.target,
                    summary: node.failureSummary,
                  })),
                })),
                passes: report.passes.length,
              }),
            );
          } catch {
            setResult("Audit failed to run.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Audit this page
      </Button>
      <output
        className="audit-result"
        aria-live="polite"
        style={{ display: "block", overflowWrap: "anywhere" }}
      >
        {result}
      </output>
    </section>
  );
}
