import React, { useState, useEffect } from "react";
import {
  Layout,
  Save,
  Image as ImageIcon,
  Link2,
  X,
  Plus,
} from "lucide-react";

import CMSModal from "./Common/CMSModal";
import CMSInput from "./Common/CMSInput";
import CMSSelect from "./Common/CMSSelect";
import CMSButton from "./Common/CMSButton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { portfolioSchema, PortfolioFormData } from "../../utils/formSchemas";
import { PortfolioItem, PricelistItem } from "../../types";

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
  categories: { id: string; label: string; icon: any }[];
  activeTab: string;
  pricelists: PricelistItem[];
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  activeTab,
  pricelists,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      imgalt: "",
      linkurl: "",
      image: null,
      role: "",
      tools: "",
      category: activeTab,
      pricelist_id: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        tags: (initialData.tags || []).join(", "),
        tools: (initialData.tools || []).join(", "),
        category: initialData.category || activeTab,
        pricelist_id: initialData.pricelist_id ? String(initialData.pricelist_id) : "",
      });
    } else {
      reset({
        title: "",
        description: "",
        tags: "",
        imgalt: "",
        linkurl: "",
        image: null,
        role: "",
        tools: "",
        category: activeTab,
        pricelist_id: "",
      });
    }
  }, [initialData, activeTab, isOpen, reset]);

  const onSubmit = async (data: PortfolioFormData) => {
    setIsSubmitting(true);
    try {
      const result = {
        ...(initialData || {}),
        ...data,
        tags: data.tags
          ? data.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t !== "")
          : [],
        tools: data.tools
          ? data.tools.split(",").map((t: string) => t.trim()).filter((t: string) => t !== "")
          : [],
        slug: (initialData as any)?.slug || null,
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
      <CMSButton type="submit" form="portfolioForm" loading={isSubmitting} icon={Save}>
        Simpan Perubahan
      </CMSButton>
    </>
  );

  if (!isOpen) return null;

  return (
    <CMSModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Portfolio" : "Tambah Portfolio"}
      footer={footer}
      maxWidth="max-w-xl"
    >
      <form
        id="portfolioForm"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3"
      >
            {/* Category Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CMSSelect
                label="Kategori Utama"
                icon={Layout}
                error={errors.category?.message}
                {...register("category")}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-white">
                    {cat.label}
                  </option>
                ))}
              </CMSSelect>
              <CMSInput
                label="Judul Project"
                placeholder="e.g. Logo Design for Tech Co"
                {...register("title")}
                error={errors.title?.message}
              />
            </div>

            {/* Link Gallery - full width below category row */}
            <div className="space-y-1.5 w-full">
              <label className="text-xs font-bold text-slate-500 block ml-1">
                Link Gallery / Drive <span className="text-rose-500">*</span>
              </label>
              <CMSInput
                type="text"
                placeholder="https://drive.google.com/..."
                {...register("linkurl")}
                error={errors.linkurl?.message}
              />
            </div>

            <CMSSelect
                label="Link ke Pricelist (Optional)"
                icon={Link2}
                error={errors.pricelist_id?.message}
                {...register("pricelist_id")}
              >
                <option value="" className="bg-white">
                  None (Tidak ada link)
                </option>
                {pricelists.map((price) => (
                  <option key={price.id} value={price.id} className="bg-white">
                    [{price.category.toUpperCase()}] {price.servicename}
                  </option>
                ))}
              </CMSSelect>

            <CMSInput
              isTextArea
              rows={3}
              label="Deskripsi Singkat"
              placeholder="Jelaskan tentang project ini secara ringkas..."
              {...register("description")}
              error={errors.description?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CMSInput
                label="Tags (Pisahkan koma)"
                placeholder="Branding, Minimalist"
                {...register("tags")}
                error={errors.tags?.message}
              />
              <CMSInput
                label="Role / Posisi"
                placeholder="Visual Designer"
                {...register("role")}
                error={errors.role?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CMSInput
                label="Tools (Pisahkan koma)"
                placeholder="Photoshop, Illustrator"
                {...register("tools")}
                error={errors.tools?.message}
              />
              <CMSInput
                label="Image Alt Text (SEO)"
                placeholder="e.g. Modern logo design showcase"
                {...register("imgalt")}
                error={errors.imgalt?.message}
              />
            </div>
          </form>

    </CMSModal>
  );
};

export default PortfolioModal;
