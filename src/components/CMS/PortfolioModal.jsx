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

const PortfolioModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  activeTab,
}) => {
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),
      tools: formData.tools
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),
    };
    onSave(result);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          className="relative w-full max-w-xl bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 rounded-md flex items-center justify-center shadow-md shadow-brand-500/10">
                <Layout className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {initialData ? "Edit Portfolio" : "Tambah Portfolio"}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200/50 text-slate-300 hover:text-slate-900 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
          >
            {/* Category Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Kategori Utama
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold appearance-none focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all cursor-pointer text-xs"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Layout className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Judul Project
                </label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Logo Design for Tech Co"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-400 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Deskripsi Singkat
              </label>
              <textarea
                required
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan tentang project ini secara ringkas..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all resize-none placeholder:text-slate-400 leading-relaxed text-xs"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
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
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-400 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
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
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-400 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
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
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-400 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
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
                    className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-400 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
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
                  className="pl-11 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all placeholder:text-slate-400 text-xs"
                />
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
              Simpan Perubahan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PortfolioModal;
