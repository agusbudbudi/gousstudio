import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../utils/supabase";
import { useToast } from "../hooks/useToast";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Check,
  Infinity as InfinityIcon,
  ShieldCheck,
} from "lucide-react";
import { PricelistItem } from "../types";
import { buttonClass, Eyebrow, Skeleton } from "../components/landing/primitives";
import {
  ClientPage,
  InfoRow,
  Panel,
  PanelLabel,
  StatePanel,
  formatIDR,
} from "../components/landing/clientPage";

type PaymentStatus =
  | "loading"
  | "ready"
  | "polling"
  | "success"
  | "expired"
  | "error";

interface QrisData {
  payment_number: string;
  total_payment: number;
  amount: number;
  fee: number;
  expired_at: string;
  order_id: string;
  payment_method: string;
}

const PaymentPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [qrisData, setQrisData] = useState<QrisData | null>(null);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [packageData, setPackageData] = useState<PricelistItem | null>(null);
  const { addToast } = useToast();

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Fetch order from Supabase ────────────────────────────────────────────
  const fetchOrderAndCreateQris = useCallback(async () => {
    setStatus("loading");
    setQrisData(null);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/orders?action=get&orderNumber=${orderNumber}`);
      if (!res.ok) throw new Error("Order tidak ditemukan.");
      const { order, priceData } = await res.json();

      if (!order) throw new Error("Order tidak ditemukan.");
      if (order.status !== "WAITING FOR PAYMENT") {
        // Already paid or irrelevant state — redirect back
        navigate(`/order/${orderNumber}`, { replace: true });
        return;
      }

      const amount: number = order.final_price ?? order.price ?? 0;
      setOrderAmount(amount);

      if (order.package_details) {
        setPackageData(order.package_details);
      } else if (priceData) {
        setPackageData(priceData);
      }

      // Call our secure server-side endpoint
      const qrisRes = await fetch("/api/payments?action=create-qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderNumber, amount }),
      });

      const qrisJson = await qrisRes.json();

      if (!qrisRes.ok || !qrisJson.payment_number) {
        throw new Error(qrisJson.message || "Gagal membuat transaksi QRIS.");
      }

      setQrisData(qrisJson);

      // Calculate time left in seconds
      const expiryMs = new Date(qrisJson.expired_at).getTime() - Date.now();
      setTimeLeft(Math.max(0, Math.floor(expiryMs / 1000)));

      setStatus("ready");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan.");
      setStatus("error");
    }
  }, [orderNumber, navigate]);

  // ─── Poll payment status ──────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/orders?action=status&order_id=${orderNumber}`,
        );
        const data = await res.json();

        if (data.status === "completed") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setStatus("success");
          addToast("Pembayaran Berhasil Diterima!", "success");
          setTimeout(() => navigate(`/order/${orderNumber}`), 3000);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Initial poll immediate
    poll();
    pollingRef.current = setInterval(poll, 5000);
  }, [orderNumber, navigate, addToast]);

  // ─── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "ready" && status !== "polling") return;
    if (timeLeft <= 0) {
      setStatus("expired");
      return;
    }

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current!);
  }, [status, timeLeft]);

  // ─── Transition to polling once ready ────────────────────────────────────
  useEffect(() => {
    if (status === "ready" && orderAmount > 0) {
      setStatus("polling");
    }
  }, [status, orderAmount]);

  // ─── Start/Stop polling based on status ───────────────────────────────────
  useEffect(() => {
    if (status === "polling") {
      startPolling();
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [status, startPolling]);

  // ─── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOrderAndCreateQris();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchOrderAndCreateQris]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const urgencyLevel =
    timeLeft < 60 ? "critical" : timeLeft < 300 ? "warning" : "normal";

  // ─── Render states ────────────────────────────────────────────────────────
  const backToOrder = (
    <Link to={`/order/${orderNumber}`} className={buttonClass("outline")}>
      <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-[3px]" />
      Kembali ke Order
    </Link>
  );

  if (status === "loading") {
    return (
      <ClientPage>
        {/* Same shape as the loaded view (header + two columns on desktop) to avoid a layout jump */}
        <div role="status" aria-label="Membuat sesi pembayaran QRIS">
          <Skeleton className="h-3 w-40 !rounded-full" />
          <Skeleton className="mt-5 h-12 w-2/3 max-w-md" />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-[520px]" />
            <div className="space-y-5">
              <Skeleton className="h-56" />
              <Skeleton className="h-48" />
            </div>
          </div>
          <span className="sr-only">Membuat sesi pembayaran QRIS...</span>
        </div>
      </ClientPage>
    );
  }

  if (status === "error") {
    return (
      <ClientPage width="narrow">
        <Helmet>
          <title>Gagal Memuat Pembayaran | Gous Studio</title>
        </Helmet>
        <StatePanel
          icon={AlertCircle}
          tone="error"
          title="Gagal membuat QRIS."
          actions={
            <>
              {backToOrder}
              <button onClick={fetchOrderAndCreateQris} className={buttonClass("primary")}>
                <RefreshCw size={16} /> Coba Lagi
              </button>
            </>
          }
        >
          {errorMsg}
        </StatePanel>
      </ClientPage>
    );
  }

  if (status === "success") {
    return (
      <ClientPage width="narrow">
        <Helmet>
          <title>Pembayaran Berhasil | Gous Studio</title>
        </Helmet>
        <div role="status">
          <StatePanel icon={CheckCircle2} tone="success" title="Pembayaran diterima.">
            Pengerjaan desain Anda segera dimulai. Mengalihkan ke halaman order...
          </StatePanel>
        </div>
      </ClientPage>
    );
  }

  if (status === "expired") {
    return (
      <ClientPage width="narrow">
        <Helmet>
          <title>Sesi Pembayaran Kedaluwarsa | Gous Studio</title>
        </Helmet>
        <StatePanel
          icon={Clock}
          tone="warning"
          title="Sesi QRIS kedaluwarsa."
          actions={
            <>
              {backToOrder}
              <button onClick={fetchOrderAndCreateQris} className={buttonClass("primary")}>
                <RefreshCw size={16} /> Buat QRIS Baru
              </button>
            </>
          }
        >
          Kode QRIS sudah melewati batas waktu. Buat sesi baru untuk melanjutkan pembayaran.
        </StatePanel>
      </ClientPage>
    );
  }

  // ─── Main payment UI (ready / polling) ────────────────────────────────────
  const timerTone =
    urgencyLevel === "critical" ? "text-rose-600" : urgencyLevel === "warning" ? "text-amber-700" : "text-ink";

  return (
    <ClientPage>
      <Helmet>
        <title>Pembayaran QRIS #{orderNumber} | Gous Studio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Link
        to={`/order/${orderNumber}`}
        className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-[3px]" />
        Order #{orderNumber}
      </Link>

      <header className="mt-6 flex items-end justify-between gap-4">
        <div>
          <Eyebrow className="text-muted">
            Pembayaran
          </Eyebrow>
          <h1 className="gs-display mt-4 text-[clamp(2.25rem,6vw,3.5rem)] font-extrabold text-ink">Scan & bayar.</h1>
        </div>
        <div className="text-right" aria-live="off">
          <p className="gs-label flex items-center justify-end gap-1.5 text-[10px] text-muted">
            <Clock size={12} aria-hidden /> Berakhir dalam
          </p>
          <p className={`gs-display mt-1 text-[28px] font-extrabold tabular-nums ${timerTone}`}>
            {formatCountdown(timeLeft)}
          </p>
        </div>
      </header>

      {/* Desktop: QR + total on the left (sticky while scrolling), package + how-to on the right.
          Mobile: one column, QR first. */}
      <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-start">
      <Panel className="overflow-hidden lg:sticky lg:top-28">
        {/* QR */}
        <div className="flex flex-col items-center border-b border-ink/10 px-6 py-8">
          <img src="/img/qris-logo.svg" alt="QRIS" className="h-8 w-auto" />
          <div className="mt-6 rounded-[16px] border border-ink/10 bg-white p-4">
            <QRCodeSVG
              value={qrisData!.payment_number}
              size={224}
              level="M"
              includeMargin={false}
              style={{ display: "block" }}
              aria-label="Kode QRIS pembayaran"
            />
          </div>
          <p className="mt-5 text-center text-sm text-muted">Scan dengan e-wallet atau m-banking apa pun</p>
          <img src="/img/e-wallet.png" alt="Didukung GoPay, OVO, DANA, ShopeePay, dan m-banking" className="mt-3 h-auto w-full max-w-[360px]" />
          {status === "polling" && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Menunggu pembayaran, halaman diperbarui otomatis
            </p>
          )}
        </div>

        {/* Breakdown */}
        <dl className="space-y-3 px-6 py-6">
          <InfoRow label="Subtotal">{formatIDR(qrisData!.amount)}</InfoRow>
          <InfoRow label="Biaya admin QRIS">{formatIDR(qrisData!.fee)}</InfoRow>
          <div className="flex items-end justify-between gap-4 border-t border-ink/10 pt-4">
            <dt className="gs-label text-muted">Total Bayar</dt>
            <dd className="gs-display text-[30px] font-extrabold tabular-nums text-ink">
              {formatIDR(qrisData!.total_payment)}
            </dd>
          </div>
        </dl>
      </Panel>

      <div className="space-y-5">
      {/* Package snapshot */}
      {packageData && (
        <Panel className="p-6">
          <PanelLabel icon={CheckCircle2}>Paket Anda</PanelLabel>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">{packageData.servicename}</h2>
              {packageData.description && (
                <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-muted">{packageData.description}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs font-semibold text-ink/70">
                <Clock size={12} className="text-violet-600" aria-hidden /> {packageData.duration} hari
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs font-semibold text-ink/70">
                {packageData.isrevisionunlimited ? (
                  <InfinityIcon size={12} className="text-violet-600" aria-hidden />
                ) : (
                  <RefreshCw size={12} className="text-violet-600" aria-hidden />
                )}
                {packageData.isrevisionunlimited ? "Revisi unlimited" : `${packageData.totalrevision}x revisi`}
              </span>
            </div>
          </div>

          {packageData.deliverables && packageData.deliverables.length > 0 && (
            <div className="mt-5 border-t border-ink/10 pt-5">
              <p className="gs-label text-[10px] text-muted">Yang Anda dapat</p>
              <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {packageData.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-ink/80">
                    <Check size={14} className="mt-0.5 shrink-0 text-violet-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      )}

      {/* How to pay */}
      <Panel className="p-6">
        <PanelLabel>Cara Bayar</PanelLabel>
        <ol className="mt-4 space-y-3">
          {[
            "Buka e-wallet atau m-banking Anda (GoPay, OVO, DANA, dll.)",
            "Pilih menu Scan / QR, lalu arahkan kamera ke kode di atas",
            "Pastikan nominal sesuai, lalu konfirmasi pembayaran",
            "Sistem otomatis mendeteksi pembayaran Anda",
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-ink/80">
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-paper text-xs font-semibold tabular-nums text-violet-700"
              >
                {i + 1}
              </span>
              <span className="pt-1 leading-relaxed">{text}</span>
            </li>
          ))}
        </ol>
      </Panel>

      {/* Security reassurance (own element, not Panel: Panel already sets a white background) */}
      <section
        aria-labelledby="payment-secure-title"
        className="flex items-start gap-4 rounded-[20px] border border-emerald-200 bg-emerald-50 p-6"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600">
          <ShieldCheck size={20} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="payment-secure-title" className="font-semibold text-ink">
            Pembayaran aman
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink/75">
            <li className="flex items-start gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              <span>
                Diproses oleh <span className="font-semibold text-ink">Pakasir</span>, payment gateway QRIS.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
              <span>Jangan tutup halaman ini sebelum pembayaran selesai. Status diperbarui otomatis.</span>
            </li>
          </ul>
        </div>
      </section>
      </div>
      </div>
    </ClientPage>
  );
};

export default PaymentPage;
