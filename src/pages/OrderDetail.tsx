import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabase";
import { CONFIG } from "../config/constants";
import { OrderItem, PricelistItem } from "../types";
import {
  Loader2,
  Package,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  ExternalLink,
  Calendar,
  MessageCircle,
  RefreshCw,
  Upload,
  Check,
  CreditCard,
  FileDown,
  Star,
  Gift,
  Copy,
  Eye,
} from "lucide-react";
import { toPng } from "html-to-image";
import { InvoiceTemplate } from "../components/Invoice/InvoiceTemplate";
import { useToast } from "../hooks/useToast";
import { buttonClass, Eyebrow } from "../components/landing/primitives";
import {
  ClientPage,
  ClientPageSkeleton,
  InfoRow,
  Panel,
  PanelLabel,
  EditorialState,
  StatusBadge,
  StatusSteps,
  formatIDR,
  getOrderStatus,
} from "../components/landing/clientPage";
import CMSModal from "../components/CMS/Common/CMSModal";
import { getRevisionQuota } from "../utils/orderFlow";
import CMSInput from "../components/CMS/Common/CMSInput";

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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionText, setRevisionText] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approving, setApproving] = useState(false);

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
        const existingReferral = result.referralCode;

        if (!data) throw new Error("Order not found");
        setOrder(data as OrderItem);
        if (existingReferral) setReferralCode(existingReferral);

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
      addToast("Hanya file gambar (JPG/PNG) atau PDF yang diperbolehkan.", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast("Ukuran file maksimal 5MB.", "error");
      return;
    }

    let uploadedPath: string | null = null;
    try {
      setUploading(true);

      // Proof is only accepted while payment is pending. Check first so a stale page (admin
      // already confirmed) doesn't leave an unreferenced file in storage.
      const statusRes = await fetch(`/api/orders?action=status&order_id=${encodeURIComponent(order.order_number)}`);
      const statusData = await statusRes.json().catch(() => ({}));
      if (statusRes.ok && statusData.orderStatus && statusData.orderStatus !== "WAITING FOR PAYMENT") {
        throw new Error("Bukti bayar hanya bisa diupload saat order menunggu pembayaran. Muat ulang halaman.");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${orderNumber}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${orderNumber}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      uploadedPath = filePath;

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
        const result = await updateRes.json().catch(() => ({}));
        throw new Error(result.message || "Gagal memperbarui data order di database");
      }

      uploadedPath = null;
      setOrder((prev: any) => ({ ...prev, payment_proof_url: publicUrl }));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
    } catch (err: any) {
      console.error("Upload error:", err);
      // Best effort: drop the file the order never got to reference
      if (uploadedPath) {
        await supabase.storage.from("payment-proofs").remove([uploadedPath]).catch(() => {});
      }
      addToast(`Gagal upload bukti bayar: ${err.message}`, "error");
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
      if (!order) return;
      const link = document.createElement("a");
      const isProforma = ["DRAFT", "WAITING FOR PAYMENT"].includes(
        order.status,
      );
      link.download = `${isProforma ? "proforma-" : "invoice-"}${orderNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate invoice image", err);
      addToast("Gagal mengunduh invoice. Silakan coba lagi.", "error");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText || !order) return;

    try {
      setSubmittingFeedback(true);
      const res = await fetch("/api/orders?action=submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.order_number,
          rating: feedbackRating,
          testimony: feedbackText,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengirim feedback");

      const result = await res.json();
      setReferralCode(result.referralCode);
      addToast("Terima kasih atas feedback Anda!", "success");
    } catch (err: any) {
      addToast(err.message || "Gagal mengirim feedback", "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitRevision = async () => {
    const notes = revisionText.trim();
    if (notes.length < 10 || !order) return;

    try {
      setSubmittingRevision(true);
      const res = await fetch("/api/orders?action=request-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: order.order_number, notes }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Gagal mengirim revisi");

      setOrder(result.order as OrderItem);
      setIsRevisionOpen(false);
      setRevisionText("");
      addToast("Permintaan revisi terkirim. Kami segera mengerjakannya.", "success");
    } catch (err: any) {
      addToast(err.message || "Gagal mengirim revisi", "error");
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleApproveDraft = async () => {
    if (!order) return;
    try {
      setApproving(true);
      const res = await fetch("/api/orders?action=approve-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: order.order_number }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Gagal menyetujui draft");

      setOrder(result.order as OrderItem);
      setIsApproveOpen(false);
      addToast("Draft disetujui. Kami siapkan file final-nya.", "success");
    } catch (err: any) {
      addToast(err.message || "Gagal menyetujui draft", "error");
    } finally {
      setApproving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast("Kode referral berhasil disalin!", "success");
  };

  const waHref = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(
    `Halo Gous Studio! Saya ingin tanya progres order ${orderNumber}`,
  )}`;

  if (loading) {
    return (
      <ClientPage>
        <ClientPageSkeleton label="Memuat detail order..." />
      </ClientPage>
    );
  }

  if (error || !order) {
    return (
      <ClientPage>
        <Helmet>
          <title>Order Tidak Ditemukan | Gous Studio</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <EditorialState code="404" eyebrow="Order Tracking" title="Order tidak ditemukan.">
          Kami tidak menemukan data untuk nomor order{" "}
          <span className="break-all font-semibold text-ink">{orderNumber}</span>. Pastikan link yang Anda buka sudah
          benar.
        </EditorialState>
      </ClientPage>
    );
  }

  const statusInfo = getOrderStatus(order.status);
  const totalDuration = calculateProjectDuration(order.created_at, order.deadline || undefined);

  // Actual days left, for the late indicator
  const calculateDaysLeft = (deadlineDateStr?: string) => {
    if (!deadlineDateStr) return null;
    const deadline = new Date(deadlineDateStr);
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.ceil(((deadline as any) - (today as any)) / (1000 * 60 * 60 * 24));
  };
  const isLate = (calculateDaysLeft(order.deadline || undefined) ?? 0) < 0;
  const isWaitingPayment = order.status === "WAITING FOR PAYMENT";
  const reviewUrl = order.status === "REVIEWED" ? order.review_url : null;
  const revisionCount = order.revision_count ?? 0;
  const revisionQuota = getRevisionQuota(packageData);
  const nextRevisionIsExtra = revisionQuota !== null && revisionCount + 1 > revisionQuota;
  const revisionsLeft =
    revisionQuota === null || revisionQuota === Infinity ? null : Math.max(revisionQuota - revisionCount, 0);
  const revisionNotes = order.revision_notes ?? [];
  const latestRevision =
    order.status === "REVISION" ? revisionNotes[revisionNotes.length - 1] ?? null : null;
  // Admin-logged entries carry internal summaries (the API blanks them); never show them as the client's
  const latestRevisionNotes = latestRevision?.source === "admin" ? "" : latestRevision?.notes;
  const isProforma = ["DRAFT", "WAITING FOR PAYMENT"].includes(order.status);
  const discountAmount =
    packageData && Number(packageData.discount_value) > 0
      ? packageData.discount_type === "percentage"
        ? (packageData.original_price * packageData.discount_value) / 100
        : packageData.discount_value
      : 0;

  return (
    <ClientPage>
      <Helmet>
        <title>Status Order #{orderNumber} | Gous Studio</title>
        <meta
          name="description"
          content={`Pantau progres pesanan desain ${order.selected_package} Anda secara real-time di Gous Studio.`}
        />
        <meta property="og:title" content={`Order #${orderNumber} - ${order.selected_package}`} />
        <meta
          property="og:description"
          content={`Status: ${statusInfo.label}. Lacak detail pengerjaan desain Anda mulai dari pembayaran hingga file final.`}
        />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <header>
        <Eyebrow className="text-muted">
          Order Tracking
        </Eyebrow>
        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="gs-display break-all text-[clamp(2.25rem,6vw,4rem)] font-extrabold text-ink">
              #{order.order_number}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted">
              <Calendar size={14} aria-hidden />
              Dibuat{" "}
              {new Date(order.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="md:text-right">
            <StatusBadge status={order.status} />
            <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-muted md:ml-auto">{statusInfo.desc}</p>
          </div>
        </div>
        <div className="mt-8 border-t border-ink/10 pt-6">
          <StatusSteps status={order.status} />
        </div>
      </header>

      {/* Primary action for the current status */}
      {(order.deliverables_url || reviewUrl || latestRevision || (isWaitingPayment && !order.payment_proof_url)) && (
        <div className="mt-10 space-y-4">
          {latestRevision && (
            <Panel className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <PanelLabel icon={RefreshCw}>Revisi ke-{latestRevision.round}</PanelLabel>
                <span className="text-xs text-muted">
                  dikirim{" "}
                  {new Date(latestRevision.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <h2 className="gs-display mt-3 text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-ink">
                Revisi sedang kami kerjakan.
              </h2>
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted">
                Kami akan kabari begitu hasil revisinya siap direview.
                {latestRevisionNotes && " Catatan yang kamu kirim:"}
              </p>
              {latestRevisionNotes && (
                <p className="mt-4 whitespace-pre-wrap break-words rounded-[14px] border border-ink/10 bg-paper p-4 text-[15px] leading-relaxed text-ink/80">
                  {latestRevisionNotes}
                </p>
              )}
              {latestRevision.review_url && (
                <a
                  href={latestRevision.review_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline"
                >
                  <Eye size={14} aria-hidden /> Lihat draft yang kamu review
                  <ExternalLink size={13} aria-hidden />
                </a>
              )}
            </Panel>
          )}
          {reviewUrl && order.approved_at && (
            <Panel className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <PanelLabel icon={CheckCircle2}>Draft Disetujui</PanelLabel>
                <h2 className="gs-display mt-3 text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-ink">
                  Terima kasih, draft sudah kamu setujui.
                </h2>
                <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-muted">
                  Kami sedang menyiapkan file final. Link file akan muncul di halaman ini begitu siap.
                </p>
              </div>
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonClass("outline", "lg")} w-full md:w-auto`}
              >
                <Eye size={18} /> Lihat Draft
              </a>
            </Panel>
          )}
          {reviewUrl && !order.approved_at && (
            <Panel className="flex flex-col gap-5 p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PanelLabel icon={Eye}>Draft Desain</PanelLabel>
                    {revisionCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                        <RefreshCw size={12} aria-hidden /> Revisi ke-{revisionCount}
                      </span>
                    )}
                  </div>
                  <h2 className="gs-display mt-3 text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-ink">
                    {revisionCount > 0 ? "Hasil revisi siap kamu review." : "Draft siap kamu review."}
                  </h2>
                  <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-muted">
                    {revisionCount > 0
                      ? `Kami sudah menerapkan feedback-mu (revisi ke-${revisionCount}). Sudah oke? Setujui draft. Masih ada yang perlu diubah? Minta revisi.`
                      : "Cek draft desainnya. Sudah oke? Setujui draft. Ada yang perlu diubah? Minta revisi."}
                  </p>
                </div>
                <a
                  href={reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClass("primary", "lg")} w-full md:w-auto`}
                >
                  <Eye size={18} /> Lihat Draft
                </a>
              </div>
              <div className="flex flex-col gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">
                  {revisionQuota === Infinity
                    ? "Revisi unlimited untuk paket ini."
                    : revisionsLeft !== null
                      ? revisionsLeft > 0
                        ? `Sisa jatah revisi: ${revisionsLeft} dari ${revisionQuota}.`
                        : "Jatah revisi paket sudah terpakai semua."
                      : null}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsRevisionOpen(true)}
                    className={`${buttonClass("outline")} w-full sm:w-auto`}
                  >
                    <RefreshCw size={16} /> Minta Revisi
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsApproveOpen(true)}
                    className={`${buttonClass("primary")} w-full sm:w-auto`}
                  >
                    <CheckCircle2 size={16} /> Setujui Draft
                  </button>
                </div>
              </div>
            </Panel>
          )}
          {order.deliverables_url && (
            <Panel tone="dark" className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <p className="gs-label flex items-center gap-2 text-paper/60">
                  <Package size={14} className="text-violet-300" aria-hidden /> File Final
                </p>
                <h2 className="gs-display mt-3 text-[clamp(1.5rem,3vw,2rem)] font-extrabold">File final sudah siap.</h2>
                <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-paper/60">
                  Seluruh file final sudah kami siapkan. Buka linknya untuk melihat dan mengunduh file.
                </p>
              </div>
              <a
                href={order.deliverables_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonClass("light", "lg")} w-full md:w-auto`}
              >
                Buka File Final
                <ExternalLink size={18} className="transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
              </a>
            </Panel>
          )}

          {isWaitingPayment && !order.payment_proof_url && (
            <Panel className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div>
                <PanelLabel icon={CreditCard}>Tahap Pembayaran</PanelLabel>
                <h2 className="gs-display mt-3 text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-ink">
                  Selesaikan pembayaran.
                </h2>
                <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-muted">
                  Bayar lewat QRIS agar proses desain bisa segera dimulai. Sudah transfer manual? Upload buktinya di
                  bawah.
                </p>
              </div>
              <Link to={`/order/${order.order_number}/payment`} className={`${buttonClass("primary", "lg")} w-full md:w-auto`}>
                <CreditCard size={18} /> Bayar Sekarang
              </Link>
            </Panel>
          )}
        </div>
      )}

      {/* Details */}
      <div className="mt-10 grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <Panel className="p-6">
            <PanelLabel icon={FileText}>Detail Brief</PanelLabel>
            <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink/80">
              {order.brief_detail || "Tidak ada detail brief khusus untuk pesanan ini."}
            </p>
          </Panel>

          <Panel className="flex items-center justify-between gap-4 p-6">
            <div>
              <PanelLabel icon={Clock}>Deadline</PanelLabel>
              <p className="gs-display mt-3 text-[22px] font-extrabold text-ink">
                {order.deadline
                  ? new Date(order.deadline).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Belum ditentukan"}
              </p>
            </div>
            {order.status !== "DONE" && order.deadline && (
              <span
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
                  isLate ? "border-rose-200 bg-rose-50 text-rose-700" : "border-violet-200 bg-violet-50 text-violet-800"
                }`}
              >
                {isLate ? "Melewati deadline" : `${totalDuration} hari kerja`}
              </span>
            )}
          </Panel>

          {/* Payment proof */}
          {(isWaitingPayment || order.payment_proof_url) && (
            <Panel className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                    !isWaitingPayment
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border-violet-100 bg-violet-50 text-violet-600"
                  }`}
                >
                  {!isWaitingPayment ? (
                    <CheckCircle2 size={18} />
                  ) : order.payment_proof_url ? (
                    <Clock size={18} />
                  ) : (
                    <Upload size={18} />
                  )}
                </span>
                <div>
                  <h3 className="font-semibold text-ink">
                    {!isWaitingPayment
                      ? "Pembayaran terverifikasi"
                      : order.payment_proof_url
                        ? "Bukti bayar terkirim"
                        : "Upload bukti bayar"}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {!isWaitingPayment
                      ? "Terima kasih, pembayaran Anda telah diverifikasi."
                      : order.payment_proof_url
                        ? "Pengerjaan dimulai setelah admin memverifikasi."
                        : "Untuk transfer manual. Format JPG, PNG, atau PDF, maksimal 5MB."}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {isWaitingPayment ? (
                  !order.payment_proof_url ? (
                    <label className={`${buttonClass("outline")} cursor-pointer ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                      {uploading ? <Loader2 size={16} className="motion-safe:animate-spin" /> : <Upload size={16} />}
                      {uploading ? "Mengupload..." : "Pilih File"}
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  ) : (
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                        <Clock size={13} /> {uploadSuccess ? "Bukti terkirim" : "Menunggu verifikasi"}
                      </span>
                      <label className="cursor-pointer text-sm font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink">
                        Ganti file
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <Check size={13} /> Terverifikasi
                  </span>
                )}
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          {/* Customer + package */}
          <Panel className="p-6">
            <PanelLabel icon={User}>Pelanggan</PanelLabel>
            <p className="mt-4 text-lg font-semibold capitalize text-ink">{order.full_name}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted">
              <Phone size={14} aria-hidden /> {order.phone_number}
            </p>

            <div className="mt-6 border-t border-ink/10 pt-6">
              <PanelLabel icon={Package}>Paket</PanelLabel>
              <p className="mt-4 text-lg font-semibold text-ink">{order.selected_package}</p>
              <p className="mt-1 text-sm text-muted">{order.design_category || "-"}</p>
              {packageData && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs font-semibold text-ink/70">
                    <RefreshCw size={12} className="text-violet-600" aria-hidden />
                    {packageData.isrevisionunlimited ? "Revisi unlimited" : `${packageData.totalrevision}x revisi`}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs font-semibold text-ink/70">
                    <Clock size={12} className="text-violet-600" aria-hidden />
                    Estimasi {packageData.duration} hari
                  </span>
                </div>
              )}
            </div>
          </Panel>

          {/* Payment summary */}
          {(packageData || order.payment_method) && (
            <Panel className="p-6">
              <PanelLabel icon={CreditCard}>Rincian Pembayaran</PanelLabel>

              {packageData && (
                <dl className="mt-5 space-y-3">
                  <InfoRow label="Harga awal">{formatIDR(packageData.original_price)}</InfoRow>
                  <InfoRow
                    label={
                      <span className="flex flex-wrap items-center gap-1.5">
                        Diskon
                        {order.voucher_code && (
                          <span className="gs-label rounded-full bg-violet-50 px-2 py-0.5 text-[10px] text-violet-800">
                            {order.voucher_code}
                          </span>
                        )}
                        {discountAmount > 0 && packageData.discount_type === "percentage" && (
                          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                            {packageData.discount_value}%
                          </span>
                        )}
                      </span>
                    }
                  >
                    {discountAmount > 0 ? (
                      <span className="text-rose-600">−{formatIDR(discountAmount)}</span>
                    ) : (
                      "—"
                    )}
                  </InfoRow>
                  <div className="flex items-end justify-between gap-4 border-t border-ink/10 pt-4">
                    <dt className="gs-label text-muted">Total</dt>
                    <dd className="gs-display text-[28px] font-extrabold tabular-nums text-ink">
                      {Number(packageData.finalprice) === 0 ? "Gratis" : formatIDR(packageData.finalprice)}
                    </dd>
                  </div>
                </dl>
              )}

              {order.payment_method && (
                <dl className="mt-5 space-y-3 border-t border-ink/10 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={13} />
                      {order.is_sandbox === null || order.is_sandbox === undefined
                        ? "Verifikasi manual"
                        : "Otomatis (Pakasir)"}
                    </span>
                    {order.is_sandbox === true && (
                      <span className="gs-label rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800">Sandbox</span>
                    )}
                  </div>
                  <InfoRow label="Metode">
                    <span className="capitalize">{order.payment_method.replace(/_/g, " ").toLowerCase()}</span>
                  </InfoRow>
                  <InfoRow label="Dibayar" strong>
                    {formatIDR(order.paid_amount || 0)}
                  </InfoRow>
                  {order.paid_at && (
                    <InfoRow label="Waktu verifikasi">
                      {new Date(order.paid_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </InfoRow>
                  )}
                </dl>
              )}

              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className={`${buttonClass("outline")} mt-6 w-full disabled:opacity-50`}
              >
                {downloadingInvoice ? <Loader2 size={16} className="motion-safe:animate-spin" /> : <FileDown size={16} />}
                {downloadingInvoice ? "Menyiapkan..." : isProforma ? "Unduh Proforma Invoice" : "Unduh Invoice"}
              </button>
            </Panel>
          )}
        </div>
      </div>

      {/* Help */}
      <Panel className="mt-10 flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div>
          <h2 className="gs-display text-[22px] font-extrabold text-ink">Ada pertanyaan soal order ini?</h2>
          <p className="mt-1 text-sm text-muted">Admin siap membantu setiap hari, 09:00–21:00 WIB.</p>
        </div>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className={`${buttonClass("primary")} w-full sm:w-auto`}>
          <MessageCircle size={18} /> Hubungi Admin
        </a>
      </Panel>

      {/* Feedback CTA (done orders without a reward yet) */}
      {order.status === "DONE" && !referralCode && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
        >
          <button onClick={() => setIsFeedbackOpen(true)} className={`${buttonClass("primary", "lg")} whitespace-nowrap`}>
            <Gift size={18} /> Beri Ulasan, Dapat Voucher
          </button>
        </motion.div>
      )}

      {/* Feedback & referral dialog */}
      <CMSModal
        isOpen={isFeedbackOpen}
        onClose={() => !submittingFeedback && setIsFeedbackOpen(false)}
        title={referralCode ? "Hadiah untuk Anda" : "Bagikan pengalaman Anda"}
        maxWidth="max-w-lg"
        footer={
          referralCode ? (
            <button onClick={() => copyToClipboard(referralCode)} className={`${buttonClass("primary")} w-full`}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Kode tersalin" : "Salin Kode Voucher"}
            </button>
          ) : (
            <button
              onClick={handleSubmitFeedback}
              disabled={!feedbackText || submittingFeedback}
              className={`${buttonClass("primary")} w-full disabled:opacity-50`}
            >
              {submittingFeedback ? <Loader2 size={16} className="motion-safe:animate-spin" /> : <Gift size={16} />}
              {submittingFeedback ? "Mengirim..." : "Kirim & Dapatkan Voucher"}
            </button>
          )
        }
      >
        {referralCode ? (
          <div className="text-center">
            <img src="/img/voucher-icon.png" alt="" className="mx-auto h-24 w-24 object-contain" />
            <p className="gs-display mt-4 text-[26px] font-extrabold text-ink">
              Terima kasih, {order.full_name.split(" ")[0]}!
            </p>
            <p className="mx-auto mt-2 max-w-[36ch] text-sm leading-relaxed text-muted">
              Gunakan kode ini untuk mendapat <span className="font-semibold text-emerald-700">potongan 5%</span> di
              pesanan berikutnya.
            </p>
            <div className="mt-6 rounded-[16px] border-2 border-dashed border-violet-200 bg-violet-50 px-6 py-6">
              <p className="gs-label text-[10px] text-violet-700">Kode Voucher</p>
              <p className="gs-display mt-2 select-all text-[28px] font-extrabold tracking-wide text-ink">{referralCode}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm leading-relaxed text-muted">
              Kepuasan Anda prioritas kami. Penilaian Anda membantu kami jadi lebih baik.
            </p>
            <fieldset>
              <legend className="gs-label text-[11px] text-muted">Rating</legend>
              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    aria-label={`${star} bintang`}
                    aria-pressed={star <= feedbackRating}
                    className="rounded-full p-1 transition-transform duration-200 hover:scale-110 active:scale-95"
                  >
                    <Star
                      size={30}
                      className={star <= feedbackRating ? "fill-amber-400 text-amber-400" : "text-ink/15"}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-semibold text-ink">{feedbackRating}/5</span>
              </div>
            </fieldset>
            <CMSInput
              isTextArea
              rows={4}
              label="Testimoni"
              placeholder="Tuliskan kesan dan pesan Anda..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
        )}
      </CMSModal>

      <CMSModal
        isOpen={isApproveOpen}
        onClose={() => !approving && setIsApproveOpen(false)}
        title="Setujui draft ini?"
        maxWidth="max-w-md"
        footer={
          <div className="flex w-full flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleApproveDraft}
              disabled={approving}
              className={`${buttonClass("primary")} w-full disabled:opacity-50 sm:w-auto`}
            >
              {approving ? <Loader2 size={16} className="motion-safe:animate-spin" /> : <CheckCircle2 size={16} />}
              {approving ? "Menyimpan..." : "Ya, Setujui"}
            </button>
            <button
              type="button"
              onClick={() => setIsApproveOpen(false)}
              disabled={approving}
              className={`${buttonClass("outline")} w-full sm:w-auto`}
            >
              Kembali
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Setelah disetujui, kami langsung menyiapkan file final dan draft ini tidak bisa direvisi lagi lewat
          halaman ini. Pastikan semuanya sudah sesuai.
        </p>
      </CMSModal>

      <CMSModal
        isOpen={isRevisionOpen}
        onClose={() => !submittingRevision && setIsRevisionOpen(false)}
        title={`Minta Revisi ke-${revisionCount + 1}`}
        maxWidth="max-w-lg"
        footer={
          <button
            type="button"
            onClick={handleSubmitRevision}
            disabled={revisionText.trim().length < 10 || submittingRevision}
            className={`${buttonClass("primary")} w-full disabled:opacity-50`}
          >
            {submittingRevision ? <Loader2 size={16} className="motion-safe:animate-spin" /> : <RefreshCw size={16} />}
            {submittingRevision ? "Mengirim..." : "Kirim Revisi"}
          </button>
        }
      >
        <div className="space-y-4">
          {nextRevisionIsExtra && (
            <p className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
              Jatah revisi paketmu ({revisionQuota}x) sudah terpakai. Revisi ini terhitung sebagai{" "}
              <span className="font-semibold">revisi tambahan</span> dan mungkin dikenakan biaya — kami akan
              konfirmasi dulu sebelum mengerjakannya.
            </p>
          )}
          <p className="text-sm leading-relaxed text-muted">
            Tulis bagian mana saja yang perlu diubah. Makin detail, makin cepat kami kerjakan — misalnya warna,
            teks, posisi elemen, atau referensi (boleh link).
          </p>
          <CMSInput
            isTextArea
            rows={6}
            label="Catatan revisi"
            placeholder={"Contoh:\n1. Warna background diganti krem\n2. Logo diperbesar sedikit\n3. Nomor WA diganti 0812…"}
            value={revisionText}
            maxLength={3000}
            onChange={(e) => setRevisionText(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-muted">
            {revisionText.trim().length < 10
              ? "Minimal 10 karakter."
              : `${revisionText.length}/3000 karakter`}
          </p>
        </div>
      </CMSModal>

      {/* Hidden invoice template for image capture */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, zIndex: -100 }} aria-hidden="true">
        <InvoiceTemplate order={order} packageData={packageData} type={isProforma ? "PROFORMA" : "INVOICE"} />
      </div>
    </ClientPage>
  );
};

export default OrderDetail;
