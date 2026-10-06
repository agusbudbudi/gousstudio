import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, List, Plus, Trash2, Shapes } from "lucide-react";

import CMSModal from "./Common/CMSModal";
import CMSButton from "./Common/CMSButton";
import CMSInput from "./Common/CMSInput";
import CMSSelect from "./Common/CMSSelect";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { servicesSchema, ServicesFormData } from "../../utils/formSchemas";
import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { ServiceItem } from "../../types";

// DEFAULT_FORM no longer fundamentally needed as defaultValues handles it, but kept structure

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
}

const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServicesFormData>({
    resolver: zodResolver(servicesSchema),
    defaultValues: {
      slug: "",
      title: "",
      description: "",
      icon: "Shapes",
      category: "",
      color: "brand",
    },
  });

  const [included, setIncluded] = useState<string[]>([]);
  const [newIncluded, setNewIncluded] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (initialData) {
      reset({
        slug: initialData.slug || "",
        title: initialData.title || "",
        description: initialData.description || "",
        icon: initialData.icon || "Shapes",
        category: initialData.category || "",
        color: initialData.color || "brand",
      });
      setIncluded(initialData.included || []);
    } else {
      reset({
        slug: "",
        title: "",
        description: "",
        icon: "Shapes",
        category: "",
        color: "brand",
      });
      setIncluded([]);
    }
    setNewIncluded("");
  }, [initialData, isOpen, reset]);

  const addIncluded = () => {
    const trimmed = newIncluded.trim();
    if (!trimmed) return;
    setIncluded((prev) => [...prev, trimmed]);
    setNewIncluded("");
  };

  const removeIncluded = (index: number) => {
    setIncluded((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ServicesFormData) => {
    setIsSubmitting(true);
    try {
      const result = {
        ...(initialData || {}),
        ...data,
        // Not edited in the form anymore (unused on the site); keep stored values or fill defaults
        icon: initialData?.icon || data.icon || "Layers",
        color: initialData?.color || data.color || "brand",
        category: initialData?.category || data.category || data.title,
        included,
      };
      onSave(result);
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
        form="servicesForm"
        loading={isSubmitting}
        icon={Save}
      >
        Simpan Perubahan
      </CMSButton>
    </>
  );

  if (!isOpen) return null;

  return (
    <CMSModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Layanan" : "Tambah Layanan"}
      footer={footer}
      maxWidth="max-w-xl"
    >
      <form
        id="servicesForm"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
        {/* Title + Slug */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px]">
          <CMSInput
            label="Nama Layanan"
            placeholder="e.g. Logo Design"
            {...register("title")}
            error={errors.title?.message}
          />
          <CMSInput
            label="Slug ID"
            placeholder="e.g. logo"
            {...register("slug")}
            error={errors.slug?.message}
            disabled={!!initialData}
          />
        </div>

        {/* Description */}
        <CMSInput
          isTextArea
          rows={3}
          label="Deskripsi"
          placeholder="Deskripsi singkat layanan ini..."
          {...register("description")}
          error={errors.description?.message}
        />

        {/* Included Features */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-ink/70 ml-1">
            Deliverables (tampil di kartu layanan landing)
          </label>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <CMSInput
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
                leftIcon={<List size={14} />}
              />
            </div>
            <CMSButton
              type="button"
              onClick={addIncluded}
              icon={Plus}
              className="!px-3 !py-2.5 h-[42px] shrink-0"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {included.map((feat: string, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-4 py-2.5 bg-paper/50 border border-ink/[0.06] rounded-[10px] group hover:border-violet-200 transition-all"
              >
                <span className="text-sm font-medium text-ink flex-1">
                  {feat}
                </span>
                <CMSButton
                  variant="ghost"
                  type="button"
                  onClick={() => removeIncluded(i)}
                  icon={Trash2}
                  className="!p-1.5 opacity-0 group-hover:opacity-100 text-ink/45 hover:!text-rose-500 hover:!bg-rose-50"
                />
              </div>
            ))}
          </div>
          {included.length === 0 && (
            <p className="text-xs text-ink/45 italic px-2">
              Belum ada fitur ditambahkan.
            </p>
          )}
        </div>
      </form>
    </CMSModal>
  );
};

export default ServicesModal;
