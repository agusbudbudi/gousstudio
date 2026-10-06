// Shared building blocks for client-facing pages (order detail, payment, client portal).
// Same brand shell as the landing (docs/DESIGN.md §2): paper + ink, editorial labels, violet signature.
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, FileText, LucideIcon, RefreshCw, Zap } from "lucide-react";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";
import { buttonClass, Eyebrow, Skeleton } from "./primitives";

export const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

// Content width per page. One class each (instead of overriding Container's max-w), because when two
// max-w classes collide the winner depends on stylesheet order, not on class order.
const PAGE_WIDTH = {
  narrow: "max-w-[520px]", // mobile-web width (480px content) for short, single-column flows like payment
  default: "max-w-[1144px]", // 1080px content
  wide: "max-w-[1320px]", // same as the landing Container
};

/** Page frame: landing navbar + compact inner-page spacing (DESIGN.md §2.4) + footer. */
export const ClientPage: React.FC<React.PropsWithChildren<{ width?: "narrow" | "default" | "wide" }>> = ({
  children,
  width = "default",
}) => (
  <motion.div
    className="gs min-h-[100dvh]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <LandingNavbar />
    <main id="main" className="pb-20 pt-24 md:pb-28 md:pt-32">
      <div className={`mx-auto w-full px-5 md:px-8 ${PAGE_WIDTH[width]}`}>{children}</div>
    </main>
    <LandingFooter />
  </motion.div>
);

const PANEL_TONES = {
  light: "border-ink/10 bg-white text-ink",
  // Ink section for emphasis (DESIGN.md §2.2 "ink" rhythm); gs-dark switches focus rings to violet-300
  dark: "gs-dark border-ink bg-ink text-paper",
};

/**
 * Card on paper; elevation via border only (DESIGN.md §2.4).
 * Use `tone` for the dark variant: background classes passed via className would conflict with the
 * built-in one, and which wins depends on stylesheet order, not on class order.
 */
export const Panel: React.FC<
  React.PropsWithChildren<{ className?: string; as?: "section" | "div" | "aside"; tone?: keyof typeof PANEL_TONES }>
> = ({ children, className = "", as: Tag = "section", tone = "light" }) => (
  <Tag className={`rounded-[20px] border ${PANEL_TONES[tone]} ${className}`}>{children}</Tag>
);

/** Mono eyebrow used as a panel/section heading. */
export const PanelLabel: React.FC<React.PropsWithChildren<{ icon?: LucideIcon; className?: string }>> = ({
  icon: Icon,
  children,
  className = "",
}) => (
  <h2 className={`gs-label flex items-center gap-2 text-muted ${className}`}>
    {Icon && <Icon size={14} className="text-violet-600" aria-hidden />}
    {children}
  </h2>
);

/** Label/value row for summaries (prices, payment info). */
export const InfoRow: React.FC<{ label: React.ReactNode; children: React.ReactNode; strong?: boolean }> = ({
  label,
  children,
  strong,
}) => (
  <div className="flex items-baseline justify-between gap-4 text-sm">
    <dt className="text-muted">{label}</dt>
    <dd className={`text-right ${strong ? "font-semibold text-ink" : "text-ink/80"}`}>{children}</dd>
  </div>
);

// ─── Order status ─────────────────────────────────────────────────────────────

export const ORDER_STEPS = ["Diterima", "Pembayaran", "Pengerjaan", "Review", "Selesai"] as const;

type StatusMeta = { label: string; desc: string; step: number; icon: LucideIcon; tone: string };

const STATUS: Record<string, StatusMeta> = {
  DONE: {
    label: "Selesai",
    desc: "Pesanan telah selesai dan file final telah diserahkan.",
    step: 4,
    icon: CheckCircle2,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REVIEWED: {
    label: "Review",
    desc: "Desain sedang direview oleh tim kami sebelum dikirim.",
    step: 3,
    icon: Zap,
    tone: "border-violet-200 bg-violet-50 text-violet-800",
  },
  REVISION: {
    label: "Revisi",
    desc: "Desain sedang dalam proses revisi sesuai feedback Anda.",
    step: 3,
    icon: RefreshCw,
    tone: "border-rose-200 bg-rose-50 text-rose-700",
  },
  "IN PROGRESS": {
    label: "Pengerjaan",
    desc: "Desainer kami sedang mengerjakan desain Anda.",
    step: 2,
    icon: Clock,
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
  "WAITING FOR PAYMENT": {
    label: "Menunggu Pembayaran",
    desc: "Menunggu pembayaran untuk memulai pengerjaan.",
    step: 1,
    icon: AlertCircle,
    tone: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

const DEFAULT_STATUS: StatusMeta = {
  label: "Diterima",
  desc: "Pesanan telah masuk ke sistem kami.",
  step: 0,
  icon: FileText,
  tone: "border-ink/10 bg-paper text-ink/70",
};

export const getOrderStatus = (status?: string | null): StatusMeta => STATUS[status ?? ""] ?? DEFAULT_STATUS;

export const StatusBadge: React.FC<{ status?: string | null; className?: string }> = ({ status, className = "" }) => {
  const meta = getOrderStatus(status);
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${meta.tone} ${className}`}
    >
      <Icon size={13} aria-hidden />
      {meta.label}
    </span>
  );
};

/** Five-step progress (Diterima → Selesai). */
export const StatusSteps: React.FC<{ status?: string | null }> = ({ status }) => {
  const current = getOrderStatus(status).step;
  return (
    <ol className="grid grid-cols-5 gap-2" aria-label="Progres pesanan">
      {ORDER_STEPS.map((label, i) => {
        const done = i < current || (i === current && status === "DONE");
        const active = i === current && status !== "DONE";
        return (
          <li key={label} aria-current={active ? "step" : undefined} className="min-w-0">
            <span
              className={`block h-1 rounded-full ${done ? "bg-ink" : active ? "bg-violet-600" : "bg-ink/10"}`}
              aria-hidden
            />
            <span
              className={`gs-label mt-2.5 block truncate text-[10px] ${
                done || active ? "text-ink" : "text-ink/35"
              }`}
            >
              <span className={active ? "text-violet-700" : ""}>{String(i + 1).padStart(2, "0")}</span>{" "}
              <span className="hidden sm:inline">{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

// ─── States ───────────────────────────────────────────────────────────────────

const STATE_TONES = {
  error: "border-rose-100 bg-rose-50 text-rose-600",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-600",
  neutral: "border-ink/10 bg-paper text-ink/45",
};

/** Centered message card for error / expired / success / empty states. */
export const StatePanel: React.FC<{
  icon: LucideIcon;
  tone?: keyof typeof STATE_TONES;
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ icon: Icon, tone = "neutral", title, children, actions }) => (
  <Panel className="mx-auto max-w-[520px] px-6 py-10 text-center md:px-10 md:py-12">
    <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border ${STATE_TONES[tone]}`}>
      <Icon size={24} aria-hidden />
    </span>
    <h1 className="gs-display mt-6 text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-ink">{title}</h1>
    {children && <div className="mx-auto mt-3 max-w-[40ch] text-[15px] leading-relaxed text-muted">{children}</div>}
    {actions && <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">{actions}</div>}
  </Panel>
);

/**
 * Full-page "not found" state, straight on paper (no card): oversized faded code, eyebrow, display title,
 * copy and one primary action back home. Used by the 404 page and missing-record pages.
 */
export const EditorialState: React.FC<{
  code: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  // Primary action; defaults to the home page
  action?: { to: string; label: string };
}> = ({ code, eyebrow, title, children, action = { to: "/", label: "Kembali ke Beranda" } }) => (
  // No extra top padding: ClientPage already applies the inner-page header spacing (DESIGN.md §2.4)
  <section aria-labelledby="editorial-state-title" className="pb-6 md:pb-12">
    <p aria-hidden className="gs-display select-none text-[clamp(6rem,22vw,15rem)] font-extrabold text-ink/[0.08]">
      {code}
      <span className="text-violet-600">.</span>
    </p>
    <Eyebrow className="mt-8 text-muted">{eyebrow}</Eyebrow>
    <h1
      id="editorial-state-title"
      className="gs-display mt-5 max-w-[16ch] text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold text-ink"
    >
      {title}
    </h1>
    {children && <div className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">{children}</div>}
    <Link to={action.to} className={`${buttonClass("primary", "lg")} mt-10`}>
      <ArrowLeft size={18} className="transition-transform duration-200 group-hover:-translate-x-[3px]" />
      {action.label}
    </Link>
  </section>
);

/** Loading placeholder shaped like a header + two-column page. */
export const ClientPageSkeleton: React.FC<{ label: string }> = ({ label }) => (
  <div role="status" aria-label={label}>
    <Skeleton className="h-3 w-32 !rounded-full" />
    <Skeleton className="mt-5 h-12 w-2/3 max-w-md" />
    <Skeleton className="mt-4 h-4 w-1/3 max-w-xs !rounded-full" />
    <div className="mt-10 grid gap-5 lg:grid-cols-5">
      <Skeleton className="h-72 lg:col-span-3" />
      <Skeleton className="h-72 lg:col-span-2" />
    </div>
    <span className="sr-only">{label}</span>
  </div>
);
