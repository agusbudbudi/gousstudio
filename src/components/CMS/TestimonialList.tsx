import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  User,
  Eye,
  EyeOff,
  MessageSquare,
} from "lucide-react";
import CMSButton from "./Common/CMSButton";
import CMSBadge from "./Common/CMSBadge";
import CMSEmptyState from "./Common/CMSEmptyState";

import { TestimonialItem } from "../../types";

interface TestimonialListProps {
  items: TestimonialItem[];
  onEdit: (item: TestimonialItem) => void;
  onDelete: (id: string) => void;
  onReorder: (index: number, direction: "up" | "down") => void;
  onToggleVisibility: (item: TestimonialItem) => void;
}

const TestimonialList: React.FC<TestimonialListProps> = ({
  items,
  onEdit,
  onDelete,
  onReorder,
  onToggleVisibility,
}) => {
  if (items.length === 0) {
    return (
      <CMSEmptyState
        icon={MessageSquare}
        title="Belum ada testimonial"
        description="Klik tombol 'Tambah' untuk membuat testimonial pertama dari klien Anda."
        containerClassName="py-16"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((item, index) => {
          const itemKey = item.id || index;

          return (
            <motion.div
              key={itemKey}
              layoutId={String(itemKey)}
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group flex items-start gap-4 bg-white border border-ink/10 hover:border-violet-600/30 rounded-[10px] p-4 transition-colors"
            >
              {/* Reorder Controls */}
              <div className="flex flex-col items-center gap-0.5 min-w-[32px] border-r border-ink/[0.04] pr-3 pt-1 self-stretch justify-center">
                <button
                  disabled={index === 0}
                  onClick={() => onReorder(index, "up")}
                  className={`p-1.5 rounded-[10px] border transition-all ${
                    index === 0
                      ? "text-ink/10 border-transparent cursor-not-allowed"
                      : "text-ink/30 border-transparent hover:border-violet-600/50 hover:text-violet-600 hover:scale-110 active:scale-95 cursor-pointer"
                  }`}
                >
                  <ChevronUp size={16} />
                </button>
                <span className="text-[10px] font-bold text-ink/45 font-mono">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <button
                  disabled={index === items.length - 1}
                  onClick={() => onReorder(index, "down")}
                  className={`p-1.5 rounded-[10px] border transition-all ${
                    index === items.length - 1
                      ? "text-ink/10 border-transparent cursor-not-allowed"
                      : "text-ink/30 border-transparent hover:border-violet-600/50 hover:text-violet-600 hover:scale-110 active:scale-95 cursor-pointer"
                  }`}
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-[14px] bg-ink/5 border border-ink/10 overflow-hidden flex items-center justify-center bg-paper">
                  {item.avatar_url ? (
                    <img
                      src={item.avatar_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-ink/30" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onEdit(item)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={10}
                        className={
                          s <= (item.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-ink/20"
                        }
                      />
                    ))}
                  </div>
                  {item.is_show ? (
                    <CMSBadge className="!bg-emerald-50 !text-emerald-700 !border-emerald-200 !flex !items-center !gap-1 !py-0.5 !px-2 !text-[10px]">
                      <Eye size={10} /> Published
                    </CMSBadge>
                  ) : (
                    <CMSBadge className="!bg-ink/5 !text-ink/45 !border-ink/10 !flex !items-center !gap-1 !py-0.5 !px-2 !text-[10px]">
                      <EyeOff size={10} /> Hidden
                    </CMSBadge>
                  )}
                </div>

                <h3 className="text-sm font-bold text-ink group-hover:text-violet-600 transition-colors leading-tight">
                  {item.name}
                </h3>
                <p className="gs-label text-[10px] text-muted mt-0.5">
                  {item.title}
                </p>
                <p className="text-[11px] text-muted mt-2 line-clamp-2 italic">
                  "{item.testimony}"
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-1 pl-3 border-l border-ink/[0.04] self-center">
                <button
                  aria-label={item.is_show ? "Sembunyikan" : "Tampilkan"} title={item.is_show ? "Sembunyikan" : "Tampilkan"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(item);
                  }}
                  className={`p-2 rounded-[10px] border transition-all cursor-pointer ${
                    item.is_show
                      ? "text-emerald-500 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                      : "text-ink/45 border-ink/10 bg-paper hover:bg-ink/5 hover:text-ink/70"
                  }`}
                >
                  {item.is_show ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <CMSButton
                  variant="ghost"
                  onClick={() => onEdit(item)}
                  icon={Edit3}
                  iconSize={16}
                  aria-label="Edit" title="Edit"
                  className="!p-2"
                />
                <CMSButton
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id!);
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

export default TestimonialList;
