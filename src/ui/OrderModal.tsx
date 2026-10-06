import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "../store/useAppStore";
import { orderSchema, OrderFormData } from "../utils/formSchemas";
import { OrderItem } from "../types";
import { CONFIG } from "../config/constants";
import { formatRupiah, OTHER_GROUP, usePackages } from "../components/landing/useLandingData";
import { parsePackageName } from "../components/landing/PackageCard";
import { WhatsAppIcon } from "../components/landing/primitives";
import PackageCombobox, { CUSTOM_PACKAGE } from "./PackageCombobox";

const CUSTOM_DURATION_DAYS = 7;

const isoDateIn = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const briefTemplate = (serviceName: string, deliverables: string[]) =>
  serviceName === CUSTOM_PACKAGE || deliverables.length === 0
    ? ""
    : `Paket: ${parsePackageName(serviceName).name}\nYang termasuk:\n- ${deliverables.join("\n- ")}\n\nCatatan tambahan:\n`;

const inputClass = (hasError: boolean) =>
  `w-full rounded-2xl border bg-[#fff] px-4 text-[15px] text-ink placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-4 ${
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
      : "border-ink/15 focus:border-violet-600 focus:ring-violet-600/10"
  }`;

const Field: React.FC<{
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ id, label, required, error, hint, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
      {label}
      {required && <span className="ml-0.5 text-violet-600">*</span>}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-rose-600">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-sm text-muted">{hint}</p>
    )}
  </div>
);

const OrderModal = () => {
  const { isOrderModalOpen: isOpen, closeOrderModal, prefillData } = useAppStore();
  const reduce = useReducedMotion();
  const { data: packages = [], isLoading: loadingPackages, isError: packagesError } = usePackages(isOpen);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { name: "", whatsapp: "", selected_package: "", design_category: "", brief: "", deadline: "", voucher_code: "" },
  });

  const [submittedOrder, setSubmittedOrder] = useState<OrderItem | null>(null);
  const [waUrl, setWaUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const selectedName = watch("selected_package");
  const selectedPkg = packages.find((p) => p.serviceName === selectedName);


  // Prefill from the CTA that opened the modal (package card, detail page, or default custom package).
  useEffect(() => {
    if (!isOpen) return;
    setSubmittedOrder(null);
    setSubmitError(null);
    setShowVoucher(false);
    const name: string = prefillData?.serviceName || CUSTOM_PACKAGE;
    const deliverables: string[] = Array.isArray(prefillData?.deliverables) ? prefillData.deliverables : [];
    const duration = Number(prefillData?.duration || (name === CUSTOM_PACKAGE ? CUSTOM_DURATION_DAYS : 0));
    reset({
      name: "",
      whatsapp: "",
      selected_package: name,
      design_category: prefillData?.category || (name === CUSTOM_PACKAGE ? OTHER_GROUP.title : ""),
      brief: briefTemplate(name, deliverables),
      deadline: duration > 0 ? isoDateIn(duration) : "",
      voucher_code: "",
    });
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 250);
    return () => window.clearTimeout(t);
  }, [isOpen, prefillData, reset]);

  const choosePackage = (value: string) => {
    const pkg = packages.find((p) => p.serviceName === value);
    setValue("selected_package", value, { shouldValidate: true, shouldDirty: true });
    setValue("design_category", pkg?.category || OTHER_GROUP.title);
    setValue("deadline", isoDateIn(pkg?.duration || CUSTOM_DURATION_DAYS), { shouldValidate: true });
    if (pkg) setValue("brief", briefTemplate(pkg.serviceName, pkg.deliverables));
  };

  const close = () => {
    reset();
    setSubmittedOrder(null);
    closeOrderModal();
  };

  // Esc to close (same rule as the backdrop: not while the form has unsaved input)
  // + lock page scroll while open.
  const canDismissRef = useRef(true);
  canDismissRef.current = !isDirty || !!submittedOrder;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && canDismissRef.current && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = async (data: OrderFormData) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/orders?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderData: data }),
      });
      if (!response.ok) throw new Error("Failed to save order");
      const { order } = await response.json();

      const message = `Halo Gous Studio, saya ingin order desain!

*Nama:* ${data.name}
*WhatsApp:* ${data.whatsapp}
*Kebutuhan:* ${data.selected_package}
*Detail Brief:* ${data.brief}
*Deadline:* ${data.deadline}
*Order Number:* ${order.order_number}`;
      const url = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(message)}`;
      setWaUrl(url);
      window.open(url, "_blank");
      setSubmittedOrder(order);
    } catch (error) {
      console.error("Error submitting order:", error);
      setSubmitError("Order belum tersimpan karena koneksi bermasalah. Coba kirim lagi, atau chat kami langsung via WhatsApp.");
    }
  };

  const whatsappField = register("whatsapp");
  const voucherField = register("voucher_code");
  const nameField = register("name");
  const display = selectedPkg ? parsePackageName(selectedPkg.serviceName).name : selectedName;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <motion.div
            aria-hidden
            className={`absolute inset-0 bg-ink/55 backdrop-blur-sm ${!isDirty || submittedOrder ? "cursor-pointer" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => (!isDirty || submittedOrder ? close() : undefined)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="gs gs-white relative flex h-[100dvh] w-full flex-col overflow-hidden shadow-[-30px_0_80px_-20px_rgba(11,10,18,0.45)] sm:max-w-[560px] sm:border-l sm:border-ink/10"
          >

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-8 md:pt-7">
              <div>
                <p className="gs-label text-violet-600">{submittedOrder ? "Order diterima" : "Form order"}</p>
                <h2 id="order-modal-title" className="gs-display mt-2 text-[32px] font-extrabold text-ink">
                  {submittedOrder ? "Terima kasih." : "Ceritakan project-mu."}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Tutup form order"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink/40 hover:bg-ink/[0.04]"
              >
                <X size={20} />
              </button>
            </div>

            {submittedOrder ? (
              <div className="flex-1 overflow-y-auto px-6 py-7 md:px-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-[#fff]">
                  <Check size={28} strokeWidth={2.5} />
                </div>
                <p className="mt-5 max-w-[42ch] leading-relaxed text-ink/80">
                  Order kamu sudah tercatat. WhatsApp konfirmasi dibuka di tab baru — kirim pesannya supaya kami bisa
                  langsung mulai.
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-ink/10">
                  <div className="bg-paper p-5">
                    <dt className="gs-label text-muted">Nomor order</dt>
                    <dd className="mt-2 font-mono text-lg font-bold text-ink">#{submittedOrder.order_number}</dd>
                  </div>
                  <div className="bg-paper p-5">
                    <dt className="gs-label text-muted">Paket</dt>
                    <dd className="mt-2 line-clamp-2 font-semibold text-ink">{display}</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-col gap-2">
                  <a
                    href={`/order/${submittedOrder.order_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink font-semibold text-paper transition-colors hover:bg-ink-700"
                  >
                    Lacak pesanan <ArrowUpRight size={18} />
                  </a>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ink/15 font-semibold text-ink transition-colors hover:border-ink/40"
                  >
                    <WhatsAppIcon className="h-5 w-5 text-green-600" /> WhatsApp belum terbuka? Buka lagi
                  </a>
                  <button type="button" onClick={close} className="h-11 text-sm font-semibold text-muted hover:text-ink">
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 md:px-8">
                  {/* Package */}
                  <div>
                    <label htmlFor="order-package" className="mb-2 block text-sm font-semibold text-ink">
                      Kebutuhan desain<span className="ml-0.5 text-violet-600">*</span>
                    </label>
                    <PackageCombobox
                      id="order-package"
                      packages={packages}
                      value={selectedName}
                      onSelect={choosePackage}
                      loading={loadingPackages}
                      invalid={Boolean(errors.selected_package)}
                      describedBy={errors.selected_package ? "order-package-error" : undefined}
                    />
                    {errors.selected_package && (
                      <p id="order-package-error" role="alert" className="mt-1.5 text-sm text-rose-600">
                        {errors.selected_package.message}
                      </p>
                    )}
                    {packagesError && (
                      <p className="mt-1.5 text-sm text-muted">
                        Daftar paket gagal dimuat — pilih Custom Package dan jelaskan kebutuhanmu di brief.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="order-name" label="Nama lengkap" required error={errors.name?.message}>
                      <input
                        id="order-name"
                        autoComplete="name"
                        placeholder="Nama kamu"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "order-name-error" : undefined}
                        className={`${inputClass(Boolean(errors.name))} h-12`}
                        {...nameField}
                        ref={(el) => {
                          nameField.ref(el);
                          firstFieldRef.current = el;
                        }}
                      />
                    </Field>
                    <Field id="order-wa" label="Nomor WhatsApp" required error={errors.whatsapp?.message}>
                      <input
                        id="order-wa"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="08123456789"
                        aria-invalid={Boolean(errors.whatsapp)}
                        aria-describedby={errors.whatsapp ? "order-wa-error" : undefined}
                        className={`${inputClass(Boolean(errors.whatsapp))} h-12`}
                        {...whatsappField}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                          whatsappField.onChange(e);
                        }}
                      />
                    </Field>
                  </div>

                  <Field
                    id="order-brief"
                    label="Detail brief"
                    required
                    error={errors.brief?.message}
                    hint="Ceritakan bisnismu, gaya yang kamu suka, warna, dan referensi (boleh link)."
                  >
                    <textarea
                      id="order-brief"
                      rows={5}
                      placeholder="Contoh: Saya butuh logo untuk kedai kopi di Bekasi, gaya minimalis hangat, warna cokelat & krem…"
                      aria-invalid={Boolean(errors.brief)}
                      aria-describedby={errors.brief ? "order-brief-error" : undefined}
                      className={`${inputClass(Boolean(errors.brief))} resize-y py-3 leading-relaxed`}
                      {...register("brief")}
                    />
                  </Field>

                  <Field
                    id="order-deadline"
                    label="Desain dibutuhkan tanggal"
                    required
                    error={errors.deadline?.message}
                    hint={selectedPkg?.duration ? `Diisi otomatis sesuai durasi paket (${selectedPkg.duration} hari kerja). Boleh diubah.` : undefined}
                  >
                    <input
                      id="order-deadline"
                      type="date"
                      min={isoDateIn(1)}
                      aria-invalid={Boolean(errors.deadline)}
                      className={`${inputClass(Boolean(errors.deadline))} h-12 [color-scheme:light]`}
                      {...register("deadline")}
                    />
                  </Field>

                  {showVoucher ? (
                    <Field id="order-voucher" label="Kode voucher" error={errors.voucher_code?.message}>
                      <input
                        id="order-voucher"
                        placeholder="REFXXXXX"
                        autoFocus
                        className={`${inputClass(Boolean(errors.voucher_code))} h-12 font-mono uppercase tracking-wider`}
                        {...voucherField}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                          voucherField.onChange(e);
                        }}
                      />
                    </Field>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowVoucher(true)}
                      className="text-sm font-semibold text-violet-700 underline-offset-4 hover:underline"
                    >
                      + Punya kode voucher?
                    </button>
                  )}

                  {submitError && (
                    <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                      {submitError}
                    </p>
                  )}
                </div>

                <div className="border-t border-ink/10 bg-[#fff] px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-violet-600 text-base font-semibold text-[#fff] transition-[background-color,transform] hover:bg-violet-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <WhatsAppIcon className="h-5 w-5" />}
                    {isSubmitting ? "Menyimpan order…" : "Kirim order via WhatsApp"}
                  </button>
                  <p className="mt-2.5 text-center text-[13px] text-muted">
                    Order tersimpan dulu, lalu WhatsApp terbuka untuk konfirmasi.
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderModal;
