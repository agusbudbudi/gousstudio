import React from "react";
import { BellDot } from "lucide-react";
import { OrderItem } from "../../../types";
import { getAdminAction } from "../../../utils/orderFlow";

const TONES = {
  payment: "border-orange-200 bg-orange-50 text-orange-700",
  revision: "border-rose-200 bg-rose-50 text-rose-600",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

/** "Needs your action" marker for orders where the client just did something. */
const AdminActionBadge: React.FC<{ order: OrderItem; className?: string }> = ({ order, className = "" }) => {
  const action = getAdminAction(order);
  if (!action) return null;
  return (
    <span
      title="Butuh aksi admin"
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONES[action.key]} ${className}`}
    >
      <BellDot size={12} aria-hidden />
      {action.label}
    </span>
  );
};

export default AdminActionBadge;
