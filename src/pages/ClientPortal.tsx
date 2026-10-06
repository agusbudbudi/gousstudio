import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Package, Clock, Building2, ChevronRight, TrendingUp, FileDown, LayoutDashboard, Gift, Copy, Check, ArrowUpRight } from "lucide-react";
import { buttonClass, Eyebrow } from "../components/landing/primitives";
import {
  ClientPage,
  ClientPageSkeleton,
  Panel,
  EditorialState,
  StatusBadge,
  formatIDR,
} from "../components/landing/clientPage";

interface PortalClient {
  id: string;
  full_name: string;
  company?: string;
  photo_url?: string;
}

interface PortalOrder {
  id: string;
  order_number: string;
  design_category: string;
  selected_package: string;
  status: string;
  price: number;
  final_price: number;
  created_at: string;
  payment_proof_url?: string;
  deliverables_url?: string;
}

interface PortalVoucher {
  id: string;
  code: string;
  discount_value: number;
  discount_type: "fixed" | "percentage";
  created_at: string;
}

const ClientPortal: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<PortalClient | null>(null);
  const [orders, setOrders] = useState<PortalOrder[]>([]);
  const [vouchers, setVouchers] = useState<PortalVoucher[]>([]);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/portal?action=get-by-token&token=${token}`,
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Gagal memuat portal");
        }
        const data = await res.json();
        setClient(data.client);
        setOrders(data.orders);
        setVouchers(data.vouchers || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPortalData();
    }
  }, [token]);

  if (loading) {
    return (
      <ClientPage width="wide">
        <ClientPageSkeleton label="Memuat client portal..." />
      </ClientPage>
    );
  }

  if (error || !client) {
    return (
      <ClientPage>
        <Helmet>
          <title>Akses Ditolak | Gous Studio</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <EditorialState code="403" eyebrow="Client Portal" title="Akses ditolak.">
          {error || "Magic link tidak valid atau sudah kedaluwarsa."} Minta link baru ke admin Gous Studio.
        </EditorialState>
      </ClientPage>
    );
  }

  const activeOrders = orders.filter((o) => !["DONE", "DRAFT"].includes(o.status)).length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.final_price || o.price || 0), 0);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    setTimeout(() => setCopiedVoucher(null), 2000);
  };

  return (
    <ClientPage width="wide">
      <Helmet>
        <title>{`Portal Client | ${client.full_name} | Gous Studio`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-ink/10 bg-white md:h-20 md:w-20">
            {client.photo_url ? (
              <img src={client.photo_url} alt={client.full_name} className="h-full w-full object-contain" />
            ) : (
              <span className="gs-display text-[28px] font-extrabold text-violet-600">
                {client.full_name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <Eyebrow className="text-muted">
              Client Portal
            </Eyebrow>
            <h1 className="gs-display mt-3 text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-ink">
              Halo, {client.full_name.split(" ")[0]}.
            </h1>
            {client.company && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <Building2 size={14} aria-hidden /> {client.company}
              </p>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-ink/10 bg-ink/10 md:min-w-[360px]">
          <div className="bg-white px-5 py-4">
            <dt className="gs-label flex items-center gap-1.5 text-[10px] text-muted">
              <TrendingUp size={12} aria-hidden /> Total Investasi
            </dt>
            <dd className="gs-display mt-2 text-[22px] font-extrabold tabular-nums text-ink">{formatIDR(totalSpent)}</dd>
          </div>
          <div className="bg-white px-5 py-4">
            <dt className="gs-label flex items-center gap-1.5 text-[10px] text-muted">
              <LayoutDashboard size={12} aria-hidden /> Order Aktif
            </dt>
            <dd className="gs-display mt-2 text-[22px] font-extrabold tabular-nums text-violet-700">{activeOrders}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-12">
        {/* Orders */}
        <section className="lg:col-span-8" aria-labelledby="portal-orders">
          <div className="flex items-center gap-3">
            <h2 id="portal-orders" className="gs-label flex items-center gap-2 text-ink">
              <Package size={14} className="text-violet-600" aria-hidden /> Project & Order
            </h2>
            <span aria-hidden className="h-px flex-1 bg-ink/10" />
            <span className="text-sm text-muted">{orders.length} order</span>
          </div>

          {orders.length === 0 ? (
            // In-section empty state, straight on paper (no card)
            <div className="mt-8">
              <p className="gs-display text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-ink">Belum ada order.</p>
              <p className="mt-2 max-w-[44ch] text-muted">Riwayat project Anda akan muncul di sini.</p>
              <Link to="/pricelist" className={`${buttonClass("primary")} mt-6`}>
                Lihat Layanan
                <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {orders.map((order) => (
                <li key={order.id}>
                  <Panel
                    as="div"
                    className="group relative flex flex-col gap-4 p-5 transition-colors duration-200 hover:border-ink/25 sm:flex-row sm:items-center sm:justify-between md:p-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="gs-label text-[11px] text-violet-700">#{order.order_number}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-ink">
                        {/* Whole card is clickable via this link's overlay */}
                        <Link to={`/order/${order.order_number}`} className="after:absolute after:inset-0 after:rounded-[20px]">
                          {order.selected_package}
                        </Link>
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                        <span>{order.design_category}</span>
                        <span aria-hidden>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} aria-hidden />
                          {new Date(order.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="sm:text-right">
                        <p className="gs-label text-[10px] text-muted">Total</p>
                        <p className="mt-1 font-semibold tabular-nums text-ink">
                          {formatIDR(order.final_price || order.price)}
                        </p>
                      </div>
                      {order.deliverables_url && order.status === "DONE" && (
                        <a
                          href={order.deliverables_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          <FileDown size={16} /> File Final
                        </a>
                      )}
                      <span
                        aria-hidden
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition-colors duration-200 group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
                      >
                        <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-px" />
                      </span>
                    </div>
                  </Panel>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Vouchers */}
        {vouchers.length > 0 && (
          <aside className="lg:col-span-4" aria-labelledby="portal-vouchers">
            <Panel as="div" tone="dark" className="gs-grain overflow-hidden p-6">
              <h2 id="portal-vouchers" className="gs-label flex items-center gap-2 text-paper/60">
                <Gift size={14} className="text-violet-300" aria-hidden /> Voucher & Promo
              </h2>
              <p className="gs-display mt-3 text-[26px] font-extrabold">Untuk order berikutnya.</p>
              <p className="mt-2 text-sm leading-relaxed text-paper/60">
                Masukkan kode saat memesan project baru untuk mendapat diskon.
              </p>

              <ul className="mt-6 space-y-3">
                {vouchers.map((voucher) => (
                  <li
                    key={voucher.id}
                    className="flex items-center justify-between gap-3 rounded-[14px] border border-dashed border-paper/20 bg-paper/[0.04] py-3 pl-4 pr-3"
                  >
                    <div className="min-w-0">
                      <p className="gs-display text-[22px] font-extrabold">
                        {voucher.discount_type === "percentage"
                          ? `${voucher.discount_value}% OFF`
                          : formatIDR(voucher.discount_value)}
                      </p>
                      <p className="gs-label mt-1 truncate text-[11px] text-violet-300">{voucher.code}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(voucher.code)}
                      aria-label={`Salin kode ${voucher.code}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper text-ink transition-colors hover:bg-violet-100"
                    >
                      {copiedVoucher === voucher.code ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          </aside>
        )}
      </div>
    </ClientPage>
  );
};

export default ClientPortal;
