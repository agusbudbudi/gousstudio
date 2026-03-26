import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import {
  Loader2,
  X,
  Save,
  User,
  Phone,
  Building2,
  FileText,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import { ClientItem } from "../../types";
import CMSInput from "./Common/CMSInput";
import CMSButton from "./Common/CMSButton";
import CMSModal from "./Common/CMSModal";

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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        full_name: "",
        phone_number: "",
        company: "",
        notes: "",
      });
    }
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
      const payload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number || null,
        company: formData.company || null,
        notes: formData.notes || null,
      };

      if (!initialData || initialData.id === "NEW") {
        const res = await fetch('/api/cms/clients?action=create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to create client');
        addToast("Client berhasil ditambahkan.", "success");
        onSuccess(result.data as ClientItem);
      } else {
        const res = await fetch('/api/cms/clients?action=update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: initialData.id, updates: payload })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to update client');
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
      title={initialData && initialData.id !== "NEW" ? "Edit Data Client" : "Tambah Client Baru"}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <CMSButton variant="ghost" onClick={onClose}>
            Batal
          </CMSButton>
          <CMSButton
            onClick={handleSave}
            loading={saving}
            icon={Save}
          >
            Simpan Perubahan
          </CMSButton>
        </div>
      }
    >
      <div className="space-y-4">
        <CMSInput
          label="Nama Lengkap"
          leftIcon={<User size={14} />}
          error={validationErrors.full_name}
          placeholder="Masukkan nama lengkap client..."
          value={formData.full_name || ""}
          onChange={(e) => handleChange("full_name", e.target.value)}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CMSInput
            label="No. WhatsApp"
            leftIcon={<Phone size={14} />}
            placeholder="08123xxx"
            value={formData.phone_number || ""}
            onChange={(e) => handleChange("phone_number", e.target.value)}
          />

          <CMSInput
            label="Perusahaan / Brand"
            leftIcon={<Building2 size={14} />}
            placeholder="Gous Studio"
            value={formData.company || ""}
            onChange={(e) => handleChange("company", e.target.value)}
          />
        </div>

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
