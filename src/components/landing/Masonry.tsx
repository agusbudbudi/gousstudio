import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

// Column count per Tailwind breakpoint: base 2, md 3, lg 4.
const BREAKPOINTS: [query: string, cols: number][] = [
  ["(min-width: 1024px)", 4],
  ["(min-width: 768px)", 3],
];

const currentColumns = () =>
  typeof window === "undefined"
    ? 2
    : BREAKPOINTS.find(([q]) => window.matchMedia(q).matches)?.[1] ?? 2;

export function useColumnCount() {
  const [cols, setCols] = useState(currentColumns);
  useEffect(() => {
    const mqls = BREAKPOINTS.map(([q]) => window.matchMedia(q));
    const update = () => setCols(currentColumns());
    mqls.forEach((m) => m.addEventListener("change", update));
    return () => mqls.forEach((m) => m.removeEventListener("change", update));
  }, []);
  return cols;
}

interface MasonryProps<T> {
  items: T[];
  /** Must return a keyed element (e.g. <motion.li key=…>). `index` is the item's position in `items`. */
  renderItem: (item: T, index: number) => React.ReactElement;
  className?: string;
}

/**
 * Masonry that reads left → right: item i goes to column i % cols, so the first
 * row is items 0..cols-1. (CSS `columns` would fill top → bottom instead.)
 * Appending items never moves existing ones to another column.
 */
export function Masonry<T>({ items, renderItem, className = "" }: MasonryProps<T>) {
  const cols = useColumnCount();
  const columns: { item: T; index: number }[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, index) => columns[index % cols].push({ item, index }));

  return (
    <div className={`flex items-start gap-3 sm:gap-5 ${className}`}>
      {columns.map((col, c) => (
        <ul key={c} className="flex min-w-0 flex-1 flex-col">
          <AnimatePresence initial={false}>
            {col.map(({ item, index }) => renderItem(item, index))}
          </AnimatePresence>
        </ul>
      ))}
    </div>
  );
}
