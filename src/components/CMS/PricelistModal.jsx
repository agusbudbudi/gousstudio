import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Tag, DollarSign, Clock, CheckSquare, FileText, Layout, RefreshCw, Plus, Trash2 } from "lucide-react";

const PRICE_CATEGORIES = ["Brand Identity", "Print & Digital", "Social Media", "Management"];

const DEFAULT_FORM = {
  slug: "",
  servicename: "",
  description: "",
  category: "Brand Identity",
  retailprice: "",
  finalprice: "",
  duration: "",
  totalrevision: "",
  isrevisionunlimited: false,
  deliverables: [],
  order_index: 0,
};

const PricelistModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [newDeliverable, setNewDeliverable] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...DEFAULT_FORM,
        ...initialData,
        deliverables: initialData.deliverables || [],
      });
    } else {
      setFormData(DEFAULT_FORM);
    }
    setNewDeliverable("");
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const addDeliverable = () => {
    const trimmed = newDeliverable.trim();
    if (!trimmed) return;
    setFormData((prev) => ({ ...prev, deliverables: [...prev.deliverables, trimmed] }));
    setNewDeliverable("");
  };

  const removeDeliverable = (index) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = {
      ...formData,
      retailprice: parseFloat(formData.retailprice) || 0,
      finalprice: parseFloat(formData.finalprice) || 0,
      duration: parseInt(formData.duration) || 1,
      totalrevision: formData.isrevisionunlimited ? 0 : (parseInt(formData.totalrevision) || 0),
    };
    onSave(result);
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
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center shadow-md shadow-brand-500/10">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {initialData ? "Edit Paket Harga" : "Tambah Paket Harga"}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-200/50 text-slate-300 hover:text-slate-900 rounded-full transition-all cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

            {/* Slug + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Slug ID</label>
                <input
                  required
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g. logo-basic"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kategori</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all text-xs cursor-pointer"
                  >
                    {PRICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Layout className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Service Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nama Layanan</label>
              <input
                required
                type="text"
                name="servicename"
                value={formData.servicename}
                onChange={handleChange}
                placeholder="e.g. Logo Design – Professional"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deskripsi</label>
              <textarea
                required
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi singkat layanan ini..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all resize-none placeholder:text-slate-300 text-xs"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Harga Normal (Rp)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    required
                    type="number"
                    name="retailprice"
                    value={formData.retailprice}
                    onChange={handleChange}
                    placeholder="500000"
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Harga Final (Rp)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                  <input
                    required
                    type="number"
                    name="finalprice"
                    value={formData.finalprice}
                    onChange={handleChange}
                    placeholder="349000"
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Duration + Revision */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Durasi (Hari)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    required
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="3"
                    min="1"
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Jml Revisi</label>
                <div className="relative">
                  <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="number"
                    name="totalrevision"
                    value={formData.totalrevision}
                    onChange={handleChange}
                    placeholder="2"
                    min="0"
                    disabled={formData.isrevisionunlimited}
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs disabled:opacity-40"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Revisi Unlimited?</label>
                <label className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 transition-all">
                  <input
                    type="checkbox"
                    name="isrevisionunlimited"
                    checked={formData.isrevisionunlimited}
                    onChange={handleChange}
                    className="w-4 h-4 accent-brand-500"
                  />
                  <span className="text-xs font-bold text-slate-700">Unlimited</span>
                </label>
              </div>
            </div>

            {/* Deliverables */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deliverables</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addDeliverable(); } }}
                    placeholder="Tambah item deliverable..."
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5 mt-2">
                {formData.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg">
                    <span className="text-xs font-medium text-slate-700 flex-1">{d}</span>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(i)}
                      className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {formData.deliverables.length === 0 && (
                  <p className="text-[10px] text-slate-300 italic px-1">Belum ada deliverable ditambahkan.</p>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[9px] transition-all cursor-pointer">
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-all shadow-md shadow-brand-500/10 active:scale-[0.98] flex items-center gap-2 text-[11px] cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Perubahan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PricelistModal;
