import { useEffect } from "react";
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
} from "@phosphor-icons/react";
import { Select } from "./ui";
const navigation = [
  { to: "/", label: "Overview", icon: SquaresFourIcon },
  { to: "/calendar", label: "Calendar", icon: CalendarBlankIcon },
  { to: "/standings", label: "Standings", icon: RankingIcon },
  { to: "/sources", label: "Sources", icon: DatabaseIcon },
];
function Navigation({ mobile = false }) {
  const { search, pathname } = useLocation();
  let eventId = new URLSearchParams(search).get("event");
  if (pathname.startsWith("/events/")) {
    try {
      eventId = decodeURIComponent(pathname.slice(8));
    } catch {
      eventId = null;
    }
  }
  const navigationParams = new URLSearchParams();
  for (const key of ["season", "kind", "round"]) {
    const value = new URLSearchParams(search).get(key);
    if (value != null) navigationParams.set(key, value);
  }
  if (eventId) navigationParams.set("event", eventId);
  return (
    <nav
      aria-label={mobile ? "Mobile navigation" : "Main navigation"}
      className={mobile ? "mobile-nav" : "rail-nav"}
    >
      {navigation.map(({ to, label, icon: Icon }) => (
        <NavLink
          end={to === "/"}
          key={to}
          to={`${to}${navigationParams.size ? `?${navigationParams}` : ""}`}
        >
          <Icon aria-hidden size={21} weight="regular" />
          <span>{label}</span>
        </NavLink>
      ))}
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
  useTheme();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [location.pathname]);
  return (
    <div className="app-shell apex-layout">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="rail">
        <Link to="/" className="brand" aria-label="F1 Circuit home">
          <FlagCheckeredIcon weight="fill" size={30} aria-hidden />
          <span>
            F1<span className="brand-secondary">CIRCUIT</span>
          </span>
        </Link>
        <p className="rail-caption">THE HISTORICAL ARCHIVE</p>
        <Navigation />
        <div className="rail-bottom">
          <ThemeSelect />
          {import.meta.env.DEV && (
            <Link to="/design" className="design-link">
              <PaletteIcon size={18} aria-hidden /> Design system
            </Link>
          )}
          <p>History. Context. Detail.</p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <Link to="/" className="mobile-brand">
            F1 CIRCUIT
          </Link>
          <span className="topbar-context">FORMULA 1 / HISTORICAL DATA</span>
          <span className="topbar-note">The race, in detail.</span>
          <div className="mobile-theme">
            <ThemeSelect />
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
      <Navigation mobile />
    </div>
  );
}
