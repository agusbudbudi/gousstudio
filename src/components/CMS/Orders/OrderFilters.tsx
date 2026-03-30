import React from "react";
import { Filter, Plus } from "lucide-react";
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
  onAdd: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  onAdd,
}) => {
  return (
    <div className="flex items-center gap-2">
      <CMSSelect
        icon={Filter}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        containerClassName="shrink-0 w-[200px]"
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
        placeholder="Cari Order..."
        className="w-44 shrink-0"
      />
      
      <CMSButton
        onClick={onAdd}
        icon={Plus}
        className="shrink-0"
      >
        Tambah
      </CMSButton>
    </div>
  );
};

export default OrderFilters;
