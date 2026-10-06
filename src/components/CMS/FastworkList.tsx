import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2, ChevronUp, ChevronDown, Star, ExternalLink, RefreshCw, CreditCard, Zap, Target } from "lucide-react";
import CMSButton from "./Common/CMSButton";
import CMSEmptyState from "./Common/CMSEmptyState";

import { FastworkItem } from "../../types";

interface FastworkListProps {
  items: FastworkItem[];
  searchQuery: string;
  onEdit: (item: FastworkItem, index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (index: number, direction: "up" | "down") => void;
}

const FastworkList: React.FC<FastworkListProps> = ({ items, searchQuery, onEdit, onDelete, onReorder }) => {
  const filteredItems = items.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSearching = searchQuery.length > 0;

  if (filteredItems.length === 0) {
    return (
      <CMSEmptyState
        icon={Target}
        title={isSearching ? "Tidak ada hasil ditemukan" : "Belum ada item Fastwork"}
        description={isSearching ? "Coba gunakan kata kunci pencarian yang lain." : "Klik tombol 'Tambah' untuk menambahkan item pertama."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {filteredItems.map((item, index) => {
          const itemKey = item.id || item.url || index;
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
              {/* Reorder */}
              {!isSearching && (
                <div className="flex flex-col items-center gap-0.5 min-w-[32px] border-r border-ink/[0.04] pr-3">
                  <button
                    disabled={index === 0}
                    onClick={() => onReorder(index, "up")}
                    className={`p-1.5 rounded-[10px] border transition-all ${index === 0 ? "text-ink/10 border-transparent cursor-not-allowed" : "text-ink/30 border-transparent hover:border-violet-600/50 hover:text-violet-600 hover:scale-105 active:scale-95 cursor-pointer"}`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-ink/30 font-mono">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <button
                    disabled={index === items.length - 1}
                    onClick={() => onReorder(index, "down")}
                    className={`p-1.5 rounded-[10px] border transition-all ${index === items.length - 1 ? "text-ink/10 border-transparent cursor-not-allowed" : "text-ink/30 border-transparent hover:border-violet-600/50 hover:text-violet-600 hover:scale-105 active:scale-95 cursor-pointer"}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Thumbnail */}
              <div
                className="w-16 h-16 rounded-[10px] bg-paper border border-ink/[0.06] overflow-hidden flex-shrink-0 cursor-pointer hover:border-violet-600/50 transition-colors"
                onClick={() => onEdit(item, index)}
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-ink/20" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item, index)}>
                <h3 className="text-sm font-bold text-ink truncate group-hover:text-violet-600 transition-colors">
                  {item.title || "Untitled"}
                </h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {item.rating?.toFixed(1)}
                  </span>
                  {item.rehire && (
                    <span className="flex items-center gap-1 text-[10px] text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full font-semibold">
                      <RefreshCw className="w-3 h-3" />
                      Rehire
                    </span>
                  )}
                  {item.installment && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      <CreditCard className="w-3 h-3" />
                      Cicilan
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pl-3 border-l border-ink/[0.04]">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-ink/45 hover:text-ink hover:bg-ink/[0.05] rounded-full transition-colors cursor-pointer"
                    aria-label="Lihat di Fastwork" title="Lihat di Fastwork"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <CMSButton
                  variant="ghost"
                  onClick={() => onEdit(item, index)}
                  icon={Edit3}
                  iconSize={16}
                  aria-label="Edit" title="Edit"
                  className="!p-2"
                />
                <CMSButton
                  variant="danger"
                  onClick={(e) => { e.stopPropagation(); onDelete(index); }}
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

export default FastworkList;
