import { useState } from "react";
import { PaletteIcon } from "@phosphor-icons/react";
import {
  Button,
  Panel,
  PageHeading,
  Tabs,
  Select,
  Input,
  StatusBadge,
  Skeleton,
  EmptyState,
  ErrorState,
  DataTable,
  Pagination,
} from "../components/ui";
export default function Design() {
  const [tab, setTab] = useState("controls");
  const [audit, setAudit] = useState("");
  return (
    <>
      <PageHeading
        eyebrow="APEX / COMPONENT CHECKPOINT"
        title="Built for the details."
        description="Reusable controls and states. Demonstration content below is not race data."
        icon={PaletteIcon}
      />
      <Panel title="Interface vocabulary">
        <Tabs
          label="Component examples"
          value={tab}
          onChange={setTab}
          items={[
            { value: "controls", label: "Controls" },
            { value: "states", label: "Data states" },
            { value: "table", label: "Responsive table" },
          ]}
        >
          {tab === "controls" ? (
            <div className="demo-stack">
              <div className="inline">
                <Button>Primary action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="quiet">Quiet action</Button>
                <Button disabled>Unavailable</Button>
              </div>
              <div className="filters">
                <Select
                  label="Example selection"
                  options={[
                    { value: "one", label: "First option" },
                    { value: "two", label: "Second option" },
                  ]}
                />
                <Input
                  label="Example text input"
                  placeholder="Search a sample"
                />
              </div>
              <div className="inline">
                <StatusBadge>Source only</StatusBadge>
                <StatusBadge tone="success">Available</StatusBadge>
                <StatusBadge tone="warning">Partial coverage</StatusBadge>
              </div>
            </div>
          ) : tab === "states" ? (
            <div className="demo-stack">
              <Skeleton label="Loading example" />
              <EmptyState title="No sample records" />
              <ErrorState onRetry={() => setAudit("Retry example selected")} />
            </div>
          ) : (
            <>
              <DataTable
                caption="Clearly labelled component fixture"
                columns={[
                  { key: "name", label: "Example identity" },
                  { key: "value", label: "Value", numeric: true },
                ]}
                rows={[
                  {
                    id: "fixture",
                    name: "Long component demonstration label",
                    value: "12.5",
                  },
                ]}
              />
              <Pagination page={1} total={1} hasMore={false} />
            </>
          )}
        </Tabs>
      </Panel>
      <div className="audit-control">
        <Button
          variant="quiet"
          onClick={async () => {
            const { default: axe } = await import("axe-core");
            const r = await axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            });
            setAudit(
              r.violations.length
                ? JSON.stringify(
                    r.violations.map((v) => ({
                      id: v.id,
                      impact: v.impact,
                      count: v.nodes.length,
                    })),
                  )
                : "No automated WCAG A/AA violations detected.",
            );
          }}
        >
          Run accessibility check
        </Button>
        <p role="status">{audit}</p>
      </div>
    </>
  );
}
