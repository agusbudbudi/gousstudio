import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { CONFIG } from "../config/constants";
import { supabase } from "../utils/supabase";

const OrderModal = () => {
  const {
    isOrderModalOpen: isOpen,
    closeOrderModal: onClose,
    prefillData,
  } = useAppStore();
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    // Matches DB: `orders.selected_package` (pricelists.servicename)
    selected_package: "",
    // Category from pricelists (stored to `orders.design_category`)
    design_category: "",
    brief: "",
    deadline: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // Reset function
  const handleResetAndClose = () => {
    setFormData({
      name: "",
      whatsapp: "",
      selected_package: "",
      design_category: "",
      brief: "",
      deadline: "",
    });
    setIsSubmitted(false);
    setSubmittedOrder(null);
    onClose();
  };

  const [pricelistOptions, setPricelistOptions] = useState([]);
  const [loadingPricelists, setLoadingPricelists] = useState(false);
  const [pricelistsError, setPricelistsError] = useState(null);

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
        setPricelistOptions(data || []);
      } catch (err) {
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

      setFormData((prev) => ({
        ...prev,
        selected_package: prefillData.serviceName || prev.selected_package,
        design_category: prefillData.category || prev.design_category,
        brief: briefText || prev.brief,
        deadline: deadlineStr || prev.deadline,
      }));
    }
  }, [isOpen, prefillData]);

  // When `selected_package` is set by a CTA (including default "Custom Package"),
  // fill derived fields (category + deadline) from the matching pricelist record.
  useEffect(() => {
    if (!isOpen) return;
    if (!pricelistOptions.length) return;

    setFormData((prev) => {
      if (!prev.selected_package) return prev;

      const selectedRow = pricelistOptions.find(
        (p) => p.servicename === prev.selected_package,
      );

      // Fallback for Custom Package if not found in database yet
      if (!selectedRow && prev.selected_package === "Custom Package") {
        const defaultCategory = "Other";
        const defaultDeadline = !prev.deadline
          ? (() => {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() + 7); // Default 7 days for custom
              return targetDate.toISOString().split("T")[0];
            })()
          : prev.deadline;

        if (
          prev.design_category === defaultCategory &&
          prev.deadline === defaultDeadline
        )
          return prev;

        return {
          ...prev,
          design_category: prev.design_category || defaultCategory,
          deadline: defaultDeadline,
        };
      }

      if (!selectedRow) return prev;

      const durationDays = Number(selectedRow.duration ?? 0);

      const autoDeadline =
        !prev.deadline && durationDays > 0
          ? (() => {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() + durationDays);
              return targetDate.toISOString().split("T")[0];
            })()
          : prev.deadline;

      const shouldAutoCategory =
        !prev.design_category || prev.design_category === "Other";
      const autoDesignCategory =
        shouldAutoCategory && selectedRow.category
          ? selectedRow.category
          : prev.design_category;

      const changed =
        autoDeadline !== prev.deadline ||
        autoDesignCategory !== prev.design_category;

      return changed
        ? {
            ...prev,
            deadline: autoDeadline,
            design_category: autoDesignCategory,
          }
        : prev;
    });
  }, [isOpen, pricelistOptions]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleResetAndClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "whatsapp") {
      value = value.replace(/\D/g, "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Manual validation for mandatory fields
    if (!formData.name.trim() || !formData.whatsapp.trim()) {
      alert("Nama Lengkap dan Nomor WhatsApp wajib diisi.");
      return;
    }

    try {
      // First, save to database
      const response = await fetch("/api/save-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderData: formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save order");
      }

      const result = await response.json();
      const savedOrder = result.order;

      // Then send WhatsApp message
      const message = `Halo Gous Studio, saya ingin order desain!

*Nama:* ${formData.name}
*WhatsApp:* ${formData.whatsapp}
*Kebutuhan:* ${formData.selected_package}
*Detail Brief:* ${formData.brief}
*Deadline:* ${formData.deadline}
*Order Number:* ${savedOrder.order_number}`;

      const waUrl = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      // Set Success State instead of closing
      setSubmittedOrder(savedOrder);
      setIsSubmitted(true);
    } catch (error) {
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
          <div className="flex-1 px-6 py-10 md:p-10 flex flex-col items-center justify-center text-center animate-fadeIn scroll-smooth overflow-y-auto">
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
                  <span className="text-emerald-500 font-bold text-[10px] px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
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
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 px-4 py-4 md:p-6 overflow-y-auto">
              <div className="space-y-4 md:space-y-6">
                {/* Nama */}
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors"
                      size={18}
                    />
                    <input
                      required
                      type="text"
                      name="name"
                      placeholder="Masukkan nama Anda"
                      value={formData.name}
                      onChange={handleChange}
                      style={{
                        backgroundColor: "var(--color-glass-bg)",
                        color: "var(--color-text)",
                      }}
                      className="w-full pl-12 pr-4 py-4 text-base md:text-sm rounded-xl border border-white/10 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-all border-[1px]"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors"
                      size={18}
                    />
                    <input
                      required
                      type="tel"
                      name="whatsapp"
                      placeholder="Contoh: 08123456789"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      style={{
                        backgroundColor: "var(--color-glass-bg)",
                        color: "var(--color-text)",
                      }}
                      className="w-full pl-12 pr-4 py-4 text-base md:text-sm rounded-xl border border-white/10 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-all border-[1px]"
                    />
                  </div>
                </div>

                {/* Service Dropdown */}
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                    Kebutuhan Desain <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <MessageSquare
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors"
                      size={18}
                    />
                    <select
                      name="selected_package"
                      value={formData.selected_package}
                      onChange={(e) => {
                        const selected = e.target.value;
                        const selectedRow = pricelistOptions.find(
                          (p) => p.servicename === selected,
                        );

                        setFormData((prev) => ({
                          ...prev,
                          selected_package: selected,
                          design_category:
                            selectedRow?.category ||
                            (selected === "Custom Package"
                              ? "Other"
                              : prev.design_category),
                          // only auto-fill deadline if user hasn't selected one yet
                          deadline: prev.deadline
                            ? prev.deadline
                            : selectedRow?.duration ||
                                (selected === "Custom Package" ? 7 : 0)
                              ? (() => {
                                  const targetDate = new Date();
                                  targetDate.setDate(
                                    targetDate.getDate() +
                                      Number(
                                        selectedRow?.duration ||
                                          (selected === "Custom Package"
                                            ? 7
                                            : 0),
                                      ),
                                  );
                                  return targetDate.toISOString().split("T")[0];
                                })()
                              : prev.deadline,
                        }));
                      }}
                      required
                      style={{
                        backgroundColor: "var(--color-glass-bg)",
                        color: "var(--color-text)",
                      }}
                      className="w-full pl-12 pr-10 py-4 text-base md:text-sm rounded-xl border border-white/10 appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer border-[1px]"
                    >
                      {loadingPricelists ? (
                        <option
                          value=""
                          style={{ backgroundColor: "var(--color-card)" }}
                        >
                          Memuat...
                        </option>
                      ) : (
                        <>
                          <option
                            value=""
                            style={{ backgroundColor: "var(--color-card)" }}
                          >
                            Pilih Paket...
                          </option>

                          {/* Fallback for Custom Package if not in database results */}
                          {!pricelistOptions.some(
                            (p) => p.servicename === "Custom Package",
                          ) && (
                            <option
                              value="Custom Package"
                              style={{ backgroundColor: "var(--color-card)" }}
                            >
                              Custom Package
                            </option>
                          )}

                          {pricelistOptions.map((p) => (
                            <option
                              key={p.servicename}
                              value={p.servicename}
                              style={{
                                backgroundColor: "var(--color-card)",
                                color: "var(--color-text)",
                              }}
                            >
                              {p.servicename}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>

                {pricelistsError && (
                  <p className="text-[10px] text-rose-400 font-bold">
                    Gagal memuat daftar paket: {pricelistsError}
                  </p>
                )}

                {/* Brief */}
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                    Detail Brief <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    name="brief"
                    rows="5"
                    placeholder="Jelaskan kebutuhan desain Anda secara singkat..."
                    value={formData.brief}
                    onChange={handleChange}
                    style={{
                      backgroundColor: "var(--color-glass-bg)",
                      color: "var(--color-text)",
                    }}
                    className="w-full p-4 text-base md:text-sm rounded-xl border border-white/10 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-all resize-none border-[1px]"
                  ></textarea>
                </div>

                {/* Deadline */}
                <div className="relative">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                    Desain Harus Ready Tanggal <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors"
                      size={18}
                    />
                    <input
                      required
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      style={{
                        backgroundColor: "var(--color-glass-bg)",
                        color: "var(--color-text)",
                        boxSizing: "border-box",
                        maxWidth: "100%",
                      }}
                      className="w-full pl-12 pr-4 py-4 text-base md:text-sm rounded-xl border border-white/10 focus:outline-none focus:border-brand-500 transition-all [color-scheme:light] dark:[color-scheme:dark] border-[1px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer Button */}
            <div className="px-2 py-4 md:p-4 border-t border-white/10 bg-gradient-to-t from-[var(--color-card)] to-transparent">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 neon-glow hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Send size={20} /> Kirim ke WhatsApp
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
