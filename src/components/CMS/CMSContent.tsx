import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import {
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ShoppingBag,
  Users,
  Tags,
  Ticket,
  LayoutGrid,
  Layers,
  MessageSquare,
  Target,
  ArrowUpRight,
  X,
  LucideIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { EASE, BrandLogo } from "../landing/primitives";

// Lets page headers (CMSHeader) open the mobile nav drawer
const CMSNavContext = createContext<{ openNav: () => void } | null>(null);
export const useCMSNav = () => useContext(CMSNavContext);

const DESKTOP_QUERY = "(min-width: 1024px)";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia(DESKTOP_QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
};

interface CMSContentProps {
  onLogout: () => void;
  children?: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: { index: string; label: string; items: NavItem[] }[] = [
  {
    index: "01",
    label: "Project Ops",
    items: [
      { id: "orders", label: "Orders", icon: ShoppingBag },
      { id: "clients", label: "Clients", icon: Users },
      { id: "pricelist", label: "Pricelist", icon: Tags },
      { id: "vouchers", label: "Vouchers", icon: Ticket },
    ],
  },
  {
    index: "02",
    label: "System Setup",
    items: [
      { id: "portfolio", label: "Portfolio", icon: LayoutGrid },
      { id: "services", label: "Services", icon: Layers },
      { id: "testimonials", label: "Testimonials", icon: MessageSquare },
      { id: "fastwork", label: "Fastwork Sales", icon: Target },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
const SIDEBAR_COLLAPSED_KEY = "gous_cms_sidebar_collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
};

// Tooltip shown next to icons when the sidebar is collapsed
const Tooltip: React.FC<{ label: string }> = ({ label }) => (
  <span className="pointer-events-none absolute left-full z-[100] ml-3 -translate-x-1 whitespace-nowrap rounded-[8px] bg-ink px-2.5 py-1.5 text-xs font-medium text-paper opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
    {label}
  </span>
);

const NavButton: React.FC<{
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ item, isActive, isCollapsed, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-label={isCollapsed ? item.label : undefined}
      className={`group relative flex h-10 items-center rounded-[10px] text-sm transition-colors duration-200 ${
        isCollapsed ? "w-10 justify-center" : "w-full gap-3 px-3"
      } ${isActive ? "font-semibold text-ink" : "font-medium text-muted hover:bg-ink/[0.04] hover:text-ink"}`}
    >
      {/* Active pill slides between items (DESIGN.md §6, layoutId pill) */}
      {isActive && (
        <motion.span
          layoutId="cms-nav-pill"
          transition={{ duration: 0.35, ease: EASE }}
          className="absolute inset-0 rounded-[10px] border border-violet-200 bg-violet-50"
        />
      )}
      <Icon
        className={`relative h-4 w-4 shrink-0 ${isActive ? "text-violet-600" : "text-ink/40 group-hover:text-ink/70"}`}
        strokeWidth={isActive ? 2.25 : 2}
      />
      {!isCollapsed && <span className="relative truncate">{item.label}</span>}
      {isCollapsed && <Tooltip label={item.label} />}
    </button>
  );
};

const CMSContent: React.FC<CMSContentProps> = ({ onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsedPref, setIsCollapsed] = useState(readCollapsed);
  const isDesktop = useIsDesktop();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Collapsing is a desktop-only preference; the mobile drawer always shows labels
  const isCollapsed = isDesktop && collapsedPref;

  // Close the drawer on navigation, on Escape, and when switching to desktop
  useEffect(() => setMobileOpen(false), [location.pathname, isDesktop]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const toggleSidebar = () => {
    const next = !collapsedPref;
    setIsCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    } catch {
      // Preference just won't persist
    }
  };

  const activePage =
    ALL_ITEMS.find((item) => location.pathname.includes(`/${item.id}`))?.id ?? "orders";

  const footerButton = `group relative flex h-10 items-center rounded-[10px] text-sm font-medium transition-colors duration-200 ${
    isCollapsed ? "w-10 justify-center" : "w-full gap-3 px-3"
  }`;

  return (
    <MotionConfig reducedMotion="user">
    <CMSNavContext.Provider value={{ openNav: () => setMobileOpen(true) }}>
      <div
        className="cms-shell flex flex-1 overflow-hidden bg-paper"
        style={
          {
            // Page headers offset by this; the mobile drawer overlays instead of pushing content
            "--sidebar-width": !isDesktop ? "0px" : isCollapsed ? "4.5rem" : "13.5rem",
          } as React.CSSProperties
        }
      >
        {/* Mobile drawer backdrop */}
        {!isDesktop && mobileOpen && (
          <div
            className="cms-modal-backdrop fixed inset-0 z-40 cursor-pointer bg-ink/45"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar: static column on desktop, slide-in drawer below lg */}
        <aside
          id="cms-sidebar"
          inert={!isDesktop && !mobileOpen}
          className={`${
            isDesktop
              ? `${isCollapsed ? "w-[4.5rem]" : "w-[13.5rem]"} relative z-20 transition-[width]`
              : `fixed inset-y-0 left-0 z-50 w-[15rem] transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
          } flex shrink-0 flex-col border-r border-ink/10 bg-white duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}
        >
          {/* Wordmark — same height as the page header so the two lines align */}
          <div
            className={`flex h-[58px] shrink-0 items-center border-b border-ink/10 ${isCollapsed ? "justify-center" : "px-5"}`}
          >
            {isCollapsed ? (
              <BrandLogo wordmark={false} size="sm" />
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <BrandLogo size="sm" className="min-w-0" />
                <span className="gs-label text-[10px] text-ink/40">CMS</span>
              </div>
            )}
            {!isDesktop && (
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-ink/45 transition-colors hover:bg-ink/[0.05] hover:text-ink"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <nav
            className={`custom-scrollbar flex-1 overflow-y-auto ${isCollapsed ? "px-3.5" : "px-3"} py-5 space-y-6`}
            aria-label="Menu CMS"
          >
            {NAV_GROUPS.map((group) => (
              <div key={group.index}>
                {isCollapsed ? (
                  <div className="mx-auto mb-3 h-px w-6 bg-ink/10" aria-hidden />
                ) : (
                  <p className="gs-label mb-2 flex items-center gap-2 px-3 text-[10px] text-ink/40">
                    <span className="text-violet-600">{group.index}</span>
                    <span aria-hidden className="h-px w-4 bg-current opacity-40" />
                    <span className="truncate">{group.label}</span>
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      isActive={activePage === item.id}
                      isCollapsed={isCollapsed}
                      onClick={() => navigate(`/cms/${item.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className={`space-y-1 border-t border-ink/10 py-3 ${isCollapsed ? "flex flex-col items-center px-3.5" : "px-3"}`}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={isCollapsed ? "Lihat situs" : undefined}
              className={`${footerButton} text-muted hover:bg-ink/[0.04] hover:text-ink`}
            >
              <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-ink/70" />
              {!isCollapsed && <span className="truncate">Lihat Situs</span>}
              {isCollapsed && <Tooltip label="Lihat Situs" />}
            </a>
            {isDesktop && (
            <button
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Perluas menu" : undefined}
              aria-expanded={!isCollapsed}
              className={`${footerButton} text-muted hover:bg-ink/[0.04] hover:text-ink`}
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4 w-4 shrink-0 text-ink/40" />
              ) : (
                <ChevronsLeft className="h-4 w-4 shrink-0 text-ink/40" />
              )}
              {!isCollapsed && <span className="truncate">Ciutkan Menu</span>}
              {isCollapsed && <Tooltip label="Perluas Menu" />}
            </button>
            )}
            <button
              onClick={onLogout}
              aria-label={isCollapsed ? "Keluar" : undefined}
              className={`${footerButton} text-muted hover:bg-rose-50 hover:text-rose-600`}
            >
              <LogOut className="h-4 w-4 shrink-0 opacity-60" />
              {!isCollapsed && <span className="truncate">Keluar</span>}
              {isCollapsed && <Tooltip label="Keluar" />}
            </button>
          </div>
        </aside>

        {/* Main Content (pages render their own fixed CMSHeader, 58px tall) */}
        <main className="custom-scrollbar relative min-w-0 flex-1 overflow-y-auto bg-paper px-4 pb-6 pt-[58px] lg:px-6">
          {children}
        </main>
      </div>
    </CMSNavContext.Provider>
    </MotionConfig>
  );
};

export default CMSContent;
