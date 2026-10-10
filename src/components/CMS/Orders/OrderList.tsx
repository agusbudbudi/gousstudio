import React from "react";
import { ShoppingBag, ChevronLeft, ChevronRight, Calendar, ImageIcon, Trash2 } from "lucide-react";
import { OrderItem } from "../../../types";
import CMSEmptyState from "../Common/CMSEmptyState";
import CMSBadge from "../Common/CMSBadge";
import AdminActionBadge from "./AdminActionBadge";
import CMSButton from "../Common/CMSButton";
import {
  CMSTableContainer,
  CMSTableHeader,
  CMSTableHeaderCell,
  CMSTableRow,
  CMSTableCell,
} from "../Common/CMSTable";

interface OrderListProps {
  orders: OrderItem[];
  searchQuery: string;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  updatingId: string | null;
  onSelectOrder: (orderNumber: string) => void;
  onDeleteOrder: (id: string, orderNumber: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  searchQuery,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  updatingId,
  onSelectOrder,
  onDeleteOrder,
}) => {
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (orders.length === 0) {
    return (
      <CMSEmptyState
        icon={ShoppingBag}
        title={
          searchQuery
            ? "Tidak ada hasil ditemukan"
            : "Belum ada data order"
        }
        description={
          searchQuery
            ? "Coba gunakan kata kunci pencarian yang lain."
            : "Klik tombol 'Tambah' untuk membuat order pertama."
        }
        containerClassName="py-32"
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CMSTableContainer className="flex-1 !overflow-y-auto custom-scrollbar">
        <CMSTableHeader>
          <CMSTableHeaderCell>Order ID & Tanggal</CMSTableHeaderCell>
          <CMSTableHeaderCell>Pelanggan</CMSTableHeaderCell>
          <CMSTableHeaderCell>Paket / Layanan</CMSTableHeaderCell>
          <CMSTableHeaderCell align="right">Final Price</CMSTableHeaderCell>
          <CMSTableHeaderCell className="hidden md:table-cell">Deadline</CMSTableHeaderCell>
          <CMSTableHeaderCell>Status</CMSTableHeaderCell>
          <CMSTableHeaderCell />
        </CMSTableHeader>
        <tbody className="divide-y divide-ink/[0.04]">
          {paginatedOrders.map((order) => (
            <CMSTableRow key={order.id}>
              <CMSTableCell>
                <button
                  onClick={() => onSelectOrder(order.order_number)}
                  className="flex items-center gap-1 whitespace-nowrap font-semibold text-violet-700 underline-offset-2 transition-colors hover:text-violet-900 hover:underline"
                >
                  #{order.order_number}
                </button>
                <div className="text-[10px] text-muted mt-1 whitespace-nowrap">
                  {new Date(order.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </CMSTableCell>
              <CMSTableCell>
                <div className="flex items-center gap-2">
                  <div className="font-bold text-ink text-sm">
                    {order.full_name}
                  </div>
                  {order.payment_proof_url && (
                    <div
                      className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                      title="Bukti Bayar Tersedia"
                    >
                      <ImageIcon size={8} /> BUKTI
                    </div>
                  )}
                </div>
                <div className="text-xs text-ink/70 mt-0.5 font-medium">
                  {order.phone_number}
                </div>
              </CMSTableCell>
              <CMSTableCell>
                <div className="font-bold text-ink text-xs">
                  {order.selected_package}
                </div>
                <div className="text-[10px] text-violet-600 font-bold mt-0.5">
                  {order.design_category}
                </div>
              </CMSTableCell>
              <CMSTableCell align="right">
                <span className="text-emerald-700 font-bold text-xs">
                  {Number(order.final_price || 0) === 0
                    ? "GRATIS"
                    : `Rp ${(order.final_price || 0).toLocaleString("id-ID")}`}
                </span>
              </CMSTableCell>
              <CMSTableCell className="hidden md:table-cell">
                {order.deadline ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <Calendar size={12} className="text-muted" />
                    {new Date(order.deadline).toLocaleDateString("id-ID")}
                  </div>
                ) : (
                  <span className="text-ink/30">—</span>
                )}
              </CMSTableCell>
              <CMSTableCell>
                <div className="flex flex-col items-start gap-1">
                  <CMSBadge variant="status" status={order.status}>
                    {order.status}
                  </CMSBadge>
                  <AdminActionBadge order={order} />
                </div>
              </CMSTableCell>
              <CMSTableCell align="right">
                <CMSButton
                  variant="danger"
                  onClick={() => onDeleteOrder(order.id, order.order_number)}
                  loading={updatingId === order.id}
                  icon={Trash2}
                  iconSize={14}
                  aria-label="Hapus Order" title="Hapus Order"
                />
              </CMSTableCell>
            </CMSTableRow>
          ))}
        </tbody>
      </CMSTableContainer>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 mt-4 rounded-[14px]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-medium text-ink/70 text-center sm:text-left">
              Menampilkan{" "}
              <span className="font-bold text-ink">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              -{" "}
              <span className="font-bold text-ink">
                {Math.min(currentPage * itemsPerPage, orders.length)}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-ink">
                {orders.length}
              </span>{" "}
              order
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-[10px] border border-ink/10 text-ink/45 hover:text-violet-700 hover:border-violet-200 hover:bg-violet-50 disabled:opacity-50 disabled:hover:text-ink/45 disabled:hover:border-ink/10 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, i, arr) => {
                    const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="text-ink/45 px-1">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          aria-current={currentPage === p ? "page" : undefined}
                          className={`h-[30px] min-w-[30px] rounded-full border text-xs font-semibold transition-colors duration-200 ${
                            currentPage === p
                              ? "border-ink bg-ink text-paper"
                              : "border-transparent text-muted hover:border-ink/15 hover:bg-white hover:text-ink"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-[10px] border border-ink/10 text-ink/45 hover:text-violet-700 hover:border-violet-200 hover:bg-violet-50 disabled:opacity-50 disabled:hover:text-ink/45 disabled:hover:border-ink/10 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
