import React from "react";
import CMSSkeleton from "./CMSSkeleton";

interface CMSTableSkeletonProps {
  rows?: number;
  columns?: number;
  label?: string;
}

// Fixed varied widths so rows don't look stamped (and stay stable across renders)
const CELL_WIDTHS = ["w-2/3", "w-1/2", "w-3/4", "w-2/5", "w-3/5"];

// Loading placeholder shaped like CMSTableContainer (same radius, header band and row height)
const CMSTableSkeleton: React.FC<CMSTableSkeletonProps> = ({
  rows = 8,
  columns = 5,
  label = "Memuat data...",
}) => (
  <div
    role="status"
    aria-label={label}
    className="overflow-hidden rounded-[16px] border border-ink/10 bg-white"
  >
    <div className="flex gap-6 border-b border-ink/10 bg-paper px-6 py-3.5">
      {Array.from({ length: columns }, (_, c) => (
        <CMSSkeleton key={c} className="h-2.5 flex-1 max-w-[96px]" />
      ))}
    </div>
    {Array.from({ length: rows }, (_, r) => (
      <div key={r} className="flex items-center gap-6 border-b border-ink/[0.06] px-6 py-4 last:border-0">
        {Array.from({ length: columns }, (_, c) => (
          <div key={c} className="flex-1 space-y-2">
            <CMSSkeleton className={`h-3 ${CELL_WIDTHS[(r + c) % CELL_WIDTHS.length]}`} />
            {c === 0 && <CMSSkeleton className="h-2.5 w-1/3" />}
          </div>
        ))}
      </div>
    ))}
    <span className="sr-only">{label}</span>
  </div>
);

export default CMSTableSkeleton;
