import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../utils/supabase";
import { useToast } from "../hooks/useToast";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Check,
  Smartphone,
  Zap,
  Infinity as InfinityIcon,
} from "lucide-react";
import { PricelistItem } from "../types";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

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
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select(
          "order_number, final_price, price, status, selected_package, package_details",
        )
        .eq("order_number", orderNumber)
        .single();

      if (orderErr || !order) throw new Error("Order tidak ditemukan.");
      if (order.status !== "WAITING FOR PAYMENT") {
        // Already paid or irrelevant state — redirect back
        navigate(`/order/${orderNumber}`, { replace: true });
        return;
      }

      const amount: number = order.final_price ?? order.price ?? 0;
      setOrderAmount(amount);

      // Snapshot priority: 1. order.package_details, 2. fetch from pricelists
      if (order.package_details) {
        setPackageData(order.package_details);
      } else if (order.selected_package) {
        const { data: priceData } = await supabase
          .from("pricelists")
          .select("*")
          .eq("servicename", order.selected_package)
          .single();
        if (priceData) setPackageData(priceData);
      }

      // Call our secure server-side endpoint
      const res = await fetch("/api/create-qris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderNumber, amount }),
      });

      const data = await res.json();

      if (!res.ok || !data.payment_number) {
        throw new Error(data.message || "Gagal membuat transaksi QRIS.");
      }

      setQrisData(data);

      // Calculate time left in seconds
      const expiryMs = new Date(data.expired_at).getTime() - Date.now();
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
          `/api/transaction-status?order_id=${orderNumber}`,
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
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] gap-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/10"
        >
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </motion.div>
        <p className="text-slate-400 font-medium tracking-wide animate-pulse">
          Membuat sesi pembayaran QRIS...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--color-bg)]">
        <Helmet>
          <title>Gagal Memuat Pembayaran | Gous Studio</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-10 rounded-2xl border border-white/10 glass text-center"
        >
          <AlertCircle className="w-14 h-14 text-rose-500/60 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Gagal Membuat QRIS
          </h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            {errorMsg}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={fetchOrderAndCreateQris}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 !text-white px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-emerald-600 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={16} /> Coba Lagi
            </button>
            <Link
              to={`/order/${orderNumber}`}
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-6 py-3 rounded-xl border border-white/10 font-bold text-sm transition-all"
            >
              <ArrowLeft size={16} /> Kembali ke Order
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--color-bg)]">
        <Helmet>
          <title>Pembayaran Berhasil! | Gous Studio</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-black text-white mb-2">
            Pembayaran Diterima!
          </h2>
          <p className="text-slate-400 mb-2">
            Pengerjaan desain Anda segera dimulai.
          </p>
          <p className="text-slate-500 text-sm">
            Mengalihkan ke halaman order...
          </p>
        </motion.div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--color-bg)]">
        <Helmet>
          <title>Sesi Pembayaran Kedaluwarsa | Gous Studio</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-10 rounded-2xl border border-orange-500/20 glass text-center"
        >
          <Clock className="w-14 h-14 text-orange-500/60 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Sesi Kedaluwarsa
          </h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Kode QRIS telah melewati batas waktu. Silakan buat sesi baru untuk
            melanjutkan pembayaran.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={fetchOrderAndCreateQris}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 !text-white px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-emerald-600 active:scale-95"
            >
              <RefreshCw size={16} /> Buat QRIS Baru
            </button>
            <Link
              to={`/order/${orderNumber}`}
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-6 py-3 rounded-xl border border-white/10 font-bold text-sm transition-all"
            >
              <ArrowLeft size={16} /> Kembali ke Order
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Main payment UI (ready / polling) ────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 transition-colors duration-500 bg-[var(--color-bg)] selection:bg-emerald-500/30">
      <Helmet>
        <title>Pembayaran QRIS #{orderNumber} | Gous Studio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Decorative blobs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          to={`/order/${orderNumber}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold mb-8 group"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          Kembali ke Order #{orderNumber}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-xl border border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 bg-brand-500/[0.05]">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2">
                  <img
                    src="/img/qris-logo.svg"
                    alt="QRIS"
                    className="h-10 w-auto bg-white p-1 rounded-xs"
                  />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Scan &amp; Bayar
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Order #{orderNumber}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Clock
                    size={11}
                    className={
                      urgencyLevel === "critical"
                        ? "text-rose-400 animate-pulse"
                        : urgencyLevel === "warning"
                          ? "text-orange-400"
                          : "text-slate-400"
                    }
                  />
                  Berakhir dalam
                </div>
                <div
                  className={`text-2xl font-black tabular-nums ${
                    urgencyLevel === "critical"
                      ? "text-rose-500"
                      : urgencyLevel === "warning"
                        ? "text-orange-500"
                        : "text-emerald-500"
                  }`}
                >
                  {formatCountdown(timeLeft)}
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Area */}
          <div className="px-4 py-8 flex flex-col items-center">
            {/* QR Container */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl -z-10 scale-90 " />
              <div className="bg-white p-5 rounded-xl border-2 border-slate-100 ">
                <QRCodeSVG
                  value={qrisData!.payment_number}
                  size={220}
                  level="M"
                  includeMargin={false}
                  style={{ display: "block" }}
                />
              </div>

              {/* Corner decorations */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-brand-300 rounded-tl-xl" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-brand-300 rounded-tr-xl" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-brand-300 rounded-bl-xl" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-brand-300 rounded-br-xl" />
            </div>

            {/* QRIS label */}
            <div className="mt-4 mb-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-white/10 w-12" />
              <span className="text-[12px] font-medium text-slate-500">
                Scan dengan e-wallet / m-banking apapun
              </span>
              <div className="h-px flex-1 bg-white/10 w-12" />
            </div>

            {/* E-wallet icons */}
            <div className="mb-2">
              <img
                src="/img/e-wallet.png"
                alt="E-Wallet Support"
                className="h-auto w-full p-2 transition-all"
              />
            </div>

            {/* Payment breakdown */}
            <div className="w-full mt-6 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <div className="px-5 py-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-slate-300">
                    {formatPrice(qrisData!.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Biaya Admin QRIS</span>
                  <span className="text-slate-300">
                    {formatPrice(qrisData!.fee)}
                  </span>
                </div>
                <div className="pt-2.5 mt-0.5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Total Bayar
                  </span>
                  <span className="text-2xl font-black text-brand-500">
                    {formatPrice(qrisData!.total_payment)}
                  </span>
                </div>
              </div>
            </div>

            {/* Package Info Snapshot Card */}
            {packageData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 backdrop-blur-md relative overflow-hidden group"
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl -z-10 group-hover:bg-brand-500/10 transition-colors" />

                <div className="flex flex-col md:flex-row gap-3 items-start">
                  <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight leading-none mb-1">
                          {packageData.servicename}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-md">
                          {packageData.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5">
                          <Clock size={12} className="text-brand-500" />
                          <span className="text-[11px] font-bold text-slate-300 whitespace-nowrap">
                            {packageData.duration} hari
                          </span>
                        </div>
                        <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-1.5">
                          {packageData.isrevisionunlimited ? (
                            <InfinityIcon
                              size={12}
                              className="text-brand-500"
                            />
                          ) : (
                            <RefreshCw size={12} className="text-brand-500" />
                          )}
                          <span className="text-[11px] font-bold text-slate-300 whitespace-nowrap">
                            {packageData.isrevisionunlimited
                              ? "Unlimited"
                              : `${packageData.totalrevision}x`}{" "}
                            Rev
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deliverables List */}
                {packageData.deliverables &&
                  packageData.deliverables.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                        APA YANG DIDAPAT:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {packageData.deliverables.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 text-[11px] text-slate-400"
                          >
                            <Check
                              size={12}
                              className="text-brand-500 mt-0.5 shrink-0"
                            />
                            <span className="font-medium leading-tight">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </motion.div>
            )}

            {/* Instructions */}
            <div className="w-full mt-5 space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                Cara Bayar
              </p>
              {[
                {
                  icon: Smartphone,
                  text: "Buka e-wallet atau m-banking Anda (GoPay, OVO, Dana, dll.)",
                },
                {
                  icon: Zap,
                  text: "Pilih menu Scan / QR – arahkan kamera ke kode di atas",
                },
                {
                  icon: CreditCard,
                  text: "Pastikan nominal sudah sesuai, lalu konfirmasi pembayaran",
                },
                {
                  icon: CheckCircle2,
                  text: "Sistem akan otomatis mendeteksi pembayaran Anda",
                },
              ].map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-xs text-slate-400"
                >
                  <div className="w-6 h-6 shrink-0 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon size={12} className="text-brand-500" />
                  </div>
                  <span className="leading-relaxed pt-0.5">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] text-center">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Pembayaran diproses secara aman oleh{" "}
              <span className="text-slate-400 font-bold">Pakasir</span>. Jangan
              tutup halaman ini sebelum pembayaran selesai.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
