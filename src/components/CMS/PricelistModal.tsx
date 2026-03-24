import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Tag, DollarSign, Clock, CheckSquare, FileText, Layout, RefreshCw, Plus, Trash2 } from "lucide-react";

import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { PricelistItem } from "../../types";

const PRICE_CATEGORIES = ["Brand Identity", "Print & Digital", "Social Media", "Management"];

const DEFAULT_FORM: any = {
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

interface PricelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
}

const PricelistModal: React.FC<PricelistModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<any>(DEFAULT_FORM);
  const [newDeliverable, setNewDeliverable] = useState<string>("");

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const addDeliverable = () => {
    const trimmed = newDeliverable.trim();
    if (!trimmed) return;
    setFormData((prev: any) => ({ ...prev, deliverables: [...prev.deliverables, trimmed] }));
    setNewDeliverable("");
  };

  const removeDeliverable = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
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
          className="relative w-full max-w-2xl bg-white border border-slate-200/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <DollarSign className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {initialData ? "Edit Paket Harga" : "Tambah Paket Harga"}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  Informasi detail paket layanan
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200/50 text-slate-400 hover:text-slate-900 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar"
          >
            {/* Slug + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Slug ID
                </label>
                <div className="relative group">
                  <input
                    required
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="e.g. logo-basic"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Kategori
                </label>
                <div className="relative group">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold appearance-none focus:outline-none focus:bg-white focus:border-brand-500 transition-all text-sm cursor-pointer"
                  >
                    {PRICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Layout className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* Service Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Nama Layanan
              </label>
              <input
                required
                type="text"
                name="servicename"
                value={formData.servicename}
                onChange={handleChange}
                placeholder="e.g. Logo Design – Professional"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Deskripsi
              </label>
              <textarea
                required
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi singkat layanan ini..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-brand-500 transition-all resize-none placeholder:text-slate-300 text-sm leading-relaxed"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Harga Normal (Rp)
                </label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    required
                    type="number"
                    name="retailprice"
                    value={formData.retailprice}
                    onChange={handleChange}
                    placeholder="500000"
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Harga Final (Rp)
                </label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    required
                    type="number"
                    name="finalprice"
                    value={formData.finalprice}
                    onChange={handleChange}
                    placeholder="349000"
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Duration + Revision */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Durasi (Hari)
                </label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    required
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="3"
                    min="1"
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Jml Revisi
                </label>
                <div className="relative group">
                  <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="number"
                    name="totalrevision"
                    value={formData.totalrevision}
                    onChange={handleChange}
                    placeholder="2"
                    min="0"
                    disabled={formData.isrevisionunlimited}
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm disabled:opacity-40"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Revisi Unlimited?
                </label>
                <label className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 transition-all group">
                  <input
                    type="checkbox"
                    name="isrevisionunlimited"
                    checked={formData.isrevisionunlimited}
                    onChange={handleChange}
                    className="w-5 h-5 accent-brand-500 rounded-lg"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Unlimited
                  </span>
                </label>
              </div>
            </div>

            {/* Deliverables */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Deliverables
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDeliverable();
                      }
                    }}
                    placeholder="Tambah item deliverable..."
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all shadow-lg shadow-brand-500/20 cursor-pointer active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {formData.deliverables.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl group hover:border-brand-200 transition-all"
                  >
                    <span className="text-sm font-medium text-slate-700 flex-1">
                      {d}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(i)}
                      className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {formData.deliverables.length === 0 && (
                <p className="text-xs text-slate-300 italic px-2">
                  Belum ada deliverable ditambahkan.
                </p>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/80 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-all shadow-xl shadow-brand-500/20 active:scale-[0.98] flex items-center gap-2.5 text-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PricelistModal;
