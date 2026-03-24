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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fastworkSchema, FastworkFormData } from "../../utils/formSchemas";
import { ChangeEvent, FormEvent } from "react";
import { FastworkItem } from "../../types";

// DEFAULT_FORM no longer strictly needed but kept as an empty/default structure.
const DEFAULT_FORM: any = {
  title: "",
  url: "",
  image: "",
  rating: 5,
  rehire: false,
  installment: false,
  delay: "0",
};
interface FastworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
}

const FastworkModal: React.FC<FastworkModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FastworkFormData>({
    resolver: zodResolver(fastworkSchema),
    defaultValues: DEFAULT_FORM,
  });

  const watchImage = watch("image");

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        url: initialData.url || "",
        image: initialData.image || "",
        rating: initialData.rating !== undefined ? Number(initialData.rating) : 5.0,
        rehire: initialData.rehire || false,
        installment: initialData.installment || false,
        delay: initialData.delay || "0",
      });
    } else {
      reset(DEFAULT_FORM);
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (data: FastworkFormData) => {
    setIsSubmitting(true);
    try {
      onSave({ ...(initialData || {}), ...data });
    } finally {
      setIsSubmitting(false);
    }
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
          className="relative w-full max-w-lg bg-white border border-slate-200/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {initialData ? "Edit Fastwork Item" : "Tambah Fastwork Item"}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  Update status dan link Fastwork
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
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Judul Layanan
              </label>
              <input
                type="text"
                placeholder="e.g. Feed Sosial Media Paket Murah"
                {...register("title")}
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.title ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm`}
              />
              {errors.title && <p className="text-rose-400 text-xs mt-1 ml-1 font-medium">{errors.title.message}</p>}
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                URL Fastwork
              </label>
              <div className="relative group">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="url"
                  placeholder="https://fastwork.id/user/..."
                  {...register("url")}
                  className={`pl-11 pr-4 py-2.5 w-full bg-slate-50 border ${errors.url ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm`}
                />
              </div>
              {errors.url && <p className="text-rose-400 text-xs mt-1 ml-1 font-medium">{errors.url.message}</p>}
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                URL Gambar <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="url"
                  placeholder="https://storage.googleapis.com/fastwork-static/..."
                  {...register("image")}
                  className={`pl-11 pr-4 py-2.5 w-full bg-slate-50 border ${errors.image ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm`}
                />
              </div>
              {errors.image && <p className="text-rose-400 text-xs mt-1 ml-1 font-medium">{errors.image.message}</p>}
              {watchImage && (
                <div className="mt-3 w-full h-32 rounded-xl overflow-hidden border border-slate-100 bg-slate-50/50">
                  <img
                    src={watchImage}
                    alt="preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Rating + Delay */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Rating (0–5)
                </label>
                <div className="relative group">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    {...register("rating", { valueAsNumber: true })}
                    className={`pl-11 pr-4 py-2.5 w-full bg-slate-50 border ${errors.rating ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all text-sm`}
                  />
                </div>
                {errors.rating && <p className="text-rose-400 text-xs mt-1 ml-1 font-medium">{errors.rating.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Animasi Delay
                </label>
                <input
                  type="text"
                  placeholder="0 / 0.1s / 0.2s"
                  {...register("delay")}
                  className={`px-4 py-2.5 w-full bg-slate-50 border ${errors.delay ? 'border-rose-500' : 'border-slate-200'} rounded-xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm`}
                />
                {errors.delay && <p className="text-rose-400 text-xs mt-1 ml-1 font-medium">{errors.delay.message}</p>}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 transition-all group">
                <input
                  type="checkbox"
                  {...register("rehire")}
                  className="w-5 h-5 accent-brand-500 rounded-lg"
                />
                <div>
                  <p className="text-sm font-bold text-slate-700">Rehire Rate</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Klien pernah order ulang
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 transition-all group">
                <input
                  type="checkbox"
                  {...register("installment")}
                  className="w-5 h-5 accent-brand-500 rounded-lg"
                />
                <div>
                  <p className="text-sm font-bold text-slate-700">Cicilan</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Tersedia opsi cicilan
                  </p>
                </div>
              </label>
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
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-all shadow-xl shadow-brand-500/20 active:scale-[0.98] flex items-center gap-2.5 text-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FastworkModal;
