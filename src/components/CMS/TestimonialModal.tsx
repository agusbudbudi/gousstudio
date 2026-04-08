import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Star,
  FileText,
  Save,
  Eye,
  EyeOff,
  Upload,
  X,
} from "lucide-react";

import CMSModal from "./Common/CMSModal";
import CMSInput from "./Common/CMSInput";
import CMSButton from "./Common/CMSButton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testimonialSchema, TestimonialFormData } from "../../utils/formSchemas";
import { TestimonialItem } from "../../types";

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onUploadAvatar: (file: File) => Promise<string | null>;
  initialData: TestimonialItem | null;
}

const TestimonialModal: React.FC<TestimonialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUploadAvatar,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      title: "",
      rating: 5,
      testimony: "",
      is_show: true,
      avatar_url: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rating = watch("rating");
  const isShow = watch("is_show");
  const avatarUrl = watch("avatar_url");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        title: initialData.title,
        rating: initialData.rating,
        testimony: initialData.testimony,
        is_show: initialData.is_show,
        avatar_url: initialData.avatar_url || "",
      });
      setAvatarPreview(initialData.avatar_url || null);
    } else {
      reset({
        name: "",
        title: "",
        rating: 5,
        testimony: "",
        is_show: true,
        avatar_url: "",
      });
      setAvatarPreview(null);
    }
  }, [initialData, isOpen, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    const uploadedUrl = await onUploadAvatar(file);
    if (uploadedUrl) {
      setValue("avatar_url", uploadedUrl);
    }
  };

  const onSubmit = async (data: TestimonialFormData) => {
    setIsSubmitting(true);
    try {
      onSave({
        ...(initialData || {}),
        ...data,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <CMSButton variant="ghost" type="button" onClick={onClose}>
        Batal
      </CMSButton>
      <CMSButton
        type="submit"
        form="testimonialForm"
        loading={isSubmitting}
        icon={Save}
      >
        Simpan Testimonial
      </CMSButton>
    </>
  );

  return (
    <CMSModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Testimonial" : "Tambah Testimonial"}
      footer={footer}
      maxWidth="max-w-2xl"
    >
      <form
        id="testimonialForm"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avatar
            </label>
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-slate-300" />
                )}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload size={16} />
                  <span className="text-[10px] font-bold mt-1">Ganti</span>
                </button>
              </div>
              
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarPreview(null);
                    setValue("avatar_url", "");
                  }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-[10px] text-slate-400 text-center">
              PNG/JPG, Maks 2MB
            </p>
          </div>

          <div className="flex-1 space-y-4">
            <CMSInput
              label="Nama Lengkap"
              placeholder="e.g. John Doe"
              {...register("name")}
              error={errors.name?.message}
              leftIcon={<User size={14} />}
            />

            <CMSInput
              label="Gelar / Jabatan"
              placeholder="e.g. Founder of Creative Studio"
              {...register("title")}
              error={errors.title?.message}
            />
          </div>
        </div>

        {/* Star Rating */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            Rating
          </label>
          <div className="flex items-center gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 w-fit">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue("rating", star)}
                className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={24}
                  className={`${
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm font-black text-slate-700">
              {rating}.0
            </span>
          </div>
          {errors.rating && (
            <p className="text-xs text-rose-500 mt-1">{errors.rating.message}</p>
          )}
        </div>

        {/* Testimony Text */}
        <CMSInput
          isTextArea
          rows={4}
          label="Testimoni"
          placeholder="Tuliskan pengalaman klien di sini..."
          {...register("testimony")}
          error={errors.testimony?.message}
        />

        {/* Visibility Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
            Status Tampilan
          </label>
          <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setValue("is_show", true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                isShow
                  ? "bg-emerald-500 !text-white shadow-sm shadow-emerald-500/30"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Eye size={14} />
              Ya, Tampilkan
            </button>
            <button
              type="button"
              onClick={() => setValue("is_show", false)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                !isShow
                  ? "bg-slate-500 !text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <EyeOff size={14} />
              Sembunyikan
            </button>
          </div>
          <p className="text-[11px] text-slate-500 ml-1">
            {isShow
              ? "Testimonial ini akan muncul di halaman depan website."
              : "Testimonial ini hanya disimpan di database (draft)."}
          </p>
        </div>
      </form>
    </CMSModal>
  );
};

export default TestimonialModal;
