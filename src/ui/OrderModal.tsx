import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  X,
  Send,
  Calendar,
  MessageSquare,
  User,
  Phone,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Tag,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CMSCombobox, {
  ComboboxOption,
} from "../components/CMS/Common/CMSCombobox";
import CMSInput from "../components/CMS/Common/CMSInput";
import { useAppStore } from "../store/useAppStore";
import { orderSchema, OrderFormData } from "../utils/formSchemas";
import { PricelistItem, OrderItem } from "../types";
import { supabase } from "../utils/supabase";
import { CONFIG } from "../config/constants";

const OrderModal = () => {
  const {
    isOrderModalOpen: isOpen,
    closeOrderModal: onClose,
    prefillData,
  } = useAppStore();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
      selected_package: "",
      design_category: "",
      brief: "",
      deadline: "",
    },
  });

  const selectedPackage = watch("selected_package");
  const currentCategory = watch("design_category");
  const currentDeadline = watch("deadline");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderItem | null>(null);

  // Reset function
  const handleResetAndClose = () => {
    reset();
    setIsSubmitted(false);
    setSubmittedOrder(null);
    onClose();
  };

  const [pricelistOptions, setPricelistOptions] = useState<PricelistItem[]>([]);
  const [loadingPricelists, setLoadingPricelists] = useState(false);
  const [pricelistsError, setPricelistsError] = useState<string | null>(null);

  // Fetch pricelists to build "Kebutuhan Desain" dropdown.
  useEffect(() => {
    if (!isOpen) return;

    // Always start with form (reset if coming from a previous success state)
    setIsSubmitted(false);
    setSubmittedOrder(null);

    let cancelled = false;
    const fetchPricelists = async () => {
      try {
        setLoadingPricelists(true);
        setPricelistsError(null);
        const { data, error } = await supabase
          .from("pricelists")
          .select("*")
          .order("order_index", { ascending: true });

        if (error) throw error;

        if (cancelled) return;
        setPricelistOptions((data as PricelistItem[]) || []);
      } catch (err: any) {
        if (!cancelled)
          setPricelistsError(err?.message || "Failed to load pricelists");
      } finally {
        if (!cancelled) setLoadingPricelists(false);
      }
    };

    fetchPricelists();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Prefill effect
  useEffect(() => {
    if (isOpen && prefillData) {
      const deliverables = Array.isArray(prefillData.deliverables)
        ? prefillData.deliverables
        : [];

      const briefText = `Package: ${
        prefillData.serviceName
      }\nDeliverables:\n- ${deliverables.join("\n- ")}`;

      // Calculate auto-deadline
      let deadlineStr = "";
      if (prefillData.duration) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + prefillData.duration);
        deadlineStr = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      setValue("selected_package", prefillData.serviceName || selectedPackage);
      setValue("design_category", prefillData.category || currentCategory);
      setValue("brief", briefText || watch("brief"));
      setValue("deadline", deadlineStr || currentDeadline);
    }
  }, [isOpen, prefillData, setValue]);

  // When `selected_package` is set by a CTA (including default "Custom Package"),
  // fill derived fields (category + deadline) from the matching pricelist record.
  useEffect(() => {
    if (!isOpen) return;
    if (!pricelistOptions.length) return;
    if (!selectedPackage) return;

    const selectedRow = pricelistOptions.find(
      (p) => p.servicename === selectedPackage,
    );

    // Fallback for Custom Package if not found in database yet
    if (!selectedRow && selectedPackage === "Custom Package") {
      const defaultCategory = "Other";
      const defaultDeadline = !currentDeadline
        ? (() => {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 7); // Default 7 days for custom
            return targetDate.toISOString().split("T")[0];
          })()
        : currentDeadline;

      if (
        currentCategory === defaultCategory &&
        currentDeadline === defaultDeadline
      )
        return;

      setValue("design_category", currentCategory || defaultCategory);
      setValue("deadline", defaultDeadline);
      return;
    }

    if (!selectedRow) return;

    const durationDays = Number(selectedRow.duration ?? 0);

    const autoDeadline =
      !currentDeadline && durationDays > 0
        ? (() => {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + durationDays);
            return targetDate.toISOString().split("T")[0];
          })()
        : currentDeadline;

    const shouldAutoCategory = !currentCategory || currentCategory === "Other";
    const autoDesignCategory =
      shouldAutoCategory && selectedRow.category
        ? selectedRow.category
        : currentCategory;

    if (autoDeadline !== currentDeadline) {
      setValue("deadline", autoDeadline);
    }
    if (autoDesignCategory !== currentCategory) {
      setValue("design_category", autoDesignCategory);
    }
  }, [
    isOpen,
    pricelistOptions,
    selectedPackage,
    currentCategory,
    currentDeadline,
    setValue,
  ]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleResetAndClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prepare options for Combobox
  const comboboxOptions: ComboboxOption[] = [
    ...(!pricelistOptions.some((p) => p.servicename === "Custom Package")
      ? [
          {
            label: "Custom Package",
            value: "Custom Package",
            description: "Project desain kustom sesuai kebutuhan Anda",
          },
        ]
      : []),
    ...pricelistOptions.map((p) => ({
      label: p.servicename || "No Name",
      value: p.servicename || "No Value",
      description: p.category || "",
      rightElement: (
        <span className="text-[10px] font-black text-brand-500/80 bg-brand-500/5 px-2 py-0.5 rounded border border-brand-500/10">
          {p.duration} Hari
        </span>
      ),
    })),
  ];

  if (!isOpen) return null;

  const onSubmit = async (data: OrderFormData) => {
    try {
      // First, save to database
      const response = await fetch("/api/orders?action=create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderData: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save order");
      }

      const result = await response.json();
      const savedOrder = result.order;

      // Then send WhatsApp message
      const message = `Halo Gous Studio, saya ingin order desain!

*Nama:* ${data.name}
*WhatsApp:* ${data.whatsapp}
*Kebutuhan:* ${data.selected_package}
*Detail Brief:* ${data.brief}
*Deadline:* ${data.deadline}
*Order Number:* ${savedOrder.order_number}`;

      const waUrl = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      // Set Success State instead of closing
      setSubmittedOrder(savedOrder);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting order:", error);
      alert("Terjadi kesalahan saat menyimpan order. Silakan coba lagi.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex md:items-center md:justify-center items-end p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="neon-border border-white/10 w-full md:max-w-lg rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl animate-scaleIn relative flex flex-col max-h-[80vh] md:max-h-[90vh]"
        style={{ backgroundColor: "var(--color-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bottom Sheet Drag Handle (Mobile Only) */}
        <div className="md:hidden flex justify-center pt-2 pb-2">
          <div className="w-12 h-1 rounded-full bg-white/20"></div>
        </div>

        <div
          className="px-4 py-4 md:px-6 md:py-4 pt-0 border-b border-white/10 flex items-center justify-between"
          style={{ backgroundColor: "var(--color-glass-bg)" }}
        >
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isSubmitted ? "Pesanan Diterima!" : "Form Order Desain"}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {isSubmitted
                ? "Terima kasih telah memilih Gous Studio"
                : "Lengkapi detail project Anda"}
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            aria-label="Close Modal"
            className="p-3 rounded-2xl hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center animate-fadeIn scroll-smooth overflow-y-auto">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 neon-glow shadow-emerald-500/20 shadow-lg border border-emerald-500/20">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Order Berhasil Dibuat!
            </h3>
            <p className="text-slate-400 text-sm mb-8 max-w-[320px] leading-relaxed">
              Pesanan Anda telah tercatat dalam sistem kami. WhatsApp konfirmasi
              juga telah dibuka di tab baru.
            </p>

            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                    Order ID
                  </span>
                  <span className="text-brand-400 font-mono font-bold text-lg">
                    #{submittedOrder?.order_number}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-1">
                    Status
                  </span>
                  <span className="text-emerald-500 font-bold text-[12px] px-3 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                    DIKIRIM
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-4 font-medium italic">
                  Gunakan link di bawah ini untuk memantau progres desain Anda
                  secara real-time:
                </p>
                <a
                  href={`/order/${submittedOrder?.order_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/5 hover:border-white/20 group w-full"
                >
                  <ExternalLink
                    size={14}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span>Lacak Pesanan Saya</span>
                </a>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-xl shadow-brand-500/20 active:scale-[0.98] text-sm cursor-pointer"
            >
              Selesai & Tutup
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 px-4 py-4 md:p-6 overflow-y-auto">
              <div className="space-y-4 md:space-y-6">
                {/* Nama */}
                <CMSInput
                  label="Nama Lengkap"
                  required
                  leftIcon={<User size={18} />}
                  placeholder="Masukkan nama Anda"
                  {...register("name")}
                  error={errors.name?.message}
                  variant="glass"
                />

                {/* WhatsApp */}
                <CMSInput
                  label="Nomor WhatsApp"
                  required
                  leftIcon={<Phone size={18} />}
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  {...register("whatsapp")}
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/\D/g, "");
                    register("whatsapp").onChange(e);
                  }}
                  error={errors.whatsapp?.message}
                  variant="glass"
                />

                {/* Service Dropdown */}
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                    Kebutuhan Desain <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <Controller
                      name="selected_package"
                      control={control}
                      render={({ field }) => (
                        <CMSCombobox
                          placeholder={
                            loadingPricelists
                              ? "Memuat paket..."
                              : "Klik untuk mencari paket desain..."
                          }
                          leftIcon={<MessageSquare size={18} />}
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                          }}
                          onSelectOption={(opt) => {
                            const selected = opt.value;
                            const selectedRow = pricelistOptions.find(
                              (p) => p.servicename === selected,
                            );

                            setValue(
                              "design_category",
                              selectedRow?.category ||
                                (selected === "Custom Package"
                                  ? "Other"
                                  : currentCategory),
                            );

                            // auto-fill deadline only if user hasn't selected one
                            const durationDays = Number(
                              selectedRow?.duration ||
                                (selected === "Custom Package" ? 7 : 0),
                            );
                            if (durationDays > 0) {
                              const targetDate = new Date();
                              targetDate.setDate(
                                targetDate.getDate() + durationDays,
                              );
                              setValue(
                                "deadline",
                                targetDate.toISOString().split("T")[0],
                              );
                            }
                          }}
                          options={comboboxOptions}
                          disabled={loadingPricelists}
                          variant="glass"
                        />
                      )}
                    />
                  </div>
                  {errors.selected_package && (
                    <p className="text-rose-400 text-xs mt-1 ml-1 font-medium">
                      {errors.selected_package.message}
                    </p>
                  )}
                </div>

                {pricelistsError && (
                  <p className="text-[10px] text-rose-400 font-bold">
                    Gagal memuat daftar paket: {pricelistsError}
                  </p>
                )}

                {/* Brief */}
                <CMSInput
                  label="Detail Brief"
                  required
                  isTextArea
                  rows={4}
                  placeholder="Jelaskan kebutuhan desain Anda secara singkat..."
                  {...register("brief")}
                  error={errors.brief?.message}
                  variant="glass"
                />

                {/* Deadline */}
                <CMSInput
                  label="Desain Harus Ready Tanggal"
                  required
                  leftIcon={<Calendar size={18} />}
                  type="date"
                  {...register("deadline")}
                  error={errors.deadline?.message}
                  variant="glass"
                  className="[color-scheme:light] dark:[color-scheme:dark]"
                />

                {/* Voucher Code */}
                <CMSInput
                  label="Kode Voucher (Opsional)"
                  leftIcon={<Tag size={18} />}
                  placeholder="Contoh: REFXXXXX"
                  {...register("voucher_code")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                    register("voucher_code").onChange(e);
                  }}
                  error={errors.voucher_code?.message}
                  variant="glass"
                />
              </div>
            </div>

            {/* Fixed Footer Button */}
            <div className="px-2 py-4 md:p-4 border-t border-white/10 bg-gradient-to-t from-[var(--color-card)] to-transparent">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 neon-glow hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
              >
                <Send size={20} />{" "}
                {isSubmitting ? "Mengirim..." : "Kirim ke WhatsApp"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
