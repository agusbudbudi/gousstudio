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
      className="p-3.5 hover:!border-ink/25"
      hoverEffect={false}
    >
      <div className="flex items-start justify-between mb-4">
        <CMSBadge
          variant="brand"
          className="!text-[10px]"
        >
          #{order.order_number}
        </CMSBadge>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={14} className="text-ink/45" />
        </div>
      </div>

      <div className="space-y-4 mb-3">
        <div className="truncate text-sm font-semibold text-ink">
          {order.selected_package}
        </div>

        {order.brief_detail && (
          <div className="text-[11px] !text-muted line-clamp-2 leading-relaxed -mt-2.5 mb-2">
            {order.brief_detail}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-muted font-medium text-xs truncate pl-0.5">
            <User size={14} className="text-ink/[0.36]" />
            {order.full_name}
          </div>
          {order.deadline && (
            <div className="flex items-center gap-2.5 text-muted font-medium text-xs pl-0.5">
              <Calendar size={14} className="text-violet-600" />
              {new Date(order.deadline).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-ink/[0.04]">
        <CMSBadge
          variant="status"
          status="DONE"
          className="!text-[11px] !py-1 !px-2.5"
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
            className="!p-0 !h-auto !text-ink/45 hover:!text-violet-700 hover:!bg-transparent group/btn"
          >
            <div className="gs-label flex items-center gap-1.5 text-[10px]">
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
              className="relative flex h-full w-80 flex-col overflow-hidden rounded-[16px] border border-ink/10 bg-paper-200/40"
            >
              <div className="relative z-10 flex items-center justify-between border-b border-ink/10 bg-white px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="gs-label text-[10px] text-ink">{status}</h3>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1.5 text-[10px] font-semibold text-paper">
                    {columnOrders.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar min-h-[600px] bg-transparent">
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
                  <div className="flex h-24 items-center justify-center rounded-[12px] border border-dashed border-ink/15">
                    <span className="gs-label text-[10px] text-ink/35">
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
