import React from "react";
import { OrderItem } from "../../types";
import { CONFIG } from "../../config/constants";
import {
  FileText,
  User,
  Phone,
  Package,
  Zap,
  Clock,
  CreditCard,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface InvoiceTemplateProps {
  order: OrderItem;
  packageData?: any;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  order,
  packageData,
}) => {
  const displayPackageData = packageData || order.package_details;

  return (
    <div
      id={`invoice-${order.order_number}`}
      className="bg-white text-slate-900 p-10 w-[800px] min-h-[1000px] font-sans relative overflow-hidden"
      style={{ colorScheme: "light" }}
    >
      {/* Decorative Brand Header */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-32 -mt-32"></div>

      {/* Header Section */}
      <div className="flex justify-between items-start mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            {CONFIG.COMPANY_LOGO ? (
              <img
                src={CONFIG.COMPANY_LOGO}
                alt={CONFIG.COMPANY_NAME}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                <Zap className="text-white" size={20} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none uppercase">
                {CONFIG.COMPANY_NAME}
              </h1>
              <p className="text-[10px] font-bold text-brand-500 uppercase tracking-[0.2em] mt-1">
                Elevated Visual Experience
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">{CONFIG.COMPANY_ADDRESS}</p>
            <p className="text-xs text-slate-500">{CONFIG.COMPANY_EMAIL}</p>
            <p className="text-xs text-slate-500">{CONFIG.COMPANY_PHONE}</p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-4xl font-black text-slate-200 tracking-tighter mb-2">
            INVOICE
          </h2>
          <div className="space-y-1">
            <p className="text-sm font-bold text-brand-600">
              #{order.order_number}
            </p>
            <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
              <Calendar size={12} />
              {new Date(order.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12 relative z-10">
        {/* Bill To */}
        <div>
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User size={12} className="text-brand-500" /> PELANGGAN
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-black text-slate-800">
              {order.full_name}
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Phone size={14} className="text-slate-300" />{" "}
              {order.phone_number}
            </p>
          </div>
        </div>

        {/* Project Details */}
        <div>
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Package size={12} className="text-brand-500" /> DETAIL PROJECT
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Kategori
              </p>
              <p className="text-sm font-bold text-slate-700">
                {order.design_category}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Paket Pilihan
              </p>
              <p className="text-sm font-bold text-brand-600 flex items-center gap-1">
                <Zap size={14} /> {order.selected_package}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Items Table Shadow Head */}
      <div className="mb-12 relative z-10">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-100">
              <th className="py-4 px-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Deskripsi Layanan
              </th>
              <th className="py-4 px-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Harga
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-8 px-6">
                <p className="text-base font-black text-slate-800 mb-1">
                  {order.selected_package}
                </p>
                <div className="flex gap-4 mt-2">
                  {displayPackageData && (
                    <>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                        <RefreshCw size={10} className="text-brand-500" />
                        {displayPackageData.isrevisionunlimited
                          ? "Unlimited Rev"
                          : `${displayPackageData.totalrevision}x Rev`}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                        <Clock size={10} className="text-brand-500" />
                        Est. {displayPackageData.duration} Days
                      </div>
                    </>
                  )}
                </div>
                {order.brief_detail && (
                  <p className="mt-4 text-[11px] text-slate-400 leading-relaxed border-l-2 border-slate-100 pl-4">
                    {order.brief_detail.length > 400
                      ? `${order.brief_detail.substring(0, 400)}...`
                      : order.brief_detail}
                  </p>
                )}
              </td>
              <td className="py-8 px-6 text-right font-black text-slate-800">
                {formatPrice(
                  order.price || displayPackageData?.original_price || 0,
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end mb-12 relative z-10">
        <div className="w-80 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Subtotal
            </span>
            <span className="text-slate-800 font-bold">
              {formatPrice(
                order.price || displayPackageData?.original_price || 0,
              )}
            </span>
          </div>

          {Number(order.discount_value) > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                Diskon
              </span>
              <span className="text-rose-500 font-black">
                -{" "}
                {order.discount_type === "percentage"
                  ? `${order.discount_value}%`
                  : formatPrice(order.discount_value || 0)}
              </span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-slate-900 font-black uppercase text-xs tracking-[0.2em]">
              Total
            </span>
            <span className="text-2xl font-black text-brand-600">
              {Number(order.final_price) === 0
                ? "GRATIS"
                : formatPrice(order.final_price || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-brand-500/[0.03] border border-brand-500/10 rounded-2xl p-8 mb-12 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-brand-600 tracking-[0.2em] flex items-center gap-2">
              <CreditCard size={14} /> INFORMASI PEMBAYARAN
            </h4>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Metode
                </p>
                <p className="text-sm font-black text-slate-700 uppercase">
                  {order.payment_method?.replace(/_/g, " ") || "-"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Status
                </p>
                <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                  <CheckCircle2 size={16} /> LUNAS
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Nominal Dibayar
                </p>
                <p className="text-sm font-black text-slate-700">
                  {formatPrice(order.paid_amount || order.final_price || 0)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Waktu Verifikasi
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {order.paid_at
                    ? new Date(order.paid_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {CONFIG.COMPANY_STAMP && (
            <div className="w-32 h-32 relative -rotate-12 opacity-80">
              <img
                src={CONFIG.COMPANY_STAMP}
                alt="PAID STAMP"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center pt-8 border-t border-slate-100 mt-auto relative z-10">
        <p className="text-sm font-bold text-slate-800 mb-1">
          Terima kasih telah mempercayakan mahakarya Anda kepada kami.
        </p>
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-medium">
          {CONFIG.COMPANY_NAME} &bull; Elevated Visual Experience
        </p>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-2 bg-brand-gradient"></div>
    </div>
  );
};

// Helper components for Reicon support inside the template if needed
const RefreshCw = ({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
