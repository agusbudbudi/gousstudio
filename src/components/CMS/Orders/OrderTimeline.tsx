import React from "react";

import {
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  Package,
  ChevronRight,
} from "lucide-react";
import { OrderItem } from "../../../types";
import CMSBadge from "../Common/CMSBadge";
import CMSEmptyState from "../Common/CMSEmptyState";
import CMSCard from "../Common/CMSCard";

interface OrderTimelineProps {
  orders: OrderItem[];
  onSelectOrder: (orderNumber: string) => void;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({
  orders,
  onSelectOrder,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groups = {
    overdue: [] as OrderItem[],
    today: [] as OrderItem[],
    thisWeek: [] as OrderItem[],
    later: [] as OrderItem[],
    noDeadline: [] as OrderItem[],
  };

  orders.forEach((order) => {
    if (order.status === "DONE") return;

    if (!order.deadline) {
      groups.noDeadline.push(order);
      return;
    }

    const deadline = new Date(order.deadline);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = (deadline as any) - (today as any);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      groups.overdue.push(order);
    } else if (diffDays === 0) {
      groups.today.push(order);
    } else if (diffDays <= 7) {
      groups.thisWeek.push(order);
    } else {
      groups.later.push(order);
    }
  });

  const renderSection = (
    title: string,
    items: OrderItem[],
    icon: any,
    colorClass: string,
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-10 last:mb-0">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white ${colorClass}`}
          >
            {React.createElement(icon, { size: 16 })}
          </div>
          <h3 className="flex items-center gap-2.5">
            <span className="gs-label text-ink">{title}</span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1.5 text-[10px] font-semibold text-paper">
              {items.length}
            </span>
          </h3>
          <span aria-hidden className="h-px flex-1 bg-ink/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((order) => (
            <CMSCard
              key={order.id}
              onClick={() => onSelectOrder(order.order_number)}
              className="p-5 hover:!border-ink/25"
              hoverEffect={false}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="gs-label text-[10px] text-violet-700">
                    #{order.order_number}
                  </div>
                  <h4 className="truncate text-base font-semibold text-ink transition-colors group-hover:text-violet-700">
                    {order.full_name}
                  </h4>
                </div>
                <CMSBadge
                  variant="status"
                  status={order.status}
                  className="!text-[10px] !px-2 !py-0.5"
                >
                  {order.status}
                </CMSBadge>
              </div>

              {order.brief_detail && (
                <div className="text-[11px] !text-muted line-clamp-2 leading-relaxed mb-3">
                  {order.brief_detail}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 rounded-[10px] border border-ink/[0.06] bg-paper p-2 text-xs font-medium text-muted">
                  <Package size={14} className="text-ink/[0.36]" />
                  <span className="truncate">{order.selected_package}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <CalendarIcon size={12} className="text-violet-600" />
                    {order.deadline
                      ? new Date(order.deadline).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-white text-ink/50 transition-colors duration-200 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                    <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-px" />
                  </div>
                </div>
              </div>
            </CMSCard>
          ))}
        </div>
      </div>
    );
  };

  if (orders.length === 0) {
    return (
      <CMSEmptyState
        icon={Clock}
        title="Belum ada timeline"
        description="Deadline project akan muncul di sini untuk memudahkan jadwal pengerjaan."
        containerClassName="py-32"
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
      {renderSection(
        "🔴 Overdue Projects",
        groups.overdue,
        AlertCircle,
        "text-rose-500",
      )}
      {renderSection(
        "🟡 Deadline Hari Ini",
        groups.today,
        Clock,
        "text-amber-500",
      )}
      {renderSection(
        "🔵 Agenda Minggu Ini",
        groups.thisWeek,
        CalendarIcon,
        "text-violet-600",
      )}
      {renderSection(
        "🟢 Mendatang",
        groups.later,
        CalendarIcon,
        "text-emerald-500",
      )}
      {renderSection(
        "⚪ Tanpa Deadline",
        groups.noDeadline,
        CalendarIcon,
        "text-ink/45",
      )}
    </div>
  );
};

export default OrderTimeline;
