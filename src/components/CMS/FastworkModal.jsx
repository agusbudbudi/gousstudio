import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Link as LinkIcon,
  Image as ImageIcon,
  Star,
  Zap,
} from "lucide-react";

const DEFAULT_FORM = {
  title: "",
  url: "",
  image: "",
  rating: 5.0,
  rehire: false,
  installment: false,
  delay: "0",
};

const FastworkModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...DEFAULT_FORM, ...initialData });
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, rating: parseFloat(formData.rating) || 5 });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center shadow-md shadow-brand-500/10">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {initialData ? "Edit Fastwork Item" : "Tambah Fastwork Item"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200/50 text-slate-300 hover:text-slate-900 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Judul Layanan
              </label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Feed Sosial Media Paket Murah"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                URL Fastwork
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  required
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://fastwork.id/user/..."
                  className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                URL Gambar
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://storage.googleapis.com/fastwork-static/..."
                  className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                />
              </div>
              {formData.image && (
                <div className="mt-2 w-full h-30 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                  <img
                    src={formData.image}
                    alt="preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Rating + Delay */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Rating (0–5)
                </label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                  <input
                    required
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Animasi Delay
                </label>
                <input
                  type="text"
                  name="delay"
                  value={formData.delay}
                  onChange={handleChange}
                  placeholder="0 / 0.1s / 0.2s"
                  className="px-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 transition-all">
                <input
                  type="checkbox"
                  name="rehire"
                  checked={formData.rehire}
                  onChange={handleChange}
                  className="w-4 h-4 accent-brand-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Rehire Rate
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Klien pernah order ulang
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 transition-all">
                <input
                  type="checkbox"
                  name="installment"
                  checked={formData.installment}
                  onChange={handleChange}
                  className="w-4 h-4 accent-brand-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-700">Cicilan</p>
                  <p className="text-[10px] text-slate-400">
                    Tersedia opsi cicilan
                  </p>
                </div>
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[9px] transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-all shadow-md shadow-brand-500/10 active:scale-[0.98] flex items-center gap-2 text-[11px] cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FastworkModal;
