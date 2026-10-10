import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { OrderItem } from "../../../types";
import CMSModal from "../Common/CMSModal";
import CMSButton from "../Common/CMSButton";
import CMSInput from "../Common/CMSInput";
import CMSDatePicker from "../Common/CMSDatePicker";
import { addWorkingDays, formatRevisionQuota, REVISION_DAYS } from "../../../utils/orderFlow";

export type StatusUpdateFn = (
  id: string,
  newStatus: string,
  additionalUpdates?: Record<string, unknown>,
) => Promise<boolean | void>;

/** Plain field update that leaves the status alone (editing a link). */
export type OrderUpdateFn = (id: string, updates: Partial<OrderItem>) => Promise<boolean>;

interface StatusModalProps {
  order: OrderItem | null;
  onClose: () => void;
  onStatusUpdate: StatusUpdateFn;
}

/** Status modals that can also edit a link without changing the status. */
interface EditableStatusModalProps extends StatusModalProps {
  onUpdate?: OrderUpdateFn;
}

const SUCCESS_BUTTON =
  "!bg-emerald-600 hover:!bg-emerald-700 !border-emerald-600 hover:!border-emerald-700";

/** WAITING FOR PAYMENT → IN PROGRESS, recording how and how much the client paid. */
export const VerifyPaymentModal: React.FC<StatusModalProps> = ({ order, onClose, onStatusUpdate }) => {
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order) return;
    setMethod("Manual Transfer");
    setAmount(order.final_price ?? order.price ?? 0);
  }, [order]);

  const submit = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const success = await onStatusUpdate(order.id, "IN PROGRESS", {
        payment_method: method,
        paid_amount: amount,
        paid_at: new Date().toISOString(),
        is_sandbox: null,
      });
      if (success !== false) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <CMSModal
      isOpen={Boolean(order)}
      onClose={() => !saving && onClose()}
      title="Verifikasi Pembayaran"
      maxWidth="max-w-md"
      footer={
        <>
          <CMSButton variant="ghost" type="button" onClick={onClose} disabled={saving}>
            Batal
          </CMSButton>
          <CMSButton type="button" icon={CheckCircle2} loading={saving} className={SUCCESS_BUTTON} onClick={submit}>
            Konfirmasi
          </CMSButton>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">
          Order <span className="font-semibold text-ink">#{order?.order_number}</span> akan berpindah ke{" "}
          <span className="font-semibold text-ink">IN PROGRESS</span>.
          {!order?.payment_proof_url && " Klien belum upload bukti bayar — pastikan dana sudah diterima."}
        </p>
        <CMSInput
          label="Metode Pembayaran"
          placeholder="Contoh: Transfer BCA, Cash, dll."
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          autoFocus
        />
        <CMSInput
          label="Nominal yang Dibayar"
          type="number"
          inputMode="numeric"
          placeholder="0"
          leftIcon={<span className="text-sm font-semibold">Rp</span>}
          value={amount}
          onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
        />
      </div>
    </CMSModal>
  );
};

/**
 * REVIEWED → DONE with the final-files link, or (mode="edit") update the link of an order
 * that is already DONE without touching its status.
 */
export const CompleteOrderModal: React.FC<EditableStatusModalProps & { mode?: "complete" | "edit" }> = ({
  order,
  onClose,
  onStatusUpdate,
  onUpdate,
  mode = "complete",
}) => {
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const editing = mode === "edit";

  useEffect(() => {
    if (order) setLink(order.deliverables_url || "");
  }, [order]);

  const submit = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const updates = { deliverables_url: link.trim() || null };
      const success =
        editing && onUpdate ? await onUpdate(order.id, updates) : await onStatusUpdate(order.id, "DONE", updates);
      if (success !== false) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <CMSModal
      isOpen={Boolean(order)}
      onClose={() => !saving && onClose()}
      title={editing ? "Edit Link File Final" : "Selesaikan Pesanan"}
      maxWidth="max-w-md"
      footer={
        <>
          <CMSButton variant="ghost" type="button" onClick={onClose} disabled={saving}>
            Batal
          </CMSButton>
          <CMSButton type="button" icon={CheckCircle2} loading={saving} className={SUCCESS_BUTTON} onClick={submit}>
            {editing ? "Simpan Link" : "Selesai"}
          </CMSButton>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">
          {editing ? (
            <>Link baru langsung tampil di halaman order dan portal klien.</>
          ) : (
            <>
              Order <span className="font-semibold text-ink">#{order?.order_number}</span> akan berpindah ke{" "}
              <span className="font-semibold text-ink">DONE</span>. Tambahkan link file final untuk klien.
            </>
          )}
        </p>
        <CMSInput
          label="Link File Final"
          type="url"
          placeholder="https://drive.google.com/..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          autoFocus
        />
      </div>
    </CMSModal>
  );
};

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * IN PROGRESS / REVISION → REVIEWED with a link to the design draft. The client sees the
 * link on their order page and portal while the order is REVIEWED.
 */
export const SendForReviewModal: React.FC<EditableStatusModalProps> = ({
  order,
  onClose,
  onStatusUpdate,
  onUpdate,
}) => {
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isRevision = order?.status === "REVISION";
  const isEdit = order?.status === "REVIEWED";

  useEffect(() => {
    if (!order) return;
    // A revision is a new draft, so don't prefill the previous link there
    setLink(order.status === "REVISION" ? "" : order.review_url || "");
    setError(null);
  }, [order]);

  const submit = async () => {
    if (!order) return;
    const value = link.trim();
    if (!isHttpUrl(value)) {
      setError("Masukkan link yang valid (diawali https://)");
      return;
    }
    setSaving(true);
    try {
      // A new draft needs a fresh approval; editing the link of the same draft keeps it
      const success =
        isEdit && onUpdate
          ? await onUpdate(order.id, { review_url: value })
          : await onStatusUpdate(order.id, "REVIEWED", { review_url: value, approved_at: null });
      if (success !== false) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <CMSModal
      isOpen={Boolean(order)}
      onClose={() => !saving && onClose()}
      title={isEdit ? "Edit Link Draft Desain" : isRevision ? "Kirim Hasil Revisi" : "Kirim untuk Review"}
      maxWidth="max-w-md"
      footer={
        <>
          <CMSButton variant="ghost" type="button" onClick={onClose} disabled={saving}>
            Batal
          </CMSButton>
          <CMSButton
            type="button"
            icon={CheckCircle2}
            loading={saving}
            className="!bg-purple-600 hover:!bg-purple-700 !border-purple-600 hover:!border-purple-700"
            onClick={submit}
          >
            {isEdit ? "Simpan Link" : "Kirim"}
          </CMSButton>
        </>
      }
    >
      {/* Not a <form>: CMSModal isn't portaled, so a nested form would submit OrderForm */}
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">
          {isEdit ? (
            <>Link baru langsung tampil di halaman order dan portal klien.</>
          ) : (
            <>
              Order <span className="font-semibold text-ink">#{order?.order_number}</span> akan berpindah ke{" "}
              <span className="font-semibold text-ink">REVIEWED</span>. Link draft akan tampil di halaman order klien.
            </>
          )}
        </p>
        <CMSInput
          label={isRevision ? "Link Draft Revisi" : "Link Draft Desain"}
          type="url"
          placeholder="https://drive.google.com/... atau https://www.figma.com/..."
          value={link}
          error={error || undefined}
          onChange={(e) => {
            setLink(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          autoFocus
        />
      </div>
    </CMSModal>
  );
};

/**
 * Admin-logged REVIEWED → REVISION (e.g. feedback that came in over chat): optional notes,
 * a new deadline, and the same history entry a client request would create. The server builds
 * the entry from the current row; round/extra here are only a preview.
 */
export const RequestRevisionModal: React.FC<{
  order: OrderItem | null;
  onClose: () => void;
  onLogRevision: (id: string, notes: string, deadline?: string) => Promise<boolean>;
  quota: number | null;
}> = ({ order, onClose, onLogRevision, quota }) => {
  const [notes, setNotes] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const round = (order?.revision_count ?? 0) + 1;
  const extra = quota !== null && round > quota;

  useEffect(() => {
    if (!order) return;
    setNotes("");
    setDeadline(addWorkingDays(REVISION_DAYS));
  }, [order]);

  const submit = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const success = await onLogRevision(order.id, notes.trim(), deadline || undefined);
      if (success) onClose();
    } finally {
      setSaving(false);
    }
  };

  const quotaLabel = formatRevisionQuota(round, quota);

  return (
    <CMSModal
      isOpen={Boolean(order)}
      onClose={() => !saving && onClose()}
      title={`Revisi ke-${round}`}
      maxWidth="max-w-md"
      footer={
        <>
          <CMSButton variant="ghost" type="button" onClick={onClose} disabled={saving}>
            Batal
          </CMSButton>
          <CMSButton
            type="button"
            loading={saving}
            className="!bg-rose-500 hover:!bg-rose-600 !border-rose-500 hover:!border-rose-600 !text-white"
            onClick={submit}
          >
            Mulai Revisi
          </CMSButton>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">
          Order <span className="font-semibold text-ink">#{order?.order_number}</span> akan berpindah ke{" "}
          <span className="font-semibold text-ink">REVISION</span>
          {quotaLabel && <> — revisi {quotaLabel}</>}.
        </p>
        {extra && (
          <p className="rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            Melebihi jatah revisi paket. Revisi ini akan ditandai sebagai revisi ekstra.
          </p>
        )}
        <CMSInput
          label="Catatan revisi (opsional)"
          isTextArea
          rows={3}
          placeholder="Ringkas feedback klien dari chat, dll."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <CMSDatePicker
          label="Deadline baru"
          value={deadline}
          onChange={setDeadline}
          min={addWorkingDays(0)}
          clearable
        />
        <p className="-mt-2 ml-1 text-xs text-muted">
          Default +{REVISION_DAYS} hari kerja dari hari ini. Kosongkan untuk mempertahankan deadline lama.
        </p>
      </div>
    </CMSModal>
  );
};
