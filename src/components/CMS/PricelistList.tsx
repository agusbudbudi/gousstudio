import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  Tag,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Tags,
} from "lucide-react";
import CMSButton from "./Common/CMSButton";
import CMSBadge from "./Common/CMSBadge";
import CMSEmptyState from "./Common/CMSEmptyState";

import { PricelistItem } from "../../types";

const formatPrice = (n: number | undefined) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);

interface PricelistListProps {
  items: PricelistItem[];
  filteredItems: PricelistItem[];
  onEdit: (item: PricelistItem, index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (index: number, direction: "up" | "down") => void;
  onToggleVisibility: (index: number) => void;
  isSearchingOrFiltering: boolean;
}

const PricelistList: React.FC<PricelistListProps> = ({
  items,
  filteredItems,
  onEdit,
  onDelete,
  onReorder,
  onToggleVisibility,
  isSearchingOrFiltering,
}) => {

  if (filteredItems.length === 0) {
    return (
      <CMSEmptyState
        icon={Tags}
        title={isSearchingOrFiltering ? "Tidak ada paket ditemukan" : "Belum ada paket harga"}
        description={isSearchingOrFiltering ? "Coba gunakan kata kunci pencarian yang lain." : "Klik tombol 'Tambah' untuk membuat paket harga pertama."}
        containerClassName="py-16"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {filteredItems.map((item, index) => {
          const retail = item.retailprice || 0;
          const final = item.finalprice || 0;
          const discount =
            retail > 0 ? Math.round((1 - final / retail) * 100) : 0;
          const itemKey = item.id || (item as any).slug || index;

          return (
            <motion.div
              key={itemKey}
              layoutId={String(itemKey)}
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group flex items-start gap-4 bg-white border border-slate-200 hover:border-brand-500/30 rounded-lg p-4 transition-colors"
            >
              {/* Reorder */}
              {!isSearchingOrFiltering && (
                <div className="flex flex-col items-center gap-0.5 min-w-[32px] border-r border-slate-50 pr-3 pt-1">
                  <button
                    disabled={index === 0}
                    onClick={() => onReorder(index, "up")}
                    className={`p-1.5 rounded-lg border transition-all ${index === 0 ? "text-slate-100 border-transparent cursor-not-allowed" : "text-slate-300 border-transparent hover:border-brand-500/50 hover:text-brand-500 hover:scale-110 active:scale-95 cursor-pointer"}`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
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
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onEdit(item, index)}
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <CMSBadge variant="brand">{item.category}</CMSBadge>
                      {discount > 0 && (
                        <CMSBadge className="!bg-green-50 !text-green-700 !border-green-200">
                          -{discount}% OFF
                        </CMSBadge>
                      )}
                      {item.isShowToCustomer ? (
                        <CMSBadge className="!bg-emerald-50 !text-emerald-700 !border-emerald-200 !flex !items-center !gap-1">
                          <Eye size={10} />
                          Publik
                        </CMSBadge>
                      ) : (
                        <CMSBadge className="!bg-slate-100 !text-slate-400 !border-slate-200 !flex !items-center !gap-1">
                          <EyeOff size={10} />
                          Hidden
                        </CMSBadge>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-500 transition-colors leading-tight">
                      {item.servicename || "Untitled"}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 line-through">
                      {formatPrice(item.retailprice)}
                    </p>
                    <p className="text-sm font-bold text-brand-500">
                      {formatPrice(item.finalprice)}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {item.duration} hari
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <RefreshCw className="w-3 h-3" />
                    {item.isrevisionunlimited
                      ? "Unlimited revisi"
                      : `${item.totalrevision}x revisi`}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {(item.deliverables || []).length} deliverables
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-1 pl-3 border-l border-slate-50 self-center">
                {/* Visibility Quick Toggle */}
                <button
                  title={
                    item.isShowToCustomer
                      ? "Sembunyikan dari customer"
                      : "Tampilkan ke customer"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(index);
                  }}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    item.isShowToCustomer
                      ? "text-emerald-500 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                      : "text-slate-400 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                >
                  {item.isShowToCustomer ? (
                    <Eye size={16} />
                  ) : (
                    <EyeOff size={16} />
                  )}
                </button>
                <CMSButton
                  variant="ghost"
                  onClick={() => onEdit(item, index)}
                  icon={Edit3}
                  iconSize={16}
                  title="Edit"
                  className="!p-2"
                />
                <CMSButton
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(index);
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

export default PricelistList;
