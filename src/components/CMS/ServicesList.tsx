import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
} from "lucide-react";
import { ServiceItem } from "../../types";
import CMSButton from "./Common/CMSButton";
import CMSEmptyState from "./Common/CMSEmptyState";

// Map icon name string → Lucide component
export interface ServiceStats {
  packages: number; // all linked packages
  publicPackages: number; // shown to customers
  minPrice: number | null; // cheapest public package
  works: number; // portfolio items via their package
}

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

interface ServicesListProps {
  items: ServiceItem[];
  // service id -> linked data; omitted until pricelists.service_id exists
  stats?: Record<string, ServiceStats>;
  searchQuery: string;
  onEdit: (item: ServiceItem, index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (index: number, direction: "up" | "down") => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ items, stats, searchQuery, onEdit, onDelete, onReorder }) => {
  const filteredItems = items.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSearching = searchQuery.length > 0;

  if (filteredItems.length === 0) {
    return (
      <CMSEmptyState
        icon={Layers}
        title={isSearching ? "Tidak ada hasil ditemukan" : "Belum ada Layanan"}
        description={isSearching ? "Coba gunakan kata kunci pencarian yang lain." : "Klik tombol 'Tambah' untuk menambahkan layanan pertama."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {filteredItems.map((item, index) => {
          const itemKey = item.id || item.slug || index;
          const stat = stats && item.id !== undefined ? stats[String(item.id)] : undefined;

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

              {/* Content */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item, index)}>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-ink truncate group-hover:text-violet-600 transition-colors">
                    {item.title || "Untitled"}
                  </h3>
                  <span className="gs-label text-[10px] text-ink/35">{item.slug}</span>
                </div>
                <p className="text-[11px] text-ink/45 truncate">{item.description}</p>
              </div>

              {/* Linked packages / starting price / works */}
              <div className="hidden md:flex flex-col items-end gap-1 shrink-0 text-right">
                {stat ? (
                  stat.packages > 0 ? (
                    <>
                      <span className="text-xs font-semibold text-ink">
                        {stat.minPrice !== null ? `Mulai ${formatIDR(stat.minPrice)}` : "Belum ada paket publik"}
                      </span>
                      <span className="text-[10px] text-muted">
                        {stat.publicPackages}/{stat.packages} paket publik · {stat.works} karya
                      </span>
                    </>
                  ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      Belum ada paket
                    </span>
                  )
                ) : (
                  <span className="text-[10px] text-ink/30">{(item.included || []).length} deliverables</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pl-3 border-l border-ink/[0.04]">
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

export default ServicesList;
