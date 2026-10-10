import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
 * Date helpers — values are "YYYY-MM-DD" in local time
 * ────────────────────────────────────────────────────────────── */

const pad = (n: number) => String(n).padStart(2, "0");

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseISODate = (value?: string | null): Date | null => {
  const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
};

const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

const addMonths = (d: Date, months: number) => {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay));
};

const sameDay = (a: Date | null, b: Date | null) => Boolean(a && b) && toISODate(a!) === toISODate(b!);

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const monthLabel = (d: Date) => d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

const displayLabel = (d: Date) =>
  d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** 6×7 grid of dates starting on the Monday on/before the 1st of the month. */
const buildGrid = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
};

/* ──────────────────────────────────────────────────────────────
 * DatePicker — custom calendar popover (LP + CMS)
 * ────────────────────────────────────────────────────────────── */

export interface DatePickerProps {
  id?: string;
  value?: string | null;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  describedBy?: string;
  /** Classes for the trigger button (size, radius, border, font). */
  className?: string;
  /** Classes for the popover panel radius/shadow tweaks. */
  panelClassName?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id: idProp,
  value,
  onChange,
  min,
  max,
  placeholder = "Pilih tanggal",
  invalid = false,
  disabled = false,
  clearable = false,
  describedBy,
  className = "",
  panelClassName = "",
}) => {
  const autoId = useId();
  const id = idProp ?? autoId;
  const dialogId = `${id}-calendar`;
  const labelId = `${id}-month`;

  const selected = useMemo(() => parseISODate(value), [value]);
  const minDate = useMemo(() => parseISODate(min), [min]);
  const maxDate = useMemo(() => parseISODate(max), [max]);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState<Date>(selected ?? minDate ?? today);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const isDisabled = (d: Date) =>
    Boolean((minDate && d < minDate) || (maxDate && d > maxDate));

  const clamp = (d: Date) => {
    if (minDate && d < minDate) return minDate;
    if (maxDate && d > maxDate) return maxDate;
    return d;
  };

  // Reset focus to selected/today when opening
  useEffect(() => {
    if (!open) return;
    setFocused(clamp(selected ?? today));
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Move DOM focus with the focused day
  useEffect(() => {
    if (!open) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${toISODate(focused)}"]`)?.focus();
  }, [focused, open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const choose = (d: Date) => {
    if (isDisabled(d)) return;
    onChange(toISODate(d));
    close();
  };

  const grid = useMemo(() => buildGrid(focused), [focused.getFullYear(), focused.getMonth()]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevMonthEnd = new Date(focused.getFullYear(), focused.getMonth(), 0);
  const nextMonthStart = new Date(focused.getFullYear(), focused.getMonth() + 1, 1);
  const canPrev = !minDate || prevMonthEnd >= minDate;
  const canNext = !maxDate || nextMonthStart <= maxDate;

  const handleGridKey = (e: React.KeyboardEvent) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -((focused.getDay() + 6) % 7)),
      End: () => addDays(focused, 6 - ((focused.getDay() + 6) % 7)),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    };
    if (moves[e.key]) {
      e.preventDefault();
      setFocused(clamp(moves[e.key]()));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(focused);
    }
  };

  const handlePanelKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };

  const todayDisabled = isDisabled(today);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`flex w-full items-center gap-3 border bg-[#fff] text-left transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
          invalid
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
            : `border-ink/15 hover:border-ink/30 focus:border-violet-600 focus:ring-violet-600/10 ${open ? "border-violet-600 ring-4 ring-violet-600/10" : ""}`
        } ${className}`}
      >
        <Calendar size={16} className={`shrink-0 transition-colors ${open ? "text-violet-600" : "text-ink/40"}`} />
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-ink" : "font-normal text-ink/40"}`}>
          {selected ? displayLabel(selected) : placeholder}
        </span>
      </button>

      {open && !disabled && (
        <div
          ref={panelRef}
          id={dialogId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={labelId}
          onKeyDown={handlePanelKey}
          className={`cms-pop-in absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] max-w-[calc(100vw-32px)] rounded-2xl border border-ink/10 bg-[#fff] p-3 shadow-[0_20px_50px_-15px_rgba(11,10,18,0.35)] ${panelClassName}`}
        >
          {/* Header */}
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={() => setFocused(clamp(addMonths(focused, -1)))}
              disabled={!canPrev}
              aria-label="Bulan sebelumnya"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <p id={labelId} aria-live="polite" className="text-sm font-semibold capitalize text-ink">
              {monthLabel(focused)}
            </p>
            <button
              type="button"
              onClick={() => setFocused(clamp(addMonths(focused, 1)))}
              disabled={!canNext}
              aria-label="Bulan berikutnya"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7" aria-hidden>
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                {w}
              </span>
            ))}
          </div>

          {/* Days */}
          <div ref={gridRef} role="grid" aria-labelledby={labelId} onKeyDown={handleGridKey} className="grid grid-cols-7 gap-y-0.5">
            {grid.map((d) => {
              const iso = toISODate(d);
              const outside = d.getMonth() !== focused.getMonth();
              const dis = isDisabled(d);
              const isSel = sameDay(d, selected);
              const isToday = sameDay(d, today);
              const isFocus = sameDay(d, focused);
              return (
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  data-date={iso}
                  tabIndex={isFocus ? 0 : -1}
                  disabled={dis}
                  aria-selected={isSel}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={displayLabel(d)}
                  onClick={() => choose(d)}
                  className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600/50 ${
                    isSel
                      ? "bg-violet-600 font-semibold text-white"
                      : dis
                        ? "cursor-not-allowed text-ink/20 line-through decoration-ink/20"
                        : outside
                          ? "text-ink/35 hover:bg-ink/[0.05]"
                          : "font-medium text-ink hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  {d.getDate()}
                  {isToday && !isSel && (
                    <span aria-hidden className="absolute bottom-1 h-1 w-1 rounded-full bg-violet-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-ink/[0.08] px-1 pt-2">
            {clearable && selected ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  close();
                }}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink/60 transition-colors hover:bg-ink/[0.06] hover:text-ink"
              >
                Hapus
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => choose(clamp(today))}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-50"
            >
              {todayDisabled ? "Tanggal terdekat" : "Hari ini"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
