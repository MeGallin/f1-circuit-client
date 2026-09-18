import AppShell from "../components/AppShell";
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
                description="The Apex foundation is ready for review. Historical API views are the next implementation stage."
              />
              <EmptyState
                title="Component review checkpoint"
                description="This build contains the design system and reusable interface components. It does not display race data yet."
                action={
                  <ActionLink to="/design">Review the design system</ActionLink>
                }
              />
            </>
          }
        />
      </Routes>
    </AppShell>
  );
}
