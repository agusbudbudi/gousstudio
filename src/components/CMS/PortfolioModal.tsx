import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Save,
  Link2,
  X,
  ImagePlus,
  Upload,
} from "lucide-react";
import { upload } from "@vercel/blob/client";

import CMSModal from "./Common/CMSModal";
import CMSInput from "./Common/CMSInput";
import CMSSelect from "./Common/CMSSelect";
import CMSButton from "./Common/CMSButton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { portfolioSchema, PortfolioFormData } from "../../utils/formSchemas";
import { PricelistItem } from "../../types";
import { useToast } from "../../hooks/useToast";
import { resizeImage } from "../../utils/imageUtils";

type SourceMode = "upload" | "url";

const buildUploadPath = (title: string | undefined, ext: string) => {
  const base = (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `portfolio/${base || Math.random().toString(36).substring(2)}.${ext}`;
};

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
  services: { id: number; title: string }[];
  // Preselected service for new items ("" = none)
  defaultServiceId: string;
  pricelists: PricelistItem[];
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  services,
  defaultServiceId,
  pricelists,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      imgalt: "",
      sourceMode: "url",
      linkurl: "",
      image: null,
      role: "",
      tools: "",
      service_id: defaultServiceId,
      pricelist_id: "",
    },
  });

  const sourceMode = watch("sourceMode");

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        sourceMode: initialData.image ? "upload" : "url",
        linkurl: initialData.linkurl || "",
        image: initialData.image || null,
        tags: (initialData.tags || []).join(", "),
        tools: (initialData.tools || []).join(", "),
        service_id: initialData.service_id ? String(initialData.service_id) : defaultServiceId,
        pricelist_id: initialData.pricelist_id ? String(initialData.pricelist_id) : "",
      });
    } else {
      reset({
        title: "",
        description: "",
        tags: "",
        imgalt: "",
        sourceMode: "url",
        linkurl: "",
        image: null,
        role: "",
        tools: "",
        service_id: defaultServiceId,
        pricelist_id: "",
      });
    }
    setPendingFile(null);
    setImagePreview(initialData?.image || null);
  }, [initialData, defaultServiceId, isOpen, reset]);

  // Revoke local object URLs when the preview changes
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const switchSourceMode = (mode: SourceMode) => {
    if (mode === sourceMode) return;
    setValue("sourceMode", mode);
    clearErrors(["linkurl", "image"]);
    // Only one source allowed: clear the other one
    if (mode === "upload") {
      setValue("linkurl", "");
    } else {
      setValue("image", null);
      setPendingFile(null);
      setImagePreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("image", { message: "File harus berupa gambar" });
      return;
    }
    setPendingFile(file);
    setImagePreview(URL.createObjectURL(file));
    clearErrors("image");
  };

  const handleRemoveImage = () => {
    setPendingFile(null);
    setImagePreview(null);
    setValue("image", null);
  };

  const uploadImage = async (file: File, title?: string): Promise<string> => {
    const isGif = file.type === "image/gif";
    const blob = isGif ? file : await resizeImage(file, 1920, 0.85, "image/webp");
    const result = await upload(buildUploadPath(title, isGif ? "gif" : "webp"), blob, {
      access: "public",
      handleUploadUrl: "/api/cms/upload",
      contentType: isGif ? "image/gif" : "image/webp",
    });
    return result.url;
  };

  const onSubmit = async (data: PortfolioFormData) => {
    if (data.sourceMode === "upload" && !pendingFile && !data.image) {
      setError("image", { message: "Upload gambar wajib diisi" });
      return;
    }

    setIsSubmitting(true);
    try {
      let image: string | null = null;
      let linkurl = "";
      if (data.sourceMode === "upload") {
        image = pendingFile ? await uploadImage(pendingFile, data.title) : data.image || null;
      } else {
        linkurl = data.linkurl || "";
      }

      const { sourceMode: _sourceMode, ...fields } = data;
      const result = {
        ...(initialData || {}),
        ...fields,
        image,
        linkurl,
        tags: data.tags
          ? data.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t !== "")
          : [],
        tools: data.tools
          ? data.tools.split(",").map((t: string) => t.trim()).filter((t: string) => t !== "")
          : [],
        slug: (initialData as any)?.slug || null,
        service_id: Number(data.service_id) || null,
      };
      onSave(result);
    } catch (err: any) {
      addToast(`Gagal mengupload gambar: ${err.message}`, "error");
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
            {/* Service + title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CMSSelect
                label="Layanan"
                icon={Layout}
                error={errors.service_id?.message}
                {...register("service_id")}
              >
                <option value="" className="bg-white">
                  Pilih layanan...
                </option>
                {services.map((svc) => (
                  <option key={svc.id} value={String(svc.id)} className="bg-white">
                    {svc.title}
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

            {/* Image source: upload OR gallery/drive link (mutually exclusive) */}
            <div className="space-y-1.5 w-full">
              <label className="text-xs font-bold text-muted block ml-1">
                Gambar Project <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-white border border-ink/10 rounded-full">
                {([
                  { id: "upload", label: "Upload Image", icon: Upload },
                  { id: "url", label: "Link Gallery / Drive", icon: Link2 },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => switchSourceMode(id)}
                    aria-pressed={sourceMode === id}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ${
                      sourceMode === id
                        ? "bg-ink text-paper"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>

              {sourceMode === "url" ? (
                <CMSInput
                  type="text"
                  placeholder="https://drive.google.com/..."
                  {...register("linkurl")}
                  error={errors.linkurl?.message}
                />
              ) : (
                <div>
                  <div className="relative group">
                    <div
                      className="w-full h-48 rounded-[14px] overflow-hidden border border-dashed border-ink/20 bg-paper relative cursor-pointer flex items-center justify-center"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <ImagePlus size={22} className="text-ink/30" />
                          <span className="text-[11px] text-ink/45 font-medium">
                            Klik untuk upload gambar
                          </span>
                        </div>
                      )}

                      {imagePreview && (
                        <div className="absolute inset-0 bg-ink/45 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload size={16} className="!text-white" />
                          <span className="text-[11px] font-bold !text-white">Ganti</span>
                        </div>
                      )}
                    </div>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        aria-label="Hapus gambar" title="Hapus gambar"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 !text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-rose-600 transition-colors cursor-pointer z-10"
                      >
                        <X size={9} />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {errors.image?.message ? (
                    <p className="text-[10px] text-rose-500 font-medium mt-1 ml-1">
                      {errors.image.message}
                    </p>
                  ) : (
                    <p className="text-[10px] text-ink/45 mt-1 ml-1">
                      JPG/PNG/WebP/GIF, maks 10MB. Otomatis di-resize ke lebar 1920px.
                    </p>
                  )}
                </div>
              )}
            </div>

            <CMSSelect
                label="Contoh hasil paket (opsional)"
                icon={Link2}
                error={errors.pricelist_id?.message}
                {...register("pricelist_id")}
              >
                <option value="" className="bg-white">
                  Tidak ditautkan
                </option>
                {pricelists.map((price) => (
                  <option key={price.id} value={price.id} className="bg-white">
                    [{price.service?.title ?? "Lainnya"}] {price.servicename}
                  </option>
                ))}
              </CMSSelect>
            <p className="-mt-1 ml-1 text-xs text-muted">
              Karya akan tampil sebagai contoh hasil di halaman detail paket ini.
            </p>

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
