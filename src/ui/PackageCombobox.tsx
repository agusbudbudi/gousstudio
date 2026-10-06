import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Clock, Search } from "lucide-react";
import { formatRupiah, PackageItem } from "../components/landing/useLandingData";
import { parsePackageName } from "../components/landing/PackageCard";

export const CUSTOM_PACKAGE = "Custom Package";

type Option = {
  value: string;
  name: string;
  category: string;
  price?: number;
  duration?: number;
};

// Searchable package picker (ARIA combobox + listbox), grouped by category.
const PackageCombobox: React.FC<{
  id: string;
  packages: PackageItem[];
  value: string;
  onSelect: (value: string) => void;
  loading?: boolean;
  invalid?: boolean;
  describedBy?: string;
}> = ({ id, packages, value, onSelect, loading = false, invalid = false, describedBy }) => {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const options = useMemo<Option[]>(
    () => [
      { value: CUSTOM_PACKAGE, name: "Custom Package", category: "Lainnya" },
      // Group by category (first-appearance order) so each header renders once.
      ...[...packages]
        .sort((a, b) => {
          const order = Array.from(new Set(packages.map((p) => p.category)));
          return order.indexOf(a.category) - order.indexOf(b.category);
        })
        .map((p) => ({
        value: p.serviceName,
        name: parsePackageName(p.serviceName).name,
        category: p.category,
        price: p.finalPrice,
        duration: p.duration,
      })),
    ],
    [packages],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => `${o.name} ${o.category}`.toLowerCase().includes(q));
  }, [options, query]);

  const selected = options.find((o) => o.value === value);
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const openList = () => {
    setOpen(true);
    setQuery("");
    const idx = options.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : 0);
  };

  const choose = (opt: Option) => {
    onSelect(opt.value);
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the active option visible while navigating with the keyboard.
  useEffect(() => {
    if (!open) return;
    document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) return openList();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape" && open) {
      // Close only the list, not the whole modal.
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  // Render with category headers while keeping a flat index for keyboard navigation.
  let lastCategory = "";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[active] ? optionId(active) : undefined}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          autoComplete="off"
          disabled={loading}
          value={open ? query : selected?.name || ""}
          placeholder={loading ? "Memuat paket…" : open && selected ? selected.name : "Cari paket desain…"}
          onFocus={openList}
          onClick={() => !open && openList()}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            if (!open) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={`h-12 w-full rounded-2xl border bg-[#fff] pl-11 pr-11 text-[15px] font-medium text-ink placeholder:font-normal placeholder:text-muted/80 transition-colors focus:outline-none focus:ring-4 disabled:opacity-60 ${
            invalid
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
              : "border-ink/15 focus:border-violet-600 focus:ring-violet-600/10"
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => (open ? setOpen(false) : inputRef.current?.focus())}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted"
        >
          <ChevronDown size={18} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {selected && !open && (selected.price || selected.duration) ? (
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {selected.price ? <span className="font-semibold text-violet-700">{formatRupiah(selected.price)}</span> : null}
          {selected.duration ? (
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {selected.duration} hari kerja
            </span>
          ) : null}
          <span>· {selected.category}</span>
        </p>
      ) : selected?.value === CUSTOM_PACKAGE && !open ? (
        <p className="mt-2 text-sm text-muted">Harga & timeline didiskusikan sesuai kebutuhan.</p>
      ) : null}

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Daftar paket"
          className="absolute left-0 right-0 top-[52px] z-20 max-h-[300px] overflow-y-auto overscroll-contain rounded-2xl border border-ink/10 bg-[#fff] py-2 shadow-[0_20px_50px_-15px_rgba(11,10,18,0.35)]"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted">
              Paket "{query}" tidak ditemukan. Pilih <span className="font-semibold text-ink">Custom Package</span> dan
              jelaskan di brief.
            </li>
          ) : (
            filtered.map((opt, i) => {
              const header = opt.category !== lastCategory ? opt.category : null;
              lastCategory = opt.category;
              const isSelected = opt.value === value;
              return (
                <React.Fragment key={opt.value}>
                  {header && (
                    <li role="presentation" className="gs-label px-4 pb-1.5 pt-3 text-muted first:pt-1.5">
                      {header}
                    </li>
                  )}
                  <li
                    id={optionId(i)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(opt)}
                    onMouseEnter={() => setActive(i)}
                    className={`mx-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${
                      i === active ? "bg-violet-50" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className={`block truncate text-[15px] ${isSelected ? "font-semibold text-violet-700" : "font-medium text-ink"}`}>
                        {opt.name}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-muted">
                        {opt.price ? formatRupiah(opt.price) : "Harga sesuai kebutuhan"}
                        {opt.duration ? ` · ${opt.duration} hari` : ""}
                      </span>
                    </span>
                    {isSelected && <Check size={18} className="shrink-0 text-violet-600" />}
                  </li>
                </React.Fragment>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default PackageCombobox;
