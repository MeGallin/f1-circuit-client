import AppShell from "../components/AppShell";
import Overview from "../pages/Overview";
import Calendar from "../pages/Calendar";
import { lazy, Suspense } from "react";
const Design = import.meta.env.DEV
  ? lazy(() => import("../pages/Design"))
  : null;
import { Route, Routes } from "react-router-dom";
import { PageHeading, EmptyState, ActionLink } from "../components/ui";
import "../styles/components.css";
export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/calendar" element={<Calendar />} />
        {Design && (
          <Route
            path="/design"
            element={
              <Suspense fallback={<p>Loading design system…</p>}>
                <Design />
              </Suspense>
            }
          />
        )}
        <Route
          path="*"
          element={
            <>
              <PageHeading
                eyebrow="CLIENT FOUNDATION"
                title="The race, in detail."
                description="The season overview is available. This route is part of the next implementation stage."
              />
              <EmptyState
                title="This view is next"
                description="Explore the live season overview while the dedicated calendar, standings and source routes are prepared."
                action={
                  <ActionLink to="/">Return to season overview</ActionLink>
                }
              />
            </>
          }
        />
      </Routes>
    </AppShell>
  );
}
