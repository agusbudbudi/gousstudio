import React from "react";
import { OrderItem } from "../../types";
import { CONFIG } from "../../config/constants";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";

interface InvoiceTemplateProps {
  order: OrderItem;
  packageData?: any;
  type?: "INVOICE" | "PROFORMA";
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const formatDate = (value: string, withTime = false) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

const Label: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
  <p className={`gs-label text-[10px] text-[#5b5966] ${className}`}>{children}</p>
);

/**
 * Printable invoice / proforma, captured to PNG with html-to-image (OrderForm in the CMS and the
 * public order page). Fixed 800px width; brand styling per docs/DESIGN.md §2 (paper + ink, violet).
 */
export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, packageData, type = "INVOICE" }) => {
  const pkg = packageData || order.package_details;
  const isProforma = type === "PROFORMA";
  const subtotal = order.price || pkg?.original_price || 0;
  const discount =
    Number(order.discount_value) > 0
      ? order.discount_type === "percentage"
        ? (subtotal * (order.discount_value || 0)) / 100
        : order.discount_value || 0
      : 0;

  return (
    <div
      id={`invoice-${order.order_number}`}
      className="relative flex min-h-[1000px] w-[800px] flex-col overflow-hidden bg-white px-14 pb-14 pt-12 text-[#0b0a12]"
      style={{ colorScheme: "light", fontFamily: "var(--font-body)" }}
    >
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center">
            {CONFIG.COMPANY_LOGO && (
              <img src={CONFIG.COMPANY_LOGO} alt="" className="h-11 w-11 object-contain" />
            )}
            <p className="gs-display text-[28px] font-extrabold leading-none">
              Gous<span className="text-[#7c3aed]">Studio</span>
            </p>
          </div>
          <div className="mt-5 space-y-1 text-xs leading-relaxed text-[#5b5966]">
            {CONFIG.COMPANY_ADDRESS && <p>{CONFIG.COMPANY_ADDRESS}</p>}
            {CONFIG.COMPANY_EMAIL && <p>{CONFIG.COMPANY_EMAIL}</p>}
            {CONFIG.COMPANY_PHONE && <p>{CONFIG.COMPANY_PHONE}</p>}
          </div>
        </div>

        <div className="text-right">
          <p className="gs-display text-[44px] font-extrabold leading-none">
            {isProforma ? "Proforma" : "Invoice"}
            <span className="text-[#7c3aed]">.</span>
          </p>
          <p className="gs-label mt-3 text-[12px] text-[#6d28d9]">#{order.order_number}</p>
          <p className="mt-1 text-xs text-[#5b5966]">{formatDate(order.created_at)}</p>
        </div>
      </header>

      <div className="mt-10 h-px bg-[#0b0a12]" />

      {/* Parties */}
      <section className="mt-8 grid grid-cols-2 gap-12">
        <div>
          <Label>01 — Ditagihkan kepada</Label>
          <p className="mt-3 text-lg font-semibold">{order.full_name}</p>
          <p className="mt-1 text-sm text-[#5b5966]">{order.phone_number}</p>
        </div>
        <div>
          <Label>02 — Detail project</Label>
          <p className="mt-3 text-lg font-semibold">{order.selected_package}</p>
          <p className="mt-1 text-sm text-[#5b5966]">{order.design_category}</p>
        </div>
      </section>

      {/* Items */}
      <section className="mt-10">
        <div className="flex justify-between border-y border-[#0b0a12]/10 bg-[#f7f6f2] px-5 py-3">
          <Label>Deskripsi layanan</Label>
          <Label>Harga</Label>
        </div>
        <div className="flex items-start justify-between gap-10 border-b border-[#0b0a12]/10 px-5 py-6">
          <div className="min-w-0">
            <p className="text-base font-semibold">{order.selected_package}</p>
            {pkg && (
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0b0a12]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0b0a12]/70">
                  <RefreshCw size={11} className="text-[#7c3aed]" />
                  {pkg.isrevisionunlimited ? "Revisi unlimited" : `${pkg.totalrevision}x revisi`}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0b0a12]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0b0a12]/70">
                  <Clock size={11} className="text-[#7c3aed]" />
                  Estimasi {pkg.duration} hari
                </span>
              </div>
            )}
            {order.brief_detail && (
              <p className="mt-4 border-l-2 border-[#ddd6fe] pl-4 text-[12px] leading-relaxed text-[#5b5966]">
                {order.brief_detail.length > 400 ? `${order.brief_detail.substring(0, 400)}...` : order.brief_detail}
              </p>
            )}
          </div>
          <p className="shrink-0 text-base font-semibold tabular-nums">{formatPrice(subtotal)}</p>
        </div>
      </section>

      {/* Totals */}
      <section className="mt-6 flex justify-end">
        <dl className="w-80 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#5b5966]">Subtotal</dt>
            <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-[#5b5966]">
                Diskon
                {order.voucher_code && (
                  <span className="gs-label rounded-full bg-[#f5f3ff] px-2 py-0.5 text-[9px] text-[#5b21b6]">
                    {order.voucher_code}
                  </span>
                )}
                {order.discount_type === "percentage" && (
                  <span className="rounded-full bg-[#f5f3ff] px-2 py-0.5 text-[10px] font-semibold text-[#5b21b6]">
                    {order.discount_value}%
                  </span>
                )}
              </dt>
              <dd className="font-semibold tabular-nums text-[#e11d48]">−{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex items-end justify-between border-t border-[#0b0a12] pt-4">
            <dt className="gs-label text-[11px]">Total</dt>
            <dd className="gs-display text-[32px] font-extrabold leading-none tabular-nums">
              {Number(order.final_price) === 0 ? "Gratis" : formatPrice(order.final_price || 0)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Payment */}
      <section className="mt-10 flex items-start justify-between gap-8 rounded-[20px] border border-[#0b0a12]/10 bg-[#f7f6f2] p-7">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <Label className="!text-[#0b0a12]">03 — Informasi pembayaran</Label>
            {isProforma ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fde68a] bg-[#fffbeb] px-3 py-1 text-[11px] font-semibold text-[#92400e]">
                <Clock size={12} /> Belum dibayar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-1 text-[11px] font-semibold text-[#047857]">
                <CheckCircle2 size={12} /> Lunas
              </span>
            )}
          </div>
          <dl className="mt-5 grid grid-cols-3 gap-6">
            <div>
              <dt className="text-[11px] text-[#5b5966]">Metode</dt>
              <dd className="mt-1 text-sm font-semibold capitalize">
                {order.payment_method?.replace(/_/g, " ").toLowerCase() || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-[#5b5966]">Nominal dibayar</dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums">
                {isProforma ? "—" : formatPrice(order.paid_amount || order.final_price || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-[#5b5966]">Waktu verifikasi</dt>
              <dd className="mt-1 text-sm font-semibold">
                {!isProforma && order.paid_at ? formatDate(order.paid_at, true) : "—"}
              </dd>
            </div>
          </dl>
        </div>

        {CONFIG.COMPANY_STAMP && !isProforma && (
          <img src={CONFIG.COMPANY_STAMP} alt="Lunas" className="h-28 w-28 shrink-0 -rotate-12 object-contain opacity-80" />
        )}
      </section>

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center">
        <p className="gs-display text-[20px] font-extrabold">Terima kasih sudah memercayakan desain Anda kepada kami.</p>
        <p className="gs-label mt-3 text-[10px] text-[#5b5966]">{CONFIG.COMPANY_NAME} · Creative Design Studio</p>
      </footer>

      <div className="absolute bottom-0 left-0 h-2 w-full bg-[#7c3aed]" aria-hidden />
    </div>
  );
};
