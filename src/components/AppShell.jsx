import { APEX_ICONS } from "../design-system/apex.tokens";
import { useEffect, useState, useRef } from "react";
import { TimeDisplayPreference } from "./ScheduleTime";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../app/store";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  FlagCheckeredIcon,
  SquaresFourIcon,
  CalendarBlankIcon,
  RankingIcon,
  DatabaseIcon,
  PaletteIcon,
  MagnifyingGlassIcon,
  ChatCircleTextIcon,
  ChartLineUpIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";
import { Select } from "./ui";
import { runtimeYear } from "../features/season/selectors";
const navigation = [
  { to: "/", label: "Overview", icon: SquaresFourIcon },
  { to: "/calendar", label: "Calendar", icon: CalendarBlankIcon },
  { to: "/standings", label: "Standings", icon: RankingIcon },
  { to: "/explore", label: "Explore", icon: MagnifyingGlassIcon },
  { to: "/questions", label: "Ask", icon: ChatCircleTextIcon },
  { to: "/analytics", label: "Analytics", icon: ChartLineUpIcon },
  { to: "/sources", label: "Sources", icon: DatabaseIcon },
];
const primaryNavigation = navigation.slice(0, 4);
const secondaryNavigation = navigation.slice(4);

export function routeTitle(pathname) {
  if (pathname === "/") return "Season overview";
  if (pathname === "/calendar") return "Season calendar";
  if (pathname.startsWith("/events/")) return "Race detail";
  if (pathname === "/standings") return "Championship standings";
  if (pathname === "/sources") return "Sources and coverage";
  if (pathname.startsWith("/evidence/")) return "Evidence detail";
  if (pathname === "/questions") return "Ask the archive";
  if (pathname === "/analytics") return "Performance analytics";
  if (pathname === "/explore") return "Explore the archive";
  if (pathname === "/compare") return "Compare archive metrics";
  if (pathname.startsWith("/drivers/")) return "Driver profile";
  if (pathname.startsWith("/constructors/")) return "Constructor profile";
  if (pathname.startsWith("/circuits/")) return "Circuit profile";
  if (pathname === "/design") return "Design system";
  if (pathname === "/design/overview-layouts") return "Overview layout study";
  return "F1 Circuit";
}

export function Navigation({ mobile = false, onHeight }) {
  const nav = useRef(null);
  useEffect(() => {
    if (!mobile || !onHeight || !nav.current) return;
    let mounted = true;
    const measure = () => {
      if (mounted && nav.current)
        onHeight(nav.current.getBoundingClientRect().height);
    };
    measure();
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(nav.current);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      mounted = false;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [mobile, onHeight]);
  const [moreOpen, setMoreOpen] = useState(false);
  const { search, pathname } = useLocation();
  const sourceParams = new URLSearchParams(search);
  let eventId = sourceParams.get("event");
  if (pathname.startsWith("/events/")) {
    try {
      eventId = decodeURIComponent(pathname.slice(8));
    } catch {
      eventId = null;
    }
  }
  const navigationParams = new URLSearchParams();
  for (const key of ["season", "snapshot"]) {
    const value = sourceParams.get(key);
    if (value != null) navigationParams.set(key, value);
  }
  if (eventId) navigationParams.set("event", eventId);
  if (!navigationParams.has("season"))
    navigationParams.set("season", String(runtimeYear()));
  const target = (to) => {
    if (to === "/explore") return to;
    const destination = new URLSearchParams(navigationParams);
    if (to === "/standings" && pathname === "/standings") {
      const kind = sourceParams.get("kind");
      if (["drivers", "constructors"].includes(kind))
        destination.set("kind", kind);
      const round = sourceParams.get("round");
      if (/^[1-9]\d*$/.test(round || "") && Number.isSafeInteger(Number(round)))
        destination.set("round", round);
      for (const key of ["standingSnapshotId", "standingSnapshot"]) {
        const value = sourceParams.get(key);
        if (value) destination.set(key, value);
      }
    }
    return `${to}${destination.size ? `?${destination}` : ""}`;
  };
  const isSecondaryActive = secondaryNavigation.some(({ to }) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to),
  );
  useEffect(() => {
    if (!moreOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [moreOpen]);
  const link = ({ to, label, icon: Icon }, onClick) => (
    <NavLink end={to === "/"} key={to} to={target(to)} onClick={onClick}>
      <Icon aria-hidden size={APEX_ICONS.navigation} weight="regular" />
      <span>{label}</span>
    </NavLink>
  );
  if (mobile)
    return (
      <nav ref={nav} aria-label="Mobile navigation" className="mobile-nav">
        {primaryNavigation.map((item) => link(item, () => setMoreOpen(false)))}
        <div className="nav-more">
          <button
            className={
              isSecondaryActive ? "nav-more-toggle active" : "nav-more-toggle"
            }
            type="button"
            aria-expanded={moreOpen}
            aria-controls="mobile-more-menu"
            onClick={() => setMoreOpen((open) => !open)}
          >
            <DotsThreeIcon
              aria-hidden
              size={APEX_ICONS.navigation}
              weight="regular"
            />
            <span>More</span>
          </button>
          {moreOpen && (
            <div id="mobile-more-menu" className="nav-more-menu">
              {secondaryNavigation.map((item) =>
                link(item, () => setMoreOpen(false)),
              )}
            </div>
          )}
        </div>
      </nav>
    );
  return (
    <nav aria-label="Main navigation" className="rail-nav">
      {navigation.map((item) => link(item))}
    </nav>
  );
}
export function ThemeSelect() {
  const theme = useSelector((s) => s.preferences.theme);
  const dispatch = useDispatch();
  return (
    <Select
      label="Appearance"
      value={theme}
      onChange={(e) => dispatch(setTheme(e.target.value))}
      options={["dark", "light", "system"].map((t) => ({
        value: t,
        label: t[0].toUpperCase() + t.slice(1),
      }))}
    />
  );
}
function useTheme() {
  const theme = useSelector((s) => s.preferences.theme);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: light)");
    const update = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "light" : "dark") : theme;
    };
    update();
    try {
      localStorage.setItem("apex-theme", theme);
    } catch {
      /* Preference storage is optional. */
    }
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [theme]);
}
export default function AppShell({ children }) {
  const [navigationHeight, setNavigationHeight] = useState(0);
  useTheme();
  const location = useLocation();
  const homeParams = new URLSearchParams(location.search);
  const home = `/?season=${encodeURIComponent(homeParams.get("season") || String(runtimeYear()))}`;
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [location.pathname]);
  useEffect(() => {
    document.title = `${routeTitle(location.pathname)} | F1 Circuit`;
  }, [location.pathname]);
  return (
    <div
      className="app-shell apex-layout"
      style={{
        "--apex-size-mobile-navigation-height": `${navigationHeight}px`,
      }}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="rail">
        <Link to={home} className="brand" aria-label="F1 Circuit home">
          <FlagCheckeredIcon
            weight="fill"
            size={APEX_ICONS.brand}
            aria-hidden
          />
          <span>
            F1<span className="brand-secondary">CIRCUIT</span>
          </span>
        </Link>
        <p className="rail-caption">THE HISTORICAL ARCHIVE</p>
        <Navigation />
        <div className="rail-bottom">
          <ThemeSelect />
          <TimeDisplayPreference />
          {import.meta.env.DEV && (
            <Link to="/design" className="design-link">
              <PaletteIcon size={APEX_ICONS.action} aria-hidden /> Design system
            </Link>
          )}
          <p>History. Context. Detail.</p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <Link to={home} className="mobile-brand">
            F1 CIRCUIT
          </Link>
          <span className="topbar-context">FORMULA 1 / HISTORICAL DATA</span>
          <span className="topbar-note">The race, in detail.</span>
          <div className="mobile-theme">
            <details className="display-preferences">
              <summary>Display</summary>
              <div className="display-preferences-body">
                <ThemeSelect />
                <TimeDisplayPreference />
              </div>
            </details>
          </div>
        </header>
        <main id="main" className="page" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <span>F1 Circuit · Independent historical archive</span>
          <Link to="/sources">Sources & coverage</Link>
          <p>Not affiliated with Formula 1 or its rights holders.</p>
        </footer>
      </div>
      <Navigation mobile onHeight={setNavigationHeight} />
    </div>
  );
}
