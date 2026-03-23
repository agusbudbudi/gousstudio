import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2, ChevronUp, ChevronDown, Tag, Clock, RefreshCw } from "lucide-react";

const formatPrice = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const PricelistList = ({ items, searchQuery, onEdit, onDelete, onReorder }) => {
  const filteredItems = items.filter(
    (item) =>
      item.servicename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSearching = searchQuery.length > 0;

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16 text-slate-300">
        <Tag className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium text-slate-400">
          {isSearching ? "Tidak ada paket ditemukan." : "Belum ada paket harga. Klik Tambah untuk memulai."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
      {filteredItems.map((item, index) => {
        const discount =
          item.retailprice > 0
            ? Math.round((1 - item.finalprice / item.retailprice) * 100)
            : 0;
        const itemKey = item.id || item.slug || index;

        return (
          <motion.div
            key={itemKey}
            layoutId={String(itemKey)}
            layout
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="group flex items-start gap-4 bg-white border border-slate-200 hover:border-brand-500/30 rounded-xl p-4 transition-colors hover:shadow-sm"
          >
            {/* Reorder */}
            {!isSearching && (
              <div className="flex flex-col items-center gap-0.5 min-w-[32px] border-r border-slate-50 pr-3 pt-1">
                <button
                  disabled={index === 0}
                  onClick={() => onReorder(index, "up")}
                  className={`p-1.5 rounded-lg border transition-all ${index === 0 ? "text-slate-100 border-transparent cursor-not-allowed" : "text-slate-300 border-transparent hover:border-brand-500/50 hover:text-brand-500 hover:scale-110 active:scale-95 cursor-pointer"}`}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold text-slate-300 font-mono">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <button
                  disabled={index === items.length - 1}
                  onClick={() => onReorder(index, "down")}
                  className={`p-1.5 rounded-lg border transition-all ${index === items.length - 1 ? "text-slate-100 border-transparent cursor-not-allowed" : "text-slate-300 border-transparent hover:border-brand-500/50 hover:text-brand-500 hover:scale-110 active:scale-95 cursor-pointer"}`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item, index)}>
              <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-500 bg-brand-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {discount > 0 && (
                      <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        -{discount}% OFF
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-brand-500 transition-colors leading-tight">
                    {item.servicename || "Untitled"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-300 line-through">{formatPrice(item.retailprice)}</p>
                  <p className="text-sm font-extrabold text-brand-500">{formatPrice(item.finalprice)}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  {item.duration} hari
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <RefreshCw className="w-3 h-3" />
                  {item.isrevisionunlimited ? "Unlimited revisi" : `${item.totalrevision}x revisi`}
                </span>
                <span className="text-[10px] text-slate-300">
                  {(item.deliverables || []).length} deliverables
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 pl-3 border-l border-slate-50 self-center">
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

export default PricelistList;
