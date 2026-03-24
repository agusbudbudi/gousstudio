import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Tag, Layout, Palette, List, Plus, Trash2, Shapes } from "lucide-react";

import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { ServiceItem } from "../../types";

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

const DEFAULT_FORM: any = {
  slug: "",
  title: "",
  description: "",
  icon: "Shapes",
  category: "",
  color: "brand",
  included: [],
  order_index: 0,
};

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
}

const ServicesModal: React.FC<ServicesModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<any>(DEFAULT_FORM);
  const [newIncluded, setNewIncluded] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setFormData({ ...DEFAULT_FORM, ...initialData, included: initialData.included || [] });
    } else {
      setFormData(DEFAULT_FORM);
    }
    setNewIncluded("");
  }, [initialData, isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const addIncluded = () => {
    const trimmed = newIncluded.trim();
    if (!trimmed) return;
    setFormData((prev: any) => ({ ...prev, included: [...prev.included, trimmed] }));
    setNewIncluded("");
  };

  const removeIncluded = (index: number) => {
    setFormData((prev: any) => ({ ...prev, included: prev.included.filter((_: any, i: number) => i !== index) }));
  };

  const handleSubmit = (e: FormEvent) => {
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
          className="relative w-full max-w-xl bg-white border border-slate-200/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Shapes className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {initialData ? "Edit Layanan" : "Tambah Layanan"}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  Konfigurasi fitur dan kategori layanan
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Slug ID
                </label>
                <input
                  required
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g. logo"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Kategori
                </label>
                <div className="relative group">
                  <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    required
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Brand Identity"
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Nama Layanan
              </label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Logo Design"
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

            {/* Icon + Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Icon (Lucide)
                </label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold appearance-none focus:outline-none focus:bg-white focus:border-brand-500 transition-all text-sm cursor-pointer"
                  >
                    {ICON_OPTIONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Warna Tema
                </label>
                <div className="relative group">
                  <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none group-focus-within:text-brand-500 transition-colors" />
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold appearance-none focus:outline-none focus:bg-white focus:border-brand-500 transition-all text-sm cursor-pointer"
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Color preview strip */}
                <div
                  className={`h-1.5 rounded-full ${COLOR_OPTIONS.find((c) => c.value === formData.color)?.preview || "bg-slate-200"}`}
                />
              </div>
            </div>

            {/* Included Features */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Fitur yang Disertakan
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 group">
                  <List className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="text"
                    value={newIncluded}
                    onChange={(e) => setNewIncluded(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addIncluded();
                      }
                    }}
                    placeholder="Tambah fitur..."
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={addIncluded}
                  className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all shadow-lg shadow-brand-500/20 cursor-pointer active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {formData.included.map((feat: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl group hover:border-brand-200 transition-all"
                  >
                    <span className="text-sm font-medium text-slate-700 flex-1">
                      {feat}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeIncluded(i)}
                      className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {formData.included.length === 0 && (
                <p className="text-xs text-slate-300 italic px-2">
                  Belum ada fitur ditambahkan.
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

export default ServicesModal;
