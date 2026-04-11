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
            className={`p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 ${colorClass}`}
          >
            {React.createElement(icon, { size: 18 })}
          </div>
          <h3 className="text-xs font-bold !text-black flex items-center gap-2">
            <span className="uppercase tracking-widest">{title}</span>
            <div className="bg-brand-50/70 !text-brand-700 text-[10px] font-bold px-1 py-0.5 rounded-md border border-brand-500/30 min-w-[18px] h-[18px] flex items-center justify-center">
              {items.length}
            </div>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((order) => (
            <CMSCard
              key={order.id}
              onClick={() => onSelectOrder(order.order_number)}
              className="p-5 border border-transparent hover:!border-brand-200 transition-all"
              hoverEffect={false}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-brand-500 tracking-widest uppercase">
                    #{order.order_number}
                  </div>
                  <h4 className="text-sm font-black !text-slate-900 dark:!text-slate-100 group-hover:text-brand-500 transition-colors truncate">
                    {order.full_name}
                  </h4>
                </div>
                <CMSBadge
                  variant="status"
                  status={order.status}
                  className="!text-[9px] !px-2 !py-0.5 border border-slate-100/50"
                >
                  {order.status}
                </CMSBadge>
              </div>

              {order.brief_detail && (
                <div className="text-[11px] !text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {order.brief_detail}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5 p-2 rounded-lg border border-slate-100/50 dark:border-white/5">
                  <Package size={14} className="text-slate-400/80" />
                  <span className="truncate">{order.selected_package}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tight text-slate-400">
                    <CalendarIcon size={12} className="text-brand-500/80" />
                    {order.deadline
                      ? new Date(order.deadline).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-500 group-hover:!text-white transition-all border border-slate-100 dark:border-white/10">
                    <ChevronRight size={14} />
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
        "text-brand-500",
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
        "text-slate-400",
      )}
    </div>
  );
};

export default OrderTimeline;
