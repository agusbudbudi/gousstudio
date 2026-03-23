import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Tag, Layout, Palette, List, Plus, Trash2, Shapes } from "lucide-react";

const ICON_OPTIONS = [
  "Image", "Shapes", "Instagram", "TrendingUp", "Star", "Zap", "Palette",
  "Monitor", "ShoppingBag", "FileText", "Briefcase", "Megaphone",
  "Globe", "Camera", "Video", "PenTool", "Layers", "Award"
];

const COLOR_OPTIONS = [
  { value: "brand", label: "Brand (Ungu)", preview: "bg-purple-500" },
  { value: "orange", label: "Orange", preview: "bg-orange-500" },
  { value: "pink", label: "Pink", preview: "bg-pink-500" },
  { value: "blue", label: "Blue", preview: "bg-blue-500" },
  { value: "green", label: "Green", preview: "bg-green-500" },
  { value: "red", label: "Red", preview: "bg-red-500" },
  { value: "yellow", label: "Yellow", preview: "bg-yellow-500" },
  { value: "teal", label: "Teal", preview: "bg-teal-500" },
];

const DEFAULT_FORM = {
  slug: "",
  title: "",
  description: "",
  icon: "Shapes",
  category: "",
  color: "brand",
  included: [],
  order_index: 0,
};

const ServicesModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [newIncluded, setNewIncluded] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({ ...DEFAULT_FORM, ...initialData, included: initialData.included || [] });
    } else {
      setFormData(DEFAULT_FORM);
    }
    setNewIncluded("");
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addIncluded = () => {
    const trimmed = newIncluded.trim();
    if (!trimmed) return;
    setFormData((prev) => ({ ...prev, included: [...prev.included, trimmed] }));
    setNewIncluded("");
  };

  const removeIncluded = (index) => {
    setFormData((prev) => ({ ...prev, included: prev.included.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
          className="relative w-full max-w-xl bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center shadow-md shadow-brand-500/10">
                <Shapes className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {initialData ? "Edit Layanan" : "Tambah Layanan"}
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
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

            {/* Slug + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Slug ID
                </label>
                <input
                  required
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g. logo"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Kategori
                </label>
                <div className="relative">
                  <Layout className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input
                    required
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Brand Identity"
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Nama Layanan
              </label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Logo Design"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Deskripsi
              </label>
              <textarea
                required
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi singkat layanan ini..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all resize-none placeholder:text-slate-300 text-xs"
              />
            </div>

            {/* Icon + Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Icon (Lucide)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all text-xs cursor-pointer"
                  >
                    {ICON_OPTIONS.map((ic) => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Warna Tema
                </label>
                <div className="relative">
                  <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all text-xs cursor-pointer"
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                {/* Color preview strip */}
                <div className={`h-1.5 rounded-full ${COLOR_OPTIONS.find(c => c.value === formData.color)?.preview || 'bg-slate-200'}`} />
              </div>
            </div>

            {/* Included Features */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Fitur yang Disertakan
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <List className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={newIncluded}
                    onChange={(e) => setNewIncluded(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addIncluded(); } }}
                    placeholder="Tambah fitur..."
                    className="pl-9 pr-3 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-300 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={addIncluded}
                  className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5 mt-1">
                {formData.included.map((feat, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg">
                    <span className="text-xs font-medium text-slate-700 flex-1">{feat}</span>
                    <button
                      type="button"
                      onClick={() => removeIncluded(i)}
                      className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {formData.included.length === 0 && (
                  <p className="text-[10px] text-slate-300 italic px-1">Belum ada fitur ditambahkan.</p>
                )}
              </div>
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

export default ServicesModal;
