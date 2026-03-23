import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2, ChevronUp, ChevronDown, Star, ExternalLink, RefreshCw, CreditCard, Zap } from "lucide-react";

const FastworkList = ({ items, searchQuery, onEdit, onDelete, onReorder }) => {
  const filteredItems = items.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSearching = searchQuery.length > 0;

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16 text-slate-300">
        <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium text-slate-400">
          {isSearching ? "Tidak ada item ditemukan." : "Belum ada Fastwork item. Klik Tambah untuk memulai."}
        </p>
      </div>
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
              className="group flex items-center gap-4 bg-white border border-slate-200 hover:border-brand-500/30 rounded-xl p-3 transition-colors hover:shadow-sm"
            >
              {/* Reorder */}
              {!isSearching && (
                <div className="flex flex-col items-center gap-0.5 min-w-[32px] border-r border-slate-50 pr-3">
                  <button
                    disabled={index === 0}
                    onClick={() => onReorder(index, "up")}
                    className={`p-1.5 rounded-lg border transition-all ${index === 0 ? "text-slate-100 border-transparent cursor-not-allowed" : "text-slate-300 border-transparent hover:border-brand-500/50 hover:text-brand-500 hover:scale-105 active:scale-95 cursor-pointer"}`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-300 font-mono">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <button
                    disabled={index === items.length - 1}
                    onClick={() => onReorder(index, "down")}
                    className={`p-1.5 rounded-lg border transition-all ${index === items.length - 1 ? "text-slate-100 border-transparent cursor-not-allowed" : "text-slate-300 border-transparent hover:border-brand-500/50 hover:text-brand-500 hover:scale-105 active:scale-95 cursor-pointer"}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Thumbnail */}
              <div
                className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 cursor-pointer hover:border-brand-500/50 transition-colors"
                onClick={() => onEdit(item, index)}
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-slate-200" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item, index)}>
                <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-brand-500 transition-colors">
                  {item.title || "Untitled"}
                </h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {item.rating?.toFixed(1)}
                  </span>
                  {item.rehire && (
                    <span className="flex items-center gap-1 text-[10px] text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded font-bold">
                      <RefreshCw className="w-3 h-3" />
                      Rehire
                    </span>
                  )}
                  {item.installment && (
                    <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold">
                      <CreditCard className="w-3 h-3" />
                      Cicilan
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pl-3 border-l border-slate-50">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded transition-all cursor-pointer"
                    title="Lihat di Fastwork"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => onEdit(item, index)}
                  className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded transition-all cursor-pointer"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FastworkList;
