import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ImageOff,
} from "lucide-react";
import { resolveImageUrl } from "../../utils/imageResolver";
import CMSButton from "./Common/CMSButton";

import { PortfolioItem, PricelistItem } from "../../types";

interface PortfolioListProps {
  items: PortfolioItem[];
  category: string;
  searchQuery: string;
  onEdit: (item: PortfolioItem, index: number) => void;
  onDelete: (category: string, index: number) => void;
  onReorder: (
    category: string,
    index: number,
    direction: "up" | "down",
  ) => void;
  pricelists: PricelistItem[];
}

const PortfolioList: React.FC<PortfolioListProps> = ({
  items,
  category,
  searchQuery,
  onEdit,
  onDelete,
  onReorder,
  pricelists,
}) => {
  const filteredItems = items.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const isSearching = searchQuery.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {filteredItems.map((item, index) => {
          const imageUrl = resolveImageUrl(item, "w200");
          const itemKey = item.id || item.title || index;

          return (
            <motion.div
              key={itemKey}
              layoutId={String(itemKey)}
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group flex items-center gap-4 bg-white border border-slate-200 hover:border-brand-500/30 rounded-lg p-3 transition-colors"
            >
              {/* Reorder Controls - Only show if not searching */}
              {!isSearching && (
                <div className="flex flex-col items-center gap-0.5 min-w-[32px] border-r border-slate-50 pr-3">
                  <button
                    disabled={index === 0}
                    onClick={() => onReorder(category, index, "up")}
                    className={`p-1.5 rounded-lg border transition-all ${
                      index === 0
                        ? "text-slate-100 border-transparent cursor-not-allowed"
                        : "text-slate-300 border-transparent hover:border-brand-500/50 hover:text-brand-500 hover:scale-105 active:scale-95 cursor-pointer"
                    }`}
                    title="Pindahkan ke atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-300 font-mono">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <button
                    disabled={index === items.length - 1}
                    onClick={() => onReorder(category, index, "down")}
                    className={`p-1.5 rounded-lg border transition-all ${
                      index === items.length - 1
                        ? "text-slate-100 border-transparent cursor-not-allowed"
                        : "text-slate-300 border-transparent hover:border-brand-500/50 hover:text-brand-500 hover:scale-110 active:scale-95 cursor-pointer"
                    }`}
                    title="Pindahkan ke bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Thumbnail Preview */}
              <div
                className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 cursor-pointer hover:border-brand-500/50 transition-colors relative"
                onClick={() => onEdit(item, index)}
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
                  className={`absolute inset-0 items-center justify-center text-slate-200 ${imageUrl ? "hidden" : "flex"}`}
                >
                  <ImageOff className="w-5 h-5 opacity-40 text-red-300" />
                </div>
              </div>

              {/* Item Content */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onEdit(item, index)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-brand-500 transition-colors">
                    {item.title || "Untitled Project"}
                  </h3>
                  {item.role && (
                    <span className="text-[10px] font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded">
                      {item.role}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate opacity-80">
                  {item.description || "No description."}
                </p>
                {item.pricelist_id && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {(() => {
                      const pl = pricelists.find(p => String(p.id) === String(item.pricelist_id));
                      return pl ? (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                          Linked to: {pl.servicename}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-300 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
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
                    className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-500 font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pl-3 border-l border-slate-50">
                {item.linkurl && (
                  <a
                    href={item.linkurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded transition-all cursor-pointer"
                    title="Lihat Aset"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <CMSButton
                  variant="ghost"
                  onClick={() => onEdit(item, index)}
                  icon={Edit3}
                  iconSize={16}
                  title="Edit"
                  className="!p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 hover:border-brand-500/50"
                />
                <CMSButton
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(category, index);
                  }}
                  icon={Trash2}
                  iconSize={16}
                  title="Hapus"
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

export default PortfolioList;
