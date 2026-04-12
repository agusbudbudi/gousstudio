import React from "react";
import { AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Calendar,
  User,
  Package,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { OrderItem } from "../../../types";
import CMSBadge from "../Common/CMSBadge";
import CMSEmptyState from "../Common/CMSEmptyState";
import CMSCard from "../Common/CMSCard";
import CMSButton from "../Common/CMSButton";

const STATUS_COLUMNS = [
  "DRAFT",
  "WAITING FOR PAYMENT",
  "IN PROGRESS",
  "REVISION",
  "REVIEWED",
  "DONE",
];

interface OrderKanbanProps {
  orders: OrderItem[];
  updatingId: string | null;
  onSelectOrder: (orderNumber: string) => void;
  onStatusUpdate: (id: string, newStatus: string) => Promise<boolean>;
}

const KanbanCard = ({
  order,
  onSelect,
  onMove,
  loading,
}: {
  order: OrderItem;
  onSelect: (num: string) => void;
  onMove: (id: string, nextStatus: string) => void;
  loading: boolean;
}) => {
  const nextStatus = STATUS_COLUMNS[STATUS_COLUMNS.indexOf(order.status) + 1];

  return (
    <CMSCard
      onClick={() => onSelect(order.order_number)}
      className="p-3 border border-slate-100 dark:border-white/10 hover:!border-brand-200 transition-all"
      hoverEffect={false}
    >
      <div className="flex items-start justify-between mb-4">
        <CMSBadge
          variant="brand"
          className="text-[10px] !rounded-lg border border-brand-100/50 !rounded-sm"
        >
          #{order.order_number}
        </CMSBadge>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={14} className="text-slate-400" />
        </div>
      </div>

      <div className="space-y-4 mb-3">
        <div className="text-[13px] !font-black !text-slate-900 dark:!text-slate-100 truncate">
          {order.selected_package}
        </div>

        {order.brief_detail && (
          <div className="text-[11px] !text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed -mt-2.5 mb-2">
            {order.brief_detail}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold text-[11px] truncate pl-0.5">
            <User size={14} className="text-slate-400/80" />
            {order.full_name}
          </div>
          {order.deadline && (
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-bold text-[10px] pl-0.5">
              <Calendar size={14} className="text-brand-500/80" />
              {new Date(order.deadline).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-white/5">
        <CMSBadge
          variant="status"
          status="DONE"
          className="!text-[10px] !font-black !py-1 !px-2 border border-emerald-100/50"
        >
          {Number(order.final_price || 0) === 0
            ? "GRATIS"
            : `Rp ${(order.final_price || 0).toLocaleString("id-ID")}`}
        </CMSBadge>

        {nextStatus && (
          <CMSButton
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onMove(order.id, nextStatus);
            }}
            loading={loading}
            className="!p-0 !h-auto !text-slate-400 hover:!text-brand-500 hover:!bg-transparent group/btn transition-all"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
              {loading ? "..." : "Next Step"}
              <ChevronRight
                size={12}
                className="group-hover/btn:translate-x-0.5 transition-transform"
              />
            </div>
          </CMSButton>
        )}
      </div>
    </CMSCard>
  );
};

const OrderKanban: React.FC<OrderKanbanProps> = ({
  orders,
  updatingId,
  onSelectOrder,
  onStatusUpdate,
}) => {
  if (orders.length === 0) {
    return (
      <CMSEmptyState
        icon={ShoppingBag}
        title="Belum ada data order"
        description="Data order akan muncul di sini setelah pelanggan melakukan pemesanan."
        containerClassName="py-32"
      />
    );
  }

  return (
    <div className="flex-1 overflow-x-auto custom-scrollbar">
      <div className="flex gap-3 h-full min-w-max">
        {STATUS_COLUMNS.map((status) => {
          const columnOrders = orders.filter((o) => o.status === status);

          return (
            <div
              key={status}
              className="w-80 flex flex-col h-full bg-white/50 dark:bg-white/5 rounded-xl relative overflow-hidden"
            >
              <div className="p-4 border-b !border-slate-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-white/5 relative z-10">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-bold !text-black">
                    {status}
                  </h3>
                  <div className="bg-brand-50/70 !text-brand-700 text-[10px] font-bold px-1 py-0.5 rounded-md border border-brand-500/30 min-w-[18px] h-[18px] flex items-center justify-center">
                    {columnOrders.length}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar min-h-[600px] bg-transparent dark:bg-transparent">
                {columnOrders.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                      {columnOrders.map((order) => (
                        <KanbanCard
                          key={order.id}
                          order={order}
                          onSelect={onSelectOrder}
                          onMove={onStatusUpdate}
                          loading={updatingId === order.id}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                ) : (
                  <div className="h-24 flex items-center justify-center border-1 border-dashed border-slate-200 dark:border-white/10 rounded-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400/80">
                      Section Kosong
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderKanban;
