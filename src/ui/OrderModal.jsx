import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Calendar,
  MessageSquare,
  User,
  Phone,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { CONFIG } from "../config/constants";

const OrderModal = () => {
  const { isOrderModalOpen: isOpen, closeOrderModal: onClose, prefillData } = useAppStore();
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    service: "Logo Design",
    brief: "",
    deadline: "",
  });

  // Prefill effect
  useEffect(() => {
    if (isOpen && prefillData) {
      const briefText = `Package: ${
        prefillData.serviceName
      }\nDeliverables:\n- ${prefillData.deliverables.join("\n- ")}`;

      // Calculate auto-deadline
      let deadlineStr = "";
      if (prefillData.duration) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + prefillData.duration);
        deadlineStr = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      setFormData((prev) => ({
        ...prev,
        service:
          prefillData.category === "Management"
            ? "Sosmed Management"
            : prefillData.category === "Print & Digital"
            ? "Poster Design"
            : prefillData.category === "Social Media"
            ? "Social Media Design"
            : prefillData.category || prev.service,
        brief: briefText || prev.brief,
        deadline: deadlineStr || prev.deadline,
      }));
    }
  }, [isOpen, prefillData]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const services = [
    "Logo Design",
    "Brand Identity",
    "Social Media Design",
    "Poster Design",
    "Sosmed Management",
    "Other",
  ];

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "whatsapp") {
      value = value.replace(/\D/g, "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = `Halo Gous Studio, saya ingin order desain!

*Nama:* ${formData.name}
*WhatsApp:* ${formData.whatsapp}
*Kebutuhan:* ${formData.service}
*Detail Brief:* ${formData.brief}
*Deadline:* ${formData.deadline}`;

    const waUrl = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="neon-border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scaleIn relative"
        style={{ backgroundColor: "var(--color-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-8 border-b border-white/10 flex items-center justify-between"
          style={{ backgroundColor: "var(--color-glass-bg)" }}
        >
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Form Order Desain
            </h3>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">
              Lengkapi detail project Anda
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="p-3 rounded-2xl hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Nama */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                Nama Lengkap
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
                    backgroundColor: "var(--color-border-adaptive)",
                    color: "var(--color-text)",
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                Nomor WhatsApp
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
                    backgroundColor: "var(--color-border-adaptive)",
                    color: "var(--color-text)",
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Service Dropdown */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                Kebutuhan Desain
              </label>
              <div className="relative group">
                <MessageSquare
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors"
                  size={18}
                />
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  style={{
                    backgroundColor: "var(--color-border-adaptive)",
                    color: "var(--color-text)",
                  }}
                  className="w-full pl-12 pr-10 py-4 rounded-2xl border border-white/10 appearance-none focus:outline-none focus:border-brand-500 transition-all cursor-pointer shadow-inner"
                >
                  {services.map((s) => (
                    <option
                      key={s}
                      value={s}
                      style={{
                        backgroundColor: "var(--color-card)",
                        color: "var(--color-text)",
                      }}
                    >
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            {/* Brief */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                Detail Brief
              </label>
              <textarea
                required
                name="brief"
                rows="3"
                placeholder="Jelaskan kebutuhan desain Anda secara singkat..."
                value={formData.brief}
                onChange={handleChange}
                style={{
                  backgroundColor: "var(--color-border-adaptive)",
                  color: "var(--color-text)",
                }}
                className="w-full p-4 rounded-2xl border border-white/10 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-all resize-none shadow-inner"
              ></textarea>
            </div>

            {/* Deadline */}
            <div className="relative">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 ml-1">
                Desain Harus Ready Tanggal
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
                    backgroundColor: "var(--color-border-adaptive)",
                    color: "var(--color-text)",
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 focus:outline-none focus:border-brand-500 transition-all shadow-inner [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 neon-glow hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Send size={20} /> Kirim ke WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
