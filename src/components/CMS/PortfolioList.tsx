import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ImageOff,
  LayoutGrid,
} from "lucide-react";
import { resolveImageUrl } from "../../utils/imageResolver";
import CMSButton from "./Common/CMSButton";
import CMSEmptyState from "./Common/CMSEmptyState";
import CMSSkeleton from "./Common/CMSSkeleton";

import { PortfolioItem, PricelistItem } from "../../types";

// An item plus its position in its own group list (source of truth for edit/delete/reorder)
export interface PortfolioListEntry {
  item: PortfolioItem;
  group: string;
  index: number;
}

interface PortfolioListProps {
  entries: PortfolioListEntry[];
  searchQuery: string;
  // Reordering is per group, so it's disabled in the "all services" view
  canReorder: boolean;
  groupLabels?: Record<string, string>;
  onEdit: (item: PortfolioItem, group: string, index: number) => void;
  onDelete: (group: string, index: number) => void;
  onReorder: (
    group: string,
    index: number,
    direction: "up" | "down",
  ) => void;
  pricelists: PricelistItem[];
}

const PortfolioList: React.FC<PortfolioListProps> = ({
  entries,
  searchQuery,
  canReorder,
  groupLabels,
  onEdit,
  onDelete,
  onReorder,
  pricelists,
}) => {
  const filteredEntries = entries.filter(
    ({ item }) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const isSearching = searchQuery.length > 0;

  if (filteredEntries.length === 0) {
    return (
      <CMSEmptyState
        icon={LayoutGrid}
        title={isSearching ? "Tidak ada hasil ditemukan" : "Belum ada Portfolio"}
        description={isSearching ? "Coba gunakan kata kunci pencarian yang lain." : "Klik tombol 'Tambah' untuk menambahkan portfolio pertama."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {filteredEntries.map(({ item, group, index }, position) => {
          const imageUrl = resolveImageUrl(item, "w200");
          const itemKey = item.id || `${group}-${index}-${item.title}`;
          const groupSize = entries.filter((e) => e.group === group).length;

          return (
            <motion.div
              key={itemKey}
              layoutId={String(itemKey)}
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group flex items-center gap-4 bg-white border border-ink/10 hover:border-violet-600/30 rounded-[10px] p-3 transition-colors"
            >
              {/* Reorder Controls - Only show in a single group, when not searching */}
              {canReorder && !isSearching && (
                <div className="flex flex-col items-center gap-0.5 min-w-[32px] border-r border-ink/[0.04] pr-3">
                  <button
                    disabled={index === 0}
                    onClick={() => onReorder(group, index, "up")}
                    className={`p-1.5 rounded-[10px] border transition-all ${
                      index === 0
                        ? "text-ink/10 border-transparent cursor-not-allowed"
                        : "text-ink/30 border-transparent hover:border-violet-600/50 hover:text-violet-600 hover:scale-105 active:scale-95 cursor-pointer"
                    }`}
                    aria-label="Pindahkan ke atas" title="Pindahkan ke atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-ink/30 font-mono">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <button
                    disabled={index === groupSize - 1}
                    onClick={() => onReorder(group, index, "down")}
                    className={`p-1.5 rounded-[10px] border transition-all ${
                      index === groupSize - 1
                        ? "text-ink/10 border-transparent cursor-not-allowed"
                        : "text-ink/30 border-transparent hover:border-violet-600/50 hover:text-violet-600 hover:scale-110 active:scale-95 cursor-pointer"
                    }`}
                    aria-label="Pindahkan ke bawah" title="Pindahkan ke bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
              {!canReorder && (
                <span className="min-w-[24px] text-center text-[10px] font-bold text-ink/30 font-mono">
                  {(position + 1).toString().padStart(2, "0")}
                </span>
              )}

              {/* Thumbnail Preview */}
              <div
                className="w-16 h-16 rounded-[10px] bg-paper border border-ink/[0.06] overflow-hidden flex-shrink-0 cursor-pointer hover:border-violet-600/50 transition-colors relative"
                onClick={() => onEdit(item, group, index)}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      if (target.nextSibling) {
                        (target.nextSibling as HTMLElement).style.display =
                          "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`absolute inset-0 items-center justify-center text-ink/20 ${imageUrl ? "hidden" : "flex"}`}
                >
                  <ImageOff className="w-5 h-5 opacity-40 text-red-300" />
                </div>
              </div>

              {/* Item Content */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onEdit(item, group, index)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-ink truncate group-hover:text-violet-600 transition-colors">
                    {item.title || "Untitled Project"}
                  </h3>
                  {groupLabels && (
                    <span className="gs-label text-[10px] text-muted bg-paper border border-ink/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {groupLabels[group] || group}
                    </span>
                  )}
                  {item.role && (
                    <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                      {item.role}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted mt-0.5 truncate opacity-80">
                  {item.description || "No description."}
                </p>
                {item.pricelist_id && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {(() => {
                      const pl = pricelists.find(p => String(p.id) === String(item.pricelist_id));
                      return pl ? (
                        <span className="text-[10px] font-semibold text-muted bg-paper border border-ink/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          Linked to: {pl.servicename}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          Linked Pricelist Missing
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Tags - Hidden on small screens to keep list compact */}
              <div className="hidden lg:flex items-center gap-1.5 flex-wrap max-w-[200px]">
                {(item.tags || []).slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-paper border border-ink/10 rounded-full text-[10px] text-muted font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pl-3 border-l border-ink/[0.04]">
                {item.linkurl && (
                  <a
                    href={item.linkurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-ink/45 hover:text-ink hover:bg-ink/[0.05] rounded-full transition-colors cursor-pointer"
                    aria-label="Lihat Aset" title="Lihat Aset"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <CMSButton
                  variant="ghost"
                  onClick={() => onEdit(item, group, index)}
                  icon={Edit3}
                  iconSize={16}
                  aria-label="Edit" title="Edit"
                  className="!p-2 text-ink/45 hover:text-violet-600 hover:bg-violet-50 hover:border-violet-600/50"
                />
                <CMSButton
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(group, index);
                  }}
                  icon={Trash2}
                  iconSize={16}
                  aria-label="Hapus" title="Hapus"
                  className="!p-2"
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Fixed varied widths so rows don't look stamped (and stay stable across renders)
const SKELETON_TITLE_WIDTHS = ["w-48", "w-64", "w-40", "w-56", "w-44", "w-60"];
const SKELETON_DESC_WIDTHS = ["w-3/4", "w-2/3", "w-4/5", "w-1/2", "w-3/5", "w-2/3"];

// Loading placeholder with the same dimensions as a real row (no layout shift on load)
export const PortfolioListSkeleton: React.FC<{ rows?: number; showReorder?: boolean }> = ({
  rows = 6,
  showReorder = true,
}) => (
  <div className="flex flex-col gap-3" role="status" aria-label="Memuat portfolio">
    {Array.from({ length: rows }, (_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 bg-white border border-ink/10 rounded-[10px] p-3"
      >
        {showReorder ? (
          <div className="flex flex-col items-center gap-2 min-w-[32px] border-r border-ink/[0.04] pr-3 py-1">
            <CMSSkeleton className="w-4 h-4" />
            <CMSSkeleton className="w-4 h-2.5" />
            <CMSSkeleton className="w-4 h-4" />
          </div>
        ) : (
          <CMSSkeleton className="min-w-[24px] w-6 h-2.5" />
        )}
        <CMSSkeleton className="w-16 h-16 !rounded-[10px] flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <CMSSkeleton className={`h-3.5 max-w-full ${SKELETON_TITLE_WIDTHS[i % 6]}`} />
          <CMSSkeleton className={`h-2.5 ${SKELETON_DESC_WIDTHS[i % 6]}`} />
        </div>
        <div className="hidden lg:flex items-center gap-1.5">
          <CMSSkeleton className="w-14 h-4" />
          <CMSSkeleton className="w-10 h-4" />
        </div>
        <div className="flex items-center gap-1 pl-3 border-l border-ink/[0.04]">
          <CMSSkeleton className="w-8 h-8" />
          <CMSSkeleton className="w-8 h-8" />
        </div>
      </div>
    ))}
    <span className="sr-only">Memuat data portfolio...</span>
  </div>
);

export default PortfolioList;
