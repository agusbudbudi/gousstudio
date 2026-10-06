import React from "react";
import { motion } from "framer-motion";
import { Filter, Plus, LayoutList, Columns, Clock } from "lucide-react";
import { EASE } from "../../landing/primitives";
import CMSSelect from "../Common/CMSSelect";
import CMSSearchBar from "../Common/CMSSearchBar";
import CMSButton from "../Common/CMSButton";

const STATUSES: string[] = [
  "DRAFT",
  "WAITING FOR PAYMENT",
  "IN PROGRESS",
  "REVIEWED",
  "REVISION",
  "DONE",
];

const VIEW_MODES = [
  { id: "LIST", label: "List", icon: LayoutList },
  { id: "KANBAN", label: "Kanban", icon: Columns },
  { id: "TIMELINE", label: "Timeline", icon: Clock },
] as const;

interface OrderFiltersProps {
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  viewMode: "LIST" | "KANBAN" | "TIMELINE";
  setViewMode: (val: "LIST" | "KANBAN" | "TIMELINE") => void;
  onAdd: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onAdd,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <CMSSelect
          icon={Filter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          containerClassName="shrink-0 w-[180px]"
          className="!font-bold"
        >
          <option value="ALL">Semua Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </CMSSelect>

        <CMSSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari..."
          className="w-36 shrink-0"
        />
      </div>

      <div
        role="tablist"
        aria-label="Tampilan order"
        className="flex h-10 shrink-0 items-center gap-1 rounded-full border border-ink/10 bg-white p-1"
      >
        {VIEW_MODES.map(({ id, label, icon: Icon }) => {
          const active = viewMode === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setViewMode(id)}
              aria-label={`${label} View`}
              title={`${label} View`}
              className={`relative flex h-full items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors duration-200 ${
                active ? "text-paper" : "text-muted hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="order-view-pill"
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-0 rounded-full bg-ink"
                />
              )}
              <Icon size={14} className="relative" />
              <span className="relative hidden lg:block">{label}</span>
            </button>
          );
        })}
      </div>

      <CMSButton onClick={onAdd} icon={Plus} className="shrink-0 ms-auto">
        Tambah
      </CMSButton>
    </div>
  );
};

export default OrderFilters;
