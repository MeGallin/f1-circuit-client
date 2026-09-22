import Explore from "../pages/Explore";
import Profile from "../pages/Profile";
import Compare from "../pages/Compare";
import AppShell from "../components/AppShell";
import Overview from "../pages/Overview";
import OverviewLayoutMockups from "../pages/OverviewLayoutMockups";
import Calendar from "../pages/Calendar";
import RaceDetail from "../pages/RaceDetail";
import Standings from "../pages/Standings";
import Sources from "../pages/Sources";
import Evidence from "../pages/Evidence";
import Questions from "../pages/Questions";
import { lazy, Suspense } from "react";
const Design = import.meta.env.DEV
  ? lazy(() => import("../pages/Design"))
  : null;
const Analytics = lazy(() => import("../pages/Analytics"));
import { Route, Routes, useSearchParams } from "react-router-dom";
const Audit = import.meta.env.DEV
  ? lazy(() => import("../pages/DevAudit"))
  : null;
import { PageHeading, EmptyState, ActionLink } from "../components/ui";
import "../styles/components.css";
export default function App() {
  const [params] = useSearchParams();
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route
          path="/design/overview-layouts"
          element={<OverviewLayoutMockups />}
        />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/events/:eventId" element={<RaceDetail />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/evidence/:evidenceId" element={<Evidence />} />
        <Route path="/questions" element={<Questions />} />
        <Route
          path="/analytics"
          element={
            <Suspense fallback={<p>Loading performance analytics…</p>}>
              <Analytics />
            </Suspense>
          }
        />
        <Route path="/explore" element={<Explore />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/drivers/:id" element={<Profile kind="driver" />} />
        <Route
          path="/constructors/:id"
          element={<Profile kind="constructor" />}
        />
        <Route path="/circuits/:id" element={<Profile kind="circuit" />} />
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
                eyebrow="PAGE NOT FOUND"
                title="This page is not available."
                description="Use the main navigation to explore the published archive."
              />
              <EmptyState
                title="No matching page"
                description="The link may be incomplete or refer to an unavailable page."
                action={
                  <ActionLink to="/">Return to season overview</ActionLink>
                }
              />
            </>
          }
        />
      </Routes>
      {Audit && params.get("audit") === "1" && (
        <Suspense fallback={null}>
          <Audit />
        </Suspense>
      )}
    </AppShell>
  );
}
