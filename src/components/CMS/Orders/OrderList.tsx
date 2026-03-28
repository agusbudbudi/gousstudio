import React from "react";
import { ShoppingBag, ChevronLeft, ChevronRight, Calendar, ImageIcon, Trash2 } from "lucide-react";
import { OrderItem } from "../../../types";
import CMSEmptyState from "../Common/CMSEmptyState";
import CMSBadge from "../Common/CMSBadge";
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
          <CMSTableHeaderCell>Paket / Kategori</CMSTableHeaderCell>
          <CMSTableHeaderCell align="right">Final Price</CMSTableHeaderCell>
          <CMSTableHeaderCell className="hidden md:table-cell">Deadline</CMSTableHeaderCell>
          <CMSTableHeaderCell>Status</CMSTableHeaderCell>
          <CMSTableHeaderCell />
        </CMSTableHeader>
        <tbody className="divide-y divide-slate-50">
          {paginatedOrders.map((order) => (
            <CMSTableRow key={order.id}>
              <CMSTableCell>
                <button
                  onClick={() => onSelectOrder(order.order_number)}
                  className="font-bold text-brand-500 hover:text-brand-600 hover:underline transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  #{order.order_number}
                </button>
                <div className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
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
                  <div className="font-bold text-slate-700 text-sm">
                    {order.full_name}
                  </div>
                  {order.payment_proof_url && (
                    <div
                      className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-bold flex items-center gap-1"
                      title="Bukti Bayar Tersedia"
                    >
                      <ImageIcon size={8} /> BUKTI
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  {order.phone_number}
                </div>
              </CMSTableCell>
              <CMSTableCell>
                <div className="font-bold text-slate-700 text-xs">
                  {order.selected_package}
                </div>
                <div className="text-[10px] text-brand-500 font-bold mt-0.5">
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
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <Calendar size={12} className="text-slate-400" />
                    {new Date(order.deadline).toLocaleDateString("id-ID")}
                  </div>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </CMSTableCell>
              <CMSTableCell>
                <CMSBadge variant="status" status={order.status}>
                  {order.status}
                </CMSBadge>
              </CMSTableCell>
              <CMSTableCell align="right">
                <CMSButton
                  variant="danger"
                  onClick={() => onDeleteOrder(order.id, order.order_number)}
                  loading={updatingId === order.id}
                  icon={Trash2}
                  iconSize={14}
                  title="Hapus Order"
                />
              </CMSTableCell>
            </CMSTableRow>
          ))}
        </tbody>
      </CMSTableContainer>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 mt-4 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-medium text-slate-500 text-center sm:text-left">
              Menampilkan{" "}
              <span className="font-bold text-slate-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              -{" "}
              <span className="font-bold text-slate-700">
                {Math.min(currentPage * itemsPerPage, orders.length)}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-slate-700">
                {orders.length}
              </span>{" "}
              order
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:hover:bg-transparent transition-all cursor-pointer"
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
                        {showEllipsis && <span className="text-slate-300 px-1">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[30px] h-[30px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === p
                              ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                              : "text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200"
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
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:hover:bg-transparent transition-all cursor-pointer"
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
