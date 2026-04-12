import React from "react";
import { Filter, Plus, LayoutList, Columns, Clock } from "lucide-react";
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

      <div className="h-10 bg-slate-100 dark:bg-white/5 p-1 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-white/10 shrink-0">
        <button
          onClick={() => setViewMode("LIST")}
          className={`p-1.5 px-3 rounded-md flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            viewMode === "LIST"
              ? "bg-white dark:bg-white/10 text-brand-500 shadow-sm"
              : "text-slate-400 hover:text-slate-600 dark:hover:!text-white"
          }`}
          title="List View"
        >
          <LayoutList size={14} />
          <span className="hidden lg:block">List</span>
        </button>
        <button
          onClick={() => setViewMode("KANBAN")}
          className={`p-1.5 px-3 rounded-md flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            viewMode === "KANBAN"
              ? "bg-white dark:bg-white/10 text-brand-500 shadow-sm"
              : "text-slate-400 hover:text-slate-600 dark:hover:!text-white"
          }`}
          title="Kanban View"
        >
          <Columns size={14} />
          <span className="hidden lg:block">Kanban</span>
        </button>
        <button
          onClick={() => setViewMode("TIMELINE")}
          className={`p-1.5 px-3 rounded-md flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            viewMode === "TIMELINE"
              ? "bg-white dark:bg-white/10 text-brand-500 shadow-sm"
              : "text-slate-400 hover:text-slate-600 dark:hover:!text-white"
          }`}
          title="Timeline View"
        >
          <Clock size={14} />
          <span className="hidden lg:block">Timeline</span>
        </button>
      </div>

      <CMSButton onClick={onAdd} icon={Plus} className="shrink-0 ms-auto">
        Tambah
      </CMSButton>
    </div>
  );
};

export default OrderFilters;
