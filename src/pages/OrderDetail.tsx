import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../utils/supabase";
import { CONFIG } from "../config/constants";
import { OrderItem, PricelistItem } from "../types";
import {
  Loader2,
  ArrowLeft,
  Package,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  ExternalLink,
  Zap,
  Calendar,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Tag,
  Upload,
  Check,
  Image as ImageIcon,
  CreditCard,
  FileDown,
} from "lucide-react";
import { toPng } from "html-to-image";
import { InvoiceTemplate } from "../components/Invoice/InvoiceTemplate";
import { useToast } from "../hooks/useToast";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const OrderDetail = () => {
  const { addToast } = useToast();
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [packageData, setPackageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/orders?action=get&orderNumber=${orderNumber}`,
        );

        if (!res.ok) {
          throw new Error("Order tidak ditemukan atau terjadi kesalahan.");
        }

        const result = await res.json();
        const data = result.order;
        const priceData = result.priceData;

        if (!data) throw new Error("Order not found");
        setOrder(data as OrderItem);

        if (priceData) {
          const displayPrice =
            data.final_price !== undefined && data.final_price !== null
              ? data.final_price
              : data.price !== undefined && data.price !== null
                ? data.price
                : priceData.finalprice;

          setPackageData({
            ...priceData,
            finalprice: displayPrice,
            original_price:
              data.price !== undefined && data.price !== null
                ? data.price
                : priceData.finalprice,
            discount_value: data.discount_value,
            discount_type: data.discount_type,
          });
        }
      } catch (err: any) {
        setError("Order tidak ditemukan atau terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !order) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Hanya file gambar (JPG/PNG) atau PDF yang diperbolehkan.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB.");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${orderNumber}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${orderNumber}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-proofs").getPublicUrl(filePath);

      // Update order in database via API to bypass RLS
      const updateRes = await fetch("/api/orders?action=update-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: order.order_number,
          paymentProofUrl: publicUrl,
        }),
      });

      if (!updateRes.ok) {
        throw new Error("Gagal memperbarui data order di database");
      }

      setOrder((prev: any) => ({ ...prev, payment_proof_url: publicUrl }));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Gagal upload bukti bayar: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const calculateProjectDuration = (
    createdDateStr?: string,
    deadlineDateStr?: string,
  ) => {
    if (!createdDateStr || !deadlineDateStr) return null;
    const start = new Date(createdDateStr);
    const end = new Date(deadlineDateStr);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = (end as any) - (start as any);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1; // Minimum 1 day
  };

  const handleDownloadInvoice = async () => {
    const invoiceId = `invoice-${orderNumber}`;
    const element = document.getElementById(invoiceId);
    if (!element) return;

    try {
      setDownloadingInvoice(true);
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        style: {
          visibility: "visible",
        },
      });
      const link = document.createElement("a");
      link.download = `invoice-${orderNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate invoice image", err);
      addToast("Gagal mengunduh invoice. Silakan coba lagi.", "error");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "DONE":
        return {
          label: "Selesai",
          color:
            "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
          icon: <CheckCircle2 size={16} />,
          desc: "Pesanan telah selesai dan file final telah diserahkan.",
          step: 4,
        };
      case "REVIEWED":
        return {
          label: "Review",
          color:
            "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20",
          icon: <Zap size={16} />,
          desc: "Desain sedang direview oleh tim kami sebelum dikirim.",
          step: 3,
        };
      case "REVISION":
        return {
          label: "Revisi",
          color:
            "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
          icon: <RefreshCw size={16} className="animate-spin-slow" />,
          desc: "Desain sedang dalam proses revisi sesuai feedback Anda.",
          step: 3,
        };
      case "IN PROGRESS":
        return {
          label: "Pengerjaan",
          color:
            "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
          icon: <Clock size={16} />,
          desc: "Desainer kami sedang mengerjakan mahakarya Anda.",
          step: 2,
        };
      case "WAITING FOR PAYMENT":
        return {
          label: "Pembayaran",
          color:
            "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20",
          icon: <AlertCircle size={16} />,
          desc: "Menunggu konfirmasi pembayaran untuk memulai pengerjaan.",
          step: 1,
        };
      default:
        return {
          label: "Diterima",
          color:
            "text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-white/10",
          icon: <FileText size={16} />,
          desc: "Pesanan telah masuk ke sistem kami.",
          step: 0,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-[var(--color-bg)] transition-colors duration-500">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center border border-brand-500/10 mb-6"
        >
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </motion.div>
        <p className="text-slate-400 font-medium tracking-wide animate-pulse">
          Menghubungkan ke server Gous Studio...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-4 bg-[var(--color-bg)] transition-colors duration-500">
        <Helmet>
          <title>Order Tidak Ditemukan | Gous Studio</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-10 rounded-2xl border border-[var(--color-border-adaptive)] glass text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-right from-transparent via-red-500/50 to-transparent"></div>
          <AlertCircle className="w-16 h-16 text-rose-500/50 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Order Tidak Ditemukan
          </h2>
          <p className="text-slate-400 mb-10 text-sm leading-relaxed">
            Maaf, kami tidak dapat menemukan data untuk nomor order{" "}
            <span className="font-bold bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md border border-[var(--color-border-adaptive)]">
              {orderNumber}
            </span>
            . Pastikan link yang Anda gunakan sudah benar.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-white px-6 py-3 rounded-xl border border-[var(--color-border-adaptive)] font-bold text-sm transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const totalDuration = calculateProjectDuration(
    order.created_at,
    order.deadline,
  );

  // Also keep track of actual days left for visual cues (rose color if late)
  const calculateDaysLeft = (deadlineDateStr?: string) => {
    if (!deadlineDateStr) return null;
    const deadline = new Date(deadlineDateStr);
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = (deadline as any) - (today as any);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const isLate = (calculateDaysLeft(order.deadline) ?? 0) < 0;

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 transition-colors duration-500 bg-[var(--color-bg)] selection:bg-brand-500/30">
      <Helmet>
        <title>Status Order #{orderNumber} | Gous Studio</title>
        <meta
          name="description"
          content={`Pantau progres pesanan desain ${order.selected_package} Anda secara real-time di Gous Studio.`}
        />
        <meta
          property="og:title"
          content={`Order #${orderNumber} - ${order.selected_package}`}
        />
        <meta
          property="og:description"
          content={`Status: ${statusInfo.label}. Lacak detail pengerjaan desain Anda mulai dari pembayaran hingga file final.`}
        />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Decorative Background Elements - Subtler */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>

      <div className="max-w-[860px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl overflow-hidden relative border border-white/10"
        >
          {/* Main Status Hero */}
          <div className="px-4 py-4 md:px-8 md:py-8 border-b border-white/5 relative overflow-hidden bg-brand-gradient">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-10">
                <div className="space-y-4 md:space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
                    Order Tracking
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
                    <span className="text-brand-500 italic block mt-2 font-['Neue_Machina']">
                      #{order.order_number}
                    </span>
                  </h1>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10">
                    <Calendar size={12} className="text-brand-500" />{" "}
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 md:gap-5 w-full md:w-auto pt-6 md:pt-0 border-t border-white/5 md:border-t-0">
                  <div
                    className={`px-4 py-2 rounded-lg border flex items-center gap-3 ${statusInfo.label.toLowerCase() === "done" ? "!text-white !bg-brand-500 shadow-[0_0_20px_rgba(255,119,57,0.3)]" : "glass text-white border-white/10"} text-[10px] font-bold uppercase tracking-widest w-fit`}
                  >
                    {React.cloneElement(statusInfo.icon as any, {
                      size: 14,
                      className:
                        statusInfo.label.toLowerCase() === "done"
                          ? ""
                          : "text-brand-500",
                    })}
                    {statusInfo.label}
                  </div>
                  <p className="text-[11px] md:text-[12px] text-slate-400 text-left md:text-right max-w-full md:max-w-[280px] leading-relaxed font-regular opacity-80 tracking-tight">
                    {statusInfo.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Deliverables Section - If Available */}
          {order.deliverables_url && (
            <div className="px-6 py-8 md:px-8 border-b border-white/5 bg-brand-500/[0.05] relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] -z-10"></div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-2 tracking-tight">
                    <Package className="text-brand-500" /> Deliverables Project
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm max-w-[400px]">
                    Siap untuk mahakarya Anda? Seluruh file final telah kami
                    siapkan di folder Cloud storage di bawah ini.
                  </p>
                </div>
                <a
                  href={order.deliverables_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-white dark:bg-brand-500 text-brand-600 dark:text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest transition-all active:scale-95 shadow-xl shadow-brand-500/10 hover:scale-105 group border border-slate-100 dark:border-brand-400"
                >
                  <ExternalLink
                    size={18}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                  AKSES GOOGLE DRIVE
                </a>
              </div>
            </div>
          )}

          {/* Payment Section - If WAITING FOR PAYMENT */}
          {order.status === "WAITING FOR PAYMENT" &&
            !order.payment_proof_url && (
              <div className="px-6 py-8 md:px-8 border-b border-white/5 bg-emerald-500/[0.05] relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-2 tracking-tight">
                      <CreditCard className="text-emerald-500" /> Tahap
                      Pembayaran
                    </h3>
                    <p className="text-slate-400 text-xs md:text-sm max-w-[400px]">
                      Siap untuk mahakarya Anda? Selesaikan pembayaran melalui
                      payment gateway resmi kami agar proses desain dapat segera
                      dimulai.
                    </p>
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0">
                    <Link
                      to={`/order/${order.order_number}/payment`}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-500/10 hover:scale-105 group border border-slate-100 dark:border-emerald-400"
                    >
                      <CreditCard
                        size={18}
                        className="transition-transform group-hover:scale-110"
                      />
                      BAYAR SEKARANG
                    </Link>
                  </div>
                </div>
              </div>
            )}

          {/* Info Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {/* Left Panel: Brief & Payment Proof */}
            <div className="p-4 md:col-span-3">
              <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                <FileText size={14} className="text-brand-500" /> Detail Brief
              </h3>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <p className="text-slate-300 text-[13px] md:text-[14px] leading-relaxed whitespace-pre-wrap font-medium break-words break-all">
                  {order.brief_detail ||
                    "Tidak ada detail brief khusus untuk pesanan ini."}
                </p>
              </div>

              {/* Deadline - Moved here */}
              <div className="mt-4 space-y-3">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Clock size={14} className="text-brand-500" /> Deadline
                  Project
                </h3>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                  <div className="text-white font-bold text-sm leading-none">
                    {order.deadline
                      ? new Date(order.deadline).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </div>
                  {order.status !== "DONE" && order.deadline && (
                    <div
                      className={`px-3 py-1.5 rounded-lg border font-black text-[9px] tracking-tight ${
                        isLate
                          ? "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20"
                          : "text-brand-600 bg-brand-50 border-brand-100 dark:text-brand-400 dark:bg-brand-500/10 dark:border-brand-500/20"
                      }`}
                    >
                      {totalDuration}D WORK
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Payment Proof Upload */}
              {(order.status === "WAITING FOR PAYMENT" ||
                order.payment_proof_url) && (
                <div
                  className={`mt-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group transition-all ${order.status !== "WAITING FOR PAYMENT" ? "hover:border-emerald-500/30" : "hover:border-brand-500/30"}`}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto text-left">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                          order.status !== "WAITING FOR PAYMENT"
                            ? "bg-emerald-500/10 border-emerald-500/10 group-hover:border-emerald-500/30"
                            : "bg-brand-500/10 border-brand-500/10 group-hover:border-brand-500/30"
                        }`}
                      >
                        {order.status !== "WAITING FOR PAYMENT" ? (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-500"
                          />
                        ) : order.payment_proof_url ? (
                          <Clock
                            size={18}
                            className="text-brand-500 animate-pulse"
                          />
                        ) : (
                          <Upload size={18} className="text-brand-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-[13px] md:text-base tracking-tight mb-0.5">
                          {order.status !== "WAITING FOR PAYMENT"
                            ? "Pembayaran Terverifikasi"
                            : order.payment_proof_url
                              ? "Bukti Terupload"
                              : "Upload Bukti Bayar"}
                        </h4>
                        <p className="text-slate-400 text-[10px] md:text-[11px] leading-tight max-w-[240px]">
                          {order.status !== "WAITING FOR PAYMENT"
                            ? "Terima kasih, pembayaran Anda telah diverifikasi."
                            : order.payment_proof_url
                              ? "Pengerjaan segera dimulai setelah verifikasi."
                              : "Lampirkan bukti transfer Anda di sini."}
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col lg:flex-row items-center gap-3">
                      {order.status === "WAITING FOR PAYMENT" ? (
                        !order.payment_proof_url ? (
                          <label className="inline-flex items-center justify-center w-full lg:w-auto px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] cursor-pointer whitespace-nowrap">
                            {uploading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                            ) : (
                              <Upload size={14} className="mr-2" />
                            )}
                            {uploading ? "Uploading..." : "Upload Manual"}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              disabled={uploading}
                            />
                          </label>
                        ) : (
                          <div className="flex flex-col items-center md:items-end gap-2 w-full">
                            <div className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-lg font-bold text-[10px] uppercase tracking-wide">
                              <Loader2 size={12} className="animate-spin" />{" "}
                              Menunggu Verifikasi
                            </div>
                            <button
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*,.pdf";
                                input.onchange = (e: any) =>
                                  handleFileUpload(e);
                                input.click();
                              }}
                              className="text-[10px] text-slate-500 hover:text-white transition-colors cursor-pointer underline underline-offset-2 font-medium"
                            >
                              Ganti File
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-center gap-2 w-full md:w-auto px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg font-bold text-[10px] uppercase tracking-widest">
                          <Check size={14} /> Terverifikasi
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Pelanggan, Paket, Rincian Pembayaran */}
            <div className="md:col-span-2 divide-y divide-white/5">
              {/* Customer Data */}
              <div className="p-4 space-y-3">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <User size={14} className="text-brand-500" /> Pelanggan
                </h3>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 ml-0.5">
                      Nama
                    </div>
                    <div className="text-base font-bold text-white capitalize leading-none tracking-tight">
                      {order.full_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 ml-0.5">
                      Whatsapp
                    </div>
                    <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Phone size={14} className="text-brand-500/60" />{" "}
                      {order.phone_number}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Info */}
              <div className="p-4 space-y-3">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Package size={14} className="text-brand-500" /> Paket
                </h3>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 ml-0.5">
                      Kategori
                    </div>
                    <div className="text-sm font-medium text-slate-300 leading-none">
                      {order.design_category || "-"}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-brand-500/20 text-brand-500 text-[10px] font-black uppercase tracking-tight">
                      <Zap size={12} /> {order.selected_package}
                    </div>
                    {packageData && (
                      <>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-tight whitespace-nowrap">
                          <RefreshCw size={12} className="text-brand-500" />
                          {packageData.isrevisionunlimited
                            ? "Unlimited Rev"
                            : `${packageData.totalrevision}x Rev`}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-tight whitespace-nowrap">
                          <Clock size={12} className="text-brand-500" />
                          Est. {packageData.duration} Days
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rincian Pembayaran - Standalone Section */}
              {(packageData || order.payment_method) && (
                <div className="p-4 space-y-3">
                  <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <CreditCard size={14} className="text-brand-500" /> Rincian
                    Pembayaran
                  </h3>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                    {packageData && (
                      <>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Harga Awal</span>
                          <span className="text-slate-400">
                            {formatPrice(packageData.original_price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Diskon</span>
                          {Number(packageData.discount_value) > 0 ? (
                            <span className="text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">
                              -
                              {packageData.discount_type === "percentage"
                                ? `${packageData.discount_value}%`
                                : formatPrice(packageData.discount_value)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                        <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Total Tagihan
                          </span>
                          <div className="text-xl md:text-2xl font-black text-emerald-600 tracking-tight flex items-center gap-2">
                            {Number(packageData.finalprice) === 0
                              ? "GRATIS"
                              : formatPrice(packageData.finalprice)}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Extra Payment Info if Paid */}
                    {order.payment_method && (
                      <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
                        {/* Label tipe pembayaran */}
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                          <span className="flex items-center gap-1.5 text-emerald-500">
                            <CreditCard size={11} />
                            {order.is_sandbox === null ||
                            order.is_sandbox === undefined
                              ? "Pembayaran Manual"
                              : "Pembayaran Otomatis"}
                          </span>
                          {order.is_sandbox === true && (
                            <span className="bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 px-1.5 py-0.5 rounded text-[9px] tracking-widest">
                              SANDBOX
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">
                            Metode Pembayaran
                          </span>
                          <span className="text-emerald-500 uppercase">
                            {order.payment_method.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">
                            Nominal Dibayar
                          </span>
                          <span className="text-emerald-500">
                            {formatPrice(order.paid_amount || 0)}
                          </span>
                        </div>
                        {order.paid_at && (
                          <div className="flex justify-between gap-4 text-[11px] font-bold">
                            <span className="text-slate-500 shrink-0">
                              Waktu Verifikasi
                            </span>
                            <span className="text-emerald-500 text-right">
                              {new Date(order.paid_at).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Invoice</span>
                          <button
                            onClick={handleDownloadInvoice}
                            disabled={downloadingInvoice}
                            className="text-emerald-500 flex items-center gap-1.5 hover:text-emerald-400 transition-colors group cursor-pointer disabled:opacity-50"
                          >
                            {downloadingInvoice ? "Downloading..." : "Download"}
                            <FileDown
                              size={14}
                              className="group-hover:translate-y-0.5 transition-transform"
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Bottom bar */}
          <div className="p-6 md:p-8 text-center bg-gradient-to-b from-transparent to-brand-500/[0.05] border-t border-white/5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex flex-col items-center"
            >
              <a
                href={`https://wa.me/${CONFIG.WA_NUMBER}?text=Halo%20Gous%20Studio!%20Saya%20ingin%20tanya%20progres%20order%20${order.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-xl font-black text-sm tracking-widest shadow-lg shadow-brand-500/30 transition-all hover:scale-105 active:scale-95 group uppercase"
              >
                <MessageCircle
                  size={22}
                  className="transition-transform group-hover:rotate-12"
                />
                Hubungi Admin via WhatsApp
              </a>
              <p className="mt-6 text-[11px] text-slate-400 ">
                Jangkauan Layanan (09:00 - 21:00 WIB)
              </p>
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-10 text-center pb-10">
          <p className="text-slate-400 hover:text-white transition-colors text-[10px] tracking-[0.2em] uppercase">
            &copy; 2024 Gous Studio. Elevated Visual Experience.
          </p>
        </div>
      </div>

      {/* Hidden Invoice Template for Capture */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "0",
          zIndex: -100,
        }}
        aria-hidden="true"
        className="light"
      >
        {order && <InvoiceTemplate order={order} packageData={packageData} />}
      </div>
    </div>
  );
};

export default OrderDetail;
