import React, { useState, useEffect } from "react";
import {
  Save,
  Link as LinkIcon,
  Image as ImageIcon,
  Star,
  Zap,
} from "lucide-react";

import CMSModal from "./Common/CMSModal";
import CMSButton from "./Common/CMSButton";
import CMSInput from "./Common/CMSInput";

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

  const footer = (
    <>
      <CMSButton variant="ghost" type="button" onClick={onClose}>
        Batal
      </CMSButton>
      <CMSButton
        type="submit"
        form="fastworkForm"
        loading={isSubmitting}
        icon={Save}
      >
        Simpan Perubahan
      </CMSButton>
    </>
  );

  return (
    <CMSModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Fastwork Item" : "Tambah Fastwork Item"}
      footer={footer}
      maxWidth="max-w-lg"
    >
      <form
        id="fastworkForm"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        {/* Title */}
        <CMSInput
          label="Judul Layanan"
          placeholder="e.g. Feed Sosial Media Paket Murah"
          {...register("title")}
          error={errors.title?.message}
        />

        {/* URL */}
        <CMSInput
          type="url"
          label="URL Fastwork"
          leftIcon={<LinkIcon size={14} />}
          placeholder="https://fastwork.id/user/..."
          {...register("url")}
          error={errors.url?.message}
        />

        {/* Image URL */}
        <div className="space-y-1">
          <CMSInput
            type="url"
            label="URL Gambar *"
            leftIcon={<ImageIcon size={14} />}
            placeholder="https://storage.googleapis.com/..."
            {...register("image")}
            error={errors.image?.message}
          />
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
          <CMSInput
            type="number"
            min="0"
            max="5"
            step="0.1"
            label="Rating (0–5)"
            leftIcon={<Star size={14} className="text-yellow-500" />}
            {...register("rating", { valueAsNumber: true })}
            error={errors.rating?.message}
          />
          <CMSInput
            type="text"
            label="Animasi Delay"
            placeholder="0 / 0.1s / 0.2s"
            {...register("delay")}
            error={errors.delay?.message}
          />
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
              <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
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
              <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                Tersedia opsi cicilan
              </p>
            </div>
          </label>
        </div>
      </form>
    </CMSModal>
  );
};

export default FastworkModal;
