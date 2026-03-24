import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Image as ImageIcon,
  Tag,
  Wrench,
  User,
  Link as LinkIcon,
  FileText,
  Layout,
} from "lucide-react";

import { ChangeEvent, FormEvent } from "react";
import { PortfolioItem } from "../../types";

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
  categories: { id: string; label: string; icon: any }[];
  activeTab: string;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  activeTab,
}) => {
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    tags: "",
    imgalt: "",
    linkurl: "",
    image: null,
    role: "",
    tools: "",
    category: activeTab,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tags: (initialData.tags || []).join(", "),
        tools: (initialData.tools || []).join(", "),
        category: initialData.category || activeTab,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        tags: "",
        imgalt: "",
        linkurl: "",
        image: null,
        role: "",
        tools: "",
        category: activeTab,
      });
    }
  }, [initialData, activeTab, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter((t: string) => t !== ""),
      tools: formData.tools
        .split(",")
        .map((t: string) => t.trim())
        .filter((t: string) => t !== ""),
    };
    onSave(result);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
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
          className="relative w-full max-w-xl bg-white border border-slate-200/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Layout className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {initialData ? "Edit Portfolio" : "Tambah Portfolio"}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  Kelola item showcase portfolio
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
            {/* Category Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Kategori Utama
                </label>
                <div className="relative group">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold appearance-none focus:outline-none focus:bg-white focus:border-brand-500 transition-all cursor-pointer text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
                    <Layout className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Judul Project
                </label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Logo Design for Tech Co"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Deskripsi Singkat
              </label>
              <textarea
                required
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan tentang project ini secara ringkas..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-brand-500 transition-all resize-none placeholder:text-slate-300 leading-relaxed text-sm"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Tags (Pisahkan koma)
                </label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Branding, Minimalist"
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Role / Posisi
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Visual Designer"
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Link Gallery / Drive
                </label>
                <div className="relative group">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="url"
                    name="linkurl"
                    value={formData.linkurl}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Tools (Pisahkan koma)
                </label>
                <div className="relative group">
                  <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="text"
                    name="tools"
                    value={formData.tools}
                    onChange={handleChange}
                    placeholder="Photoshop, Illustrator"
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Image Alt Text (SEO)
              </label>
              <div className="relative group">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="text"
                  name="imgalt"
                  value={formData.imgalt}
                  onChange={handleChange}
                  placeholder="e.g. Modern logo design showcase"
                  className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm"
                />
              </div>
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

export default PortfolioModal;
