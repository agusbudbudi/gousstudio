import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../utils/supabase";
import {
  Loader2,
  X,
  Save,
  User,
  Phone,
  Building2,
  FileText,
  ImagePlus,
  Upload,
  Trash2,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import { ClientItem } from "../../types";
import CMSInput from "./Common/CMSInput";
import CMSButton from "./Common/CMSButton";
import CMSModal from "./Common/CMSModal";
import { compressAndCropImageRect } from "../../utils/imageUtils";

const clientSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  phone_number: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: ClientItem) => void;
  initialData?: ClientItem | null;
}

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<ClientItem>>({
    full_name: "",
    phone_number: "",
    company: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPhotoPreview(initialData.photo_url || null);
    } else {
      setFormData({
        full_name: "",
        phone_number: "",
        company: "",
        notes: "",
      });
      setPhotoPreview(null);
    }
    setPendingPhotoFile(null);
    setRemovingPhoto(false);
    setValidationErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ClientItem, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setPendingPhotoFile(file);
    setRemovingPhoto(false);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPendingPhotoFile(null);
    setRemovingPhoto(true);
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const isPng = file.type === "image/png";
      const outputFormat = isPng ? "image/png" : "image/jpeg";
      const fileExt = isPng ? "png" : "jpg";

      const compressedBlob = await compressAndCropImageRect(
        file,
        352,  // 2× display size for sharpness
        160,
        0.92,
        outputFormat,
      );
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `clients/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressedBlob, { contentType: outputFormat });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      addToast(`Gagal mengupload foto: ${err.message}`, "error");
      return null;
    }
  };

  const handleSave = async () => {
    const result = clientSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errors[issue.path[0].toString()] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    try {
      // Handle photo upload if a new file was selected
      let finalPhotoUrl = initialData?.photo_url || null;

      if (pendingPhotoFile) {
        const uploaded = await uploadPhoto(pendingPhotoFile);
        if (uploaded) finalPhotoUrl = uploaded;
      } else if (removingPhoto) {
        finalPhotoUrl = null;
      }

      const payload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number || null,
        company: formData.company || null,
        notes: formData.notes || null,
        photo_url: finalPhotoUrl,
      };

      if (!initialData || initialData.id === "NEW") {
        const res = await fetch("/api/cms/clients?action=create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload }),
        });
        const result = await res.json();
        if (!res.ok)
          throw new Error(result.message || "Failed to create client");
        addToast("Client berhasil ditambahkan.", "success");
        onSuccess(result.data as ClientItem);
      } else {
        const res = await fetch("/api/cms/clients?action=update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: initialData.id, updates: payload }),
        });
        const result = await res.json();
        if (!res.ok)
          throw new Error(result.message || "Failed to update client");
        addToast("Data client berhasil diperbarui.", "success");
        onSuccess({ ...initialData, ...payload } as ClientItem);
      }
      onClose();
    } catch (err: any) {
      addToast(`Gagal menyimpan: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CMSModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData && initialData.id !== "NEW"
          ? "Edit Data Client"
          : "Tambah Client Baru"
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <CMSButton variant="ghost" onClick={onClose}>
            Batal
          </CMSButton>
          <CMSButton onClick={handleSave} loading={saving} icon={Save}>
            Simpan Perubahan
          </CMSButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top section: Left = Photo | Right = Nama Lengkap + WhatsApp */}
        <div className="flex gap-4">
          {/* Left column: Photo upload only */}
          <div className="flex flex-col gap-1.5 shrink-0 w-60">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Foto / Logo
            </label>
            <div className="relative group">
              {/* Zone: 160px wide, 176:80 ratio → ~73px tall */}
              <div
                className="w-full rounded-xl overflow-hidden border border-dashed border-slate-300 bg-slate-50 relative cursor-pointer flex items-center justify-center"
                style={{ aspectRatio: "176 / 80" }}
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImagePlus size={18} className="text-slate-300" />
                    <span className="text-[9px] text-slate-400 font-medium">
                      Upload foto
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload size={14} className="text-white" />
                  <span className="text-[9px] font-bold !text-white">
                    Ganti
                  </span>
                </div>
              </div>

              {/* Remove button */}
              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title="Hapus foto"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 !text-white rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-rose-600 transition-colors cursor-pointer z-10"
                >
                  <X size={9} />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              JPG/PNG, dipotong otomatis 176×80
            </p>
          </div>

          {/* Right column: Nama Lengkap + WhatsApp stacked */}
          <div className="flex-1 flex flex-col gap-3">
            <CMSInput
              label="Nama Lengkap"
              leftIcon={<User size={14} />}
              error={validationErrors.full_name}
              placeholder="Masukkan nama lengkap client..."
              value={formData.full_name || ""}
              onChange={(e) => handleChange("full_name", e.target.value)}
              required
            />
            <CMSInput
              label="No. WhatsApp"
              leftIcon={<Phone size={14} />}
              placeholder="08123xxx"
              value={formData.phone_number || ""}
              onChange={(e) => handleChange("phone_number", e.target.value)}
            />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />

        <CMSInput
          label="Perusahaan / Brand"
          leftIcon={<Building2 size={14} />}
          placeholder="Gous Studio"
          value={formData.company || ""}
          onChange={(e) => handleChange("company", e.target.value)}
        />

        <CMSInput
          label="Catatan Internal"
          isTextArea
          rows={4}
          leftIcon={<FileText size={14} />}
          placeholder="Catatan tambahan mengenai client..."
          value={formData.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
        />
      </div>
    </CMSModal>
  );
};

export default ClientModal;
