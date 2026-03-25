import React, { useState, useEffect } from "react";
import { Layout, FileText, Plus, Trash2, Save } from "lucide-react";

import CMSModal from "./Common/CMSModal";
import CMSInput from "./Common/CMSInput";
import CMSSelect from "./Common/CMSSelect";
import CMSButton from "./Common/CMSButton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pricelistSchema, PricelistFormData } from "../../utils/formSchemas";
import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { PricelistItem } from "../../types";

const PRICE_CATEGORIES = ["Brand Identity", "Print & Digital", "Social Media", "Management"];

// DEFAULT_FORM no longer needed heavily due to RHF defaultValues, but keeping categories

interface PricelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
}

const PricelistModal: React.FC<PricelistModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PricelistFormData>({
    resolver: zodResolver(pricelistSchema),
    defaultValues: {
      slug: "",
      servicename: "",
      description: "",
      category: "Brand Identity",
      retailprice: 0,
      finalprice: 0,
      duration: 1,
      totalrevision: 0,
      isrevisionunlimited: false,
    } as PricelistFormData,
  });

  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUnlimited = watch("isrevisionunlimited");

  useEffect(() => {
    if (initialData) {
      reset({
        slug: initialData.slug || "",
        servicename: initialData.servicename || "",
        description: initialData.description || "",
        category: initialData.category || "Brand Identity",
        retailprice: Number(initialData.retailprice) || 0,
        finalprice: Number(initialData.finalprice) || 0,
        duration: Number(initialData.duration) || 1,
        totalrevision: Number(initialData.totalrevision) || 0,
        isrevisionunlimited: initialData.isrevisionunlimited || false,
      });
      setDeliverables(initialData.deliverables || []);
    } else {
      reset({
        slug: "",
        servicename: "",
        description: "",
        category: "Brand Identity",
        retailprice: 0,
        finalprice: 0,
        duration: 1,
        totalrevision: 0,
        isrevisionunlimited: false,
      });
      setDeliverables([]);
    }
    setNewDeliverable("");
  }, [initialData, isOpen, reset]);

  const addDeliverable = () => {
    const trimmed = newDeliverable.trim();
    if (!trimmed) return;
    setDeliverables((prev) => [...prev, trimmed]);
    setNewDeliverable("");
  };

  const removeDeliverable = (index: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PricelistFormData) => {
    setIsSubmitting(true);
    try {
      const result = {
        ...(initialData || {}),
        ...data,
        totalrevision: data.isrevisionunlimited ? 0 : data.totalrevision,
        deliverables,
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
      <CMSButton type="submit" form="pricelistForm" loading={isSubmitting} icon={Save}>
        Simpan Perubahan
      </CMSButton>
    </>
  );

  return (
    <CMSModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Paket Harga" : "Tambah Paket Harga"}
      footer={footer}
      maxWidth="max-w-3xl"
    >
      <form
        id="pricelistForm"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
            {/* Slug + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CMSInput
                label="Slug ID"
                placeholder="e.g. logo-basic"
                {...register("slug")}
                error={errors.slug?.message}
              />
              <CMSSelect
                label="Kategori"
                icon={Layout}
                error={errors.category?.message}
                {...register("category")}
              >
                {PRICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </CMSSelect>
            </div>

            {/* Service Name */}
            <CMSInput
              label="Nama Layanan"
              placeholder="e.g. Logo Design – Professional"
              {...register("servicename")}
              error={errors.servicename?.message}
            />

            {/* Description */}
            <CMSInput
              isTextArea
              rows={3}
              label="Deskripsi"
              placeholder="Deskripsi singkat layanan ini..."
              {...register("description")}
              error={errors.description?.message}
            />

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <CMSInput
                type="number"
                label="Harga Normal (Rp)"
                placeholder="500000"
                {...register("retailprice", { valueAsNumber: true })}
                error={errors.retailprice?.message}
              />
              <CMSInput
                type="number"
                label="Harga Final (Rp)"
                placeholder="349000"
                {...register("finalprice", { valueAsNumber: true })}
                error={errors.finalprice?.message}
              />
            </div>

            {/* Duration + Revision */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <CMSInput
                type="number"
                label="Durasi (Hari)"
                placeholder="3"
                min="1"
                {...register("duration", { valueAsNumber: true })}
                error={errors.duration?.message}
              />
              <CMSInput
                type="number"
                label="Jml Revisi"
                placeholder="2"
                min="0"
                disabled={isUnlimited}
                {...register("totalrevision", { valueAsNumber: true })}
                error={errors.totalrevision?.message}
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Revisi Unlimited?
                </label>
                <label className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 transition-all group">
                  <input
                    type="checkbox"
                    {...register("isrevisionunlimited")}
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
              <label className="text-xs font-bold text-slate-500 ml-1">
                Deliverables
              </label>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <CMSInput
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDeliverable();
                      }
                    }}
                    placeholder="Tambah item deliverable..."
                    leftIcon={<FileText size={14} />}
                  />
                </div>
                <CMSButton
                  type="button"
                  onClick={addDeliverable}
                  icon={Plus}
                  className="!px-3 !py-2.5 h-[42px] shrink-0"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {deliverables.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl group hover:border-brand-200 transition-all"
                  >
                    <span className="text-sm font-medium text-slate-700 flex-1">
                      {d}
                    </span>
                    <CMSButton
                      variant="ghost"
                      type="button"
                      onClick={() => removeDeliverable(i)}
                      icon={Trash2}
                      className="!p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:!text-rose-500 hover:!bg-rose-50"
                    />
                  </div>
                ))}
              </div>
              {deliverables.length === 0 && (
                <p className="text-xs text-slate-300 italic px-2">
                  Belum ada deliverable ditambahkan.
                </p>
              )}
            </div>
          </form>
    </CMSModal>
  );
};

export default PricelistModal;
