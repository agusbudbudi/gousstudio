import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3, Trash2, ChevronUp, ChevronDown,
  Shapes, Image, Instagram, TrendingUp, Star, Zap, Palette,
  Monitor, ShoppingBag, FileText, Briefcase, Megaphone,
  Globe, Camera, Video, PenTool, Layers, Award
} from "lucide-react";

// Map icon name string → Lucide component
const ICON_MAP = {
  Image, Shapes, Instagram, TrendingUp, Star, Zap, Palette,
  Monitor, ShoppingBag, FileText, Briefcase, Megaphone,
  Globe, Camera, Video, PenTool, Layers, Award
};

const COLOR_MAP = {
  brand: "bg-purple-100 text-purple-700 border-purple-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
};

const COLOR_DOT = {
  brand: "bg-purple-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  teal: "bg-teal-500",
};

const ServicesList = ({ items, searchQuery, onEdit, onDelete, onReorder }) => {
  const filteredItems = items.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSearching = searchQuery.length > 0;

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16">
        <Shapes className="w-8 h-8 mx-auto mb-3 opacity-20 text-slate-300" />
        <p className="text-sm font-medium text-slate-400">
          {isSearching ? "Tidak ada layanan ditemukan." : "Belum ada layanan. Klik Tambah untuk memulai."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {filteredItems.map((item, index) => {
          const itemKey = item.id || item.slug || index;
          const colorClass = COLOR_MAP[item.color] || COLOR_MAP.brand;
          const dotClass = COLOR_DOT[item.color] || COLOR_DOT.brand;
          const IconComponent = ICON_MAP[item.icon] || Shapes;

          return (
            <motion.div
              key={itemKey}
              layoutId={String(itemKey)}
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group flex items-center gap-4 bg-white border border-slate-200 hover:border-brand-500/30 rounded-lg p-3 transition-colors hover:shadow-sm"
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

              {/* Color dot + Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${colorClass}`}>
                <IconComponent className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item, index)}>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-extrabold text-slate-900 truncate group-hover:text-brand-500 transition-colors">
                    {item.title || "Untitled"}
                  </h3>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                </div>
                <p className="text-[11px] text-slate-400 truncate">{item.description}</p>
              </div>

              {/* Category + features count */}
              <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${colorClass}`}>
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-300">
                  {(item.included || []).length} fitur
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pl-3 border-l border-slate-50">
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

export default ServicesList;
