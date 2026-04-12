import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Infinity as InfinityIcon,
  RefreshCw,
  Check,
  FileText,
  Tag,
  Package,
  CreditCard,
  User,
  Phone,
  MessageCircle,
  ExternalLink,
  Calendar,
  Image as ImageIcon,
  Maximize2,
  FileDown,
  Plus,
  Hash,
  X,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toPng } from "html-to-image";
import { useNavigate } from "react-router-dom";

import { OrderItem, PricelistItem, ClientItem } from "../../../types";
import { useToast } from "../../../hooks/useToast";
import CMSInput from "../Common/CMSInput";
import CMSSelect from "../Common/CMSSelect";
import CMSCombobox from "../Common/CMSCombobox";
import CMSViewItem from "../Common/CMSViewItem";
import CMSBadge from "../Common/CMSBadge";
import CMSButton from "../Common/CMSButton";
import ClientModal from "../ClientModal";
import { InvoiceTemplate } from "../../Invoice/InvoiceTemplate";

const cmsOrderValidationSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  phone_number: z
    .string()
    .regex(/^\d+$/, "Nomor WhatsApp hanya boleh berisi angka")
    .min(9, "Nomor WA tidak valid"),
  design_category: z.string().min(1, "Kategori wajib diisi"),
  selected_package: z.string().min(1, "Paket wajib dipilih"),
  price: z.number().min(0, "Harga wajib diisi"),
  final_price: z.number().min(0, "Harga final wajib diisi"),
  brief_detail: z
    .string()
    .min(10, "Brief minimal 10 karakter")
    .nullable()
    .optional(),
  deadline: z
    .string()
    .min(1, "Silakan tentukan deadline")
    .nullable()
    .optional(),
  discount_type: z.enum(["fixed", "percentage"]).nullable().optional(),
  discount_value: z.number().nullable().optional(),
  internal_notes: z.string().nullable().optional(),
  client_id: z.string().nullable().optional(),
  status: z
    .enum([
      "DRAFT",
      "WAITING FOR PAYMENT",
      "IN PROGRESS",
      "REVISION",
      "REVIEWED",
      "DONE",
    ])
    .optional(),
  is_sandbox: z.boolean().nullable().optional(),
  voucher_code: z.string().nullable().optional(),
  referral_id: z.string().nullable().optional(),
});

type OrderFormValues = z.infer<typeof cmsOrderValidationSchema>;

const formatClientId = (no?: number) =>
  no !== undefined ? `CLT-${String(no).padStart(3, "0")}` : "";

interface OrderFormProps {
  order: OrderItem;
  pricelists: PricelistItem[];
  clients: ClientItem[];
  updatingId: string | null;
  savingDetails: boolean;
  onCancel: () => void;
  onSave: (
    data: Partial<OrderItem>,
    selectedPricelist: PricelistItem | null,
  ) => Promise<void>;
  onStatusUpdate: (
    id: string,
    newStatus: string,
    additionalUpdates?: any,
  ) => Promise<boolean>;
  onClientAdded: (client: ClientItem) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  order,
  pricelists,
  clients,
  updatingId,
  savingDetails,
  onCancel,
  onSave,
  onStatusUpdate,
  onClientAdded,
}) => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const briefTextareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(cmsOrderValidationSchema),
    defaultValues: {
      ...order,
      price: Number(order.price) || 0,
      final_price: Number(order.final_price ?? order.price) || 0,
      discount_value: Number(order.discount_value) || 0,
      discount_type: order.discount_type || "fixed",
    },
  });

  const formValues = watch();

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [isSelesaiModalOpen, setIsSelesaiModalOpen] = useState(false);
  const [deliverablesInput, setDeliverablesInput] = useState("");
  const [isVerifyPaymentModalOpen, setIsVerifyPaymentModalOpen] =
    useState(false);
  const [verifyPaymentMethod, setVerifyPaymentMethod] = useState("");
  const [verifyPaidAmount, setVerifyPaidAmount] = useState<number | "">("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherData, setVoucherData] = useState<any>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Sync form when order prop changes (e.g. status updates)
  useEffect(() => {
    reset({
      ...order,
      price: Number(order.price) || 0,
      final_price: Number(order.final_price ?? order.price) || 0,
      discount_value: Number(order.discount_value) || 0,
      discount_type: order.discount_type || "fixed",
      referral_id: order.referral_id || null,
    });
  }, [order, reset]);

  const selectedPricelist =
    order.status !== "DRAFT" && order.package_details
      ? order.package_details
      : pricelists.find((p) => p.servicename === formValues.selected_package);

  const calculateDaysLeft = (deadlineDateStr?: string) => {
    if (!deadlineDateStr) return null;
    const deadline = new Date(deadlineDateStr);
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = (deadline as any) - (today as any);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateFinalPrice = (
    price: number,
    discountValue: number,
    discountType: string,
  ) => {
    let p = price || 0;
    let v = discountValue || 0;
    if (v < 0) v = 0;
    if (discountType === "percentage") {
      if (v > 100) v = 100;
      return p - (p * v) / 100;
    }
    if (v > p) v = p;
    return p - v;
  };

  const handlePriceOrDiscountChange = (
    field: "price" | "discount_value" | "discount_type",
    value: any,
  ) => {
    let newPrice = field === "price" ? Number(value) : formValues.price;
    let newDiscVal =
      field === "discount_value"
        ? Number(value)
        : formValues.discount_value || 0;
    let newDiscType =
      field === "discount_type" ? value : formValues.discount_type || "fixed";

    if (field === "discount_type") {
      newDiscVal = 0;
      setValue("discount_value", 0);
    }

    if (newDiscType === "percentage" && newDiscVal > 100) newDiscVal = 100;
    if (newDiscType === "fixed" && newDiscVal > newPrice) newDiscVal = newPrice;

    setValue(field, value, { shouldValidate: true });
    if (
      field !== "discount_value" &&
      newDiscVal !== formValues.discount_value
    ) {
      setValue("discount_value", newDiscVal);
    }

    const finalP = calculateFinalPrice(newPrice, newDiscVal, newDiscType);
    setValue("final_price", finalP, { shouldValidate: true });
  };

  const handleValidateVoucher = async () => {
    const code = formValues.voucher_code;
    if (!code) {
      setVoucherError("Masukkan kode voucher");
      return;
    }

    try {
      setIsValidatingVoucher(true);
      setVoucherError(null);
      const res = await fetch(
        `/api/orders?action=validate-voucher&code=${code}`,
      );
      const result = await res.json();

      if (!res.ok) {
        setVoucherError(result.message || "Voucher tidak valid");
        setVoucherData(null);
        return;
      }

      setVoucherData(result.voucher);
      addToast("Voucher berhasil divalidasi", "success");
    } catch (err) {
      setVoucherError("Terjadi kesalahan sistem");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherData) return;

    try {
      // In CMS, we might want to just update the local form state first,
      // but the user said "amount value voucher shall be automatically set the discount value and discount type on the order and make it non editable after voucher tervalidasi"
      // This suggests we should update the FORM fields.

      setValue(
        "discount_type",
        voucherData.discount_type as "fixed" | "percentage",
      );
      setValue("discount_value", voucherData.discount_value);
      setValue("referral_id", voucherData.id);

      // Recalculate everything
      const finalP = calculateFinalPrice(
        formValues.price,
        voucherData.discount_value,
        voucherData.discount_type,
      );
      setValue("final_price", finalP);

      // Update the referral_id in our local state/form if we had it in schema,
      // but since it's an update, the backend 'apply-voucher' is better for FINALIZATION.
      // However, for UI, we just lock the fields.

      addToast("Voucher diterapkan ke rincian biaya", "success");
    } catch (err) {
      addToast("Gagal menerapkan voucher", "error");
    }
  };

  const handleRemoveVoucher = () => {
    const isApplied = !!formValues.referral_id;

    // Phase 1: Clear verification metadata
    setVoucherData(null);
    setVoucherError(null);
    setValue("voucher_code", "");

    // Phase 2: If already applied, reset values & referral link
    if (isApplied) {
      setValue("discount_value", 0);
      setValue("discount_type", "fixed");
      setValue("referral_id", null);

      const finalP = calculateFinalPrice(formValues.price, 0, "fixed");
      setValue("final_price", finalP);
      addToast("Voucher dilepaskan dan diskon di-reset", "success");
    } else {
      addToast("Validasi voucher dibatalkan", "success");
    }
  };

  const submitForm = (data: OrderFormValues) => {
    onSave(data, selectedPricelist || null);
  };

  const handleDownloadInvoice = async () => {
    const invoiceId = `invoice-${order.order_number}`;
    const element = document.getElementById(invoiceId);
    if (!element) return;
    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        style: { visibility: "visible" },
      });
      const link = document.createElement("a");
      const isProforma = ["DRAFT", "WAITING FOR PAYMENT"].includes(
        order.status,
      );
      link.download = `${isProforma ? "proforma-" : "invoice-"}${order.order_number}.png`;
      link.href = dataUrl;
      link.click();
      addToast(
        `${isProforma ? "Proforma " : ""}Invoice berhasil diunduh.`,
        "success",
      );
    } catch (err) {
      addToast("Gagal mengunduh invoice.", "error");
    }
  };

  const handleSendWhatsApp = () => {
    let phone = (formValues.phone_number || "").replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    const publicUrl = `${window.location.origin}/order/${order.order_number}`;
    const message = `Halo ${formValues.full_name},\n\n📦 Update untuk pesanan Anda #${order.order_number}:\nStatus: *${order.status}*\nPaket: ${formValues.selected_package}\n\nCek detail pesanan selengkapnya di sini:\n${publicUrl}\n\nTerima kasih,\nGous Studio`;
    window.open(
      `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="flex-1 min-h-0 overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Paket & Layanan */}
            <div className="bg-white border border-slate-200 rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-t-[15px]">
                <h3 className="text-xs font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wider">
                  <Package size={12} className="text-slate-400" /> Detail Paket
                  & Layanan
                </h3>
              </div>
              <div
                className={`p-5 ${order.status === "DRAFT" ? "space-y-4" : "space-y-0.5"}`}
              >
                {order.status === "DRAFT" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name="design_category"
                        control={control}
                        render={({ field }) => (
                          <CMSInput
                            label="Kategori"
                            leftIcon={<Tag size={14} />}
                            error={errors.design_category?.message as string}
                            placeholder="Kategori Desain"
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        name="selected_package"
                        control={control}
                        render={({ field }) => (
                          <CMSCombobox
                            label="Paket Terpilih"
                            leftIcon={<Package size={14} />}
                            error={errors.selected_package?.message as string}
                            placeholder="Ketik atau pilih paket..."
                            value={field.value}
                            onChange={field.onChange}
                            onSelectOption={(opt) => {
                              const pkgInfo = pricelists.find(
                                (p) => p.servicename === opt.value,
                              );
                              if (pkgInfo) {
                                field.onChange(opt.value);
                                setValue("design_category", pkgInfo.category);
                                handlePriceOrDiscountChange(
                                  "price",
                                  pkgInfo.finalprice,
                                );
                              }
                            }}
                            options={[
                              ...pricelists.map((p) => ({
                                label: p.servicename,
                                value: p.servicename,
                                description: p.category,
                                rightElement: (
                                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap mt-0.5">
                                    Rp{" "}
                                    {Number(p.finalprice).toLocaleString(
                                      "id-ID",
                                    )}
                                  </span>
                                ),
                              })),
                              {
                                label: "Custom Package",
                                value: "Custom Package",
                              },
                              { label: "Other", value: "Other" },
                            ].filter(
                              (v, i, a) =>
                                a.findIndex((t) => t.value === v.value) === i,
                            )}
                          />
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                      <Controller
                        name="price"
                        control={control}
                        render={({ field }) => (
                          <CMSInput
                            label="Harga Base"
                            type="number"
                            leftIcon={
                              <span className="text-xs font-bold">Rp</span>
                            }
                            error={errors.price?.message as string}
                            value={
                              field.value === 0 && !field.value
                                ? ""
                                : field.value
                            }
                            onChange={(e) =>
                              handlePriceOrDiscountChange(
                                "price",
                                e.target.value,
                              )
                            }
                          />
                        )}
                      />
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-600 block ml-1">
                          Discount{" "}
                          {formValues.referral_id &&
                          (formValues.voucher_code || order.voucher_code)
                            ? `[${formValues.voucher_code || order.voucher_code}]`
                            : ""}
                        </label>
                        <div className="flex items-center gap-2">
                          <Controller
                            name="discount_value"
                            control={control}
                            render={({ field }) => (
                              <CMSInput
                                type="number"
                                min={0}
                                max={
                                  formValues.discount_type === "percentage"
                                    ? 100
                                    : formValues.price
                                }
                                readOnly={!!formValues.referral_id}
                                className={`text-rose-500 ${!!formValues.referral_id ? "!bg-slate-100 font-bold" : "!bg-white"}`}
                                value={
                                  field.value === 0 && !field.value
                                    ? ""
                                    : field.value
                                }
                                onChange={(e) =>
                                  handlePriceOrDiscountChange(
                                    "discount_value",
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                          />
                          <Controller
                            name="discount_type"
                            control={control}
                            render={({ field }) => (
                              <CMSSelect
                                containerClassName="shrink-0 w-[80px]"
                                disabled={!!formValues.referral_id}
                                className={`!pl-3 !pr-6 !text-sm !h-[42px] ${!!formValues.referral_id ? "!bg-slate-100" : ""}`}
                                value={field.value || "fixed"}
                                onChange={(e) =>
                                  handlePriceOrDiscountChange(
                                    "discount_type",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="fixed">Rp</option>
                                <option value="percentage">%</option>
                              </CMSSelect>
                            )}
                          />
                        </div>
                      </div>
                      <CMSInput
                        label="Final Amount"
                        readOnly
                        leftIcon={
                          <span className="text-xs font-bold !text-emerald-500">
                            Rp
                          </span>
                        }
                        className="!bg-emerald-50 !border-emerald-200 !text-emerald-600 truncate !font-bold"
                        value={
                          formValues.final_price === 0
                            ? "GRATIS"
                            : formValues.final_price?.toLocaleString("id-ID") ||
                              "0"
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <CMSViewItem
                      label="Kategori"
                      value={formValues.design_category}
                      icon={Tag}
                    />
                    <CMSViewItem
                      label="Paket Terpilih"
                      value={formValues.selected_package}
                      icon={Package}
                    />
                    <CMSViewItem
                      label="Harga Base"
                      value={`Rp ${formValues.price?.toLocaleString("id-ID")}`}
                      icon={CreditCard}
                    />
                    <CMSViewItem
                      label="Discount"
                      value={
                        formValues.discount_value &&
                        formValues.discount_value > 0 ? (
                          <div className="flex items-center gap-2">
                            {formValues.discount_type === "percentage" && (
                              <CMSBadge variant="brand" className="!rounded-md">
                                {formValues.discount_value}%
                              </CMSBadge>
                            )}
                            <span className="font-bold text-rose-500">
                              Rp{" "}
                              {(formValues.discount_type === "percentage"
                                ? (formValues.price *
                                    formValues.discount_value) /
                                  100
                                : formValues.discount_value
                              ).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ) : (
                          "Rp 0"
                        )
                      }
                      icon={Tag}
                    />
                    <CMSViewItem
                      label="Final Amount"
                      className="!border-0"
                      value={
                        <CMSBadge
                          variant="status"
                          status="DONE"
                          className="!text-sm !py-1 px-2 gap-2"
                        >
                          <CreditCard size={14} className="text-emerald-600" />
                          {formValues.final_price === 0
                            ? "GRATIS"
                            : `Rp ${formValues.final_price?.toLocaleString("id-ID")}`}
                        </CMSBadge>
                      }
                    />
                  </>
                )}

                {/* Package Summary Card */}
                {selectedPricelist && (
                  <div className="bg-brand-50/30 border border-brand-100 rounded-xl p-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shrink-0">
                          <CheckCircle2 size={16} className="!text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800">
                              {selectedPricelist.servicename}
                            </h4>
                            <CMSBadge
                              variant="brand"
                              className="text-[10px] !rounded-md"
                            >
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(selectedPricelist.finalprice)}
                            </CMSBadge>
                          </div>
                          <p className="text-[10px] text-slate-600 font-medium leading-relaxed max-w-md">
                            {selectedPricelist.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <div className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-700">
                            {selectedPricelist.duration} hari
                          </span>
                        </div>
                        <div className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg flex items-center gap-1.5">
                          {selectedPricelist.isrevisionunlimited ? (
                            <InfinityIcon
                              size={12}
                              className="text-slate-400"
                            />
                          ) : (
                            <RefreshCw size={12} className="text-slate-300" />
                          )}
                          <span className="text-[11px] font-bold text-slate-700">
                            {selectedPricelist.isrevisionunlimited
                              ? "Unlimited"
                              : `${selectedPricelist.totalrevision}x`}{" "}
                            Rev
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedPricelist.deliverables &&
                      selectedPricelist.deliverables.length > 0 && (
                        <div className="pt-3 border-t border-brand-100/50">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Apa yang didapat:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {selectedPricelist.deliverables.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-xs text-slate-600"
                              >
                                <Check
                                  size={12}
                                  className="text-brand-500 mt-0.5 shrink-0"
                                />
                                <span className="font-medium">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Brief & Notes */}
            <div className="bg-white border border-slate-200 rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-t-[15px]">
                <h3 className="text-xs font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wider">
                  <FileText size={12} className="text-slate-400" /> Brief &
                  Catatan Project
                </h3>
              </div>
              <div className="p-5 space-y-6">
                <Controller
                  name="brief_detail"
                  control={control}
                  render={({ field }) => (
                    <CMSInput
                      label="Detail Brief Pelanggan"
                      isTextArea
                      isBold={false}
                      error={errors.brief_detail?.message as string}
                      className="min-h-[100px] !bg-white"
                      {...field}
                    />
                  )}
                />
                <div className="pt-4 border-t border-slate-50">
                  <Controller
                    name="internal_notes"
                    control={control}
                    render={({ field }) => (
                      <CMSInput
                        label="Catatan Internal Admin"
                        isTextArea
                        isBold={false}
                        className="min-h-[64px] !bg-slate-50/50"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-4">
            {/* Status & Deadline */}
            <div className="bg-white border border-slate-200 rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between rounded-t-[15px]">
                <h3 className="text-xs font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wider">
                  <Clock size={12} className="text-slate-400" /> Status &
                  Deadline
                </h3>
              </div>
              <div className="p-5 space-y-0.5">
                <CMSViewItem
                  label="Status Progres"
                  value={
                    <CMSBadge variant="status" status={order.status}>
                      {order.status}
                    </CMSBadge>
                  }
                />

                {order.created_at && (
                  <CMSViewItem
                    label="Dibuat pada"
                    icon={Calendar}
                    value={new Date(order.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                )}
                {order.status === "DRAFT" ? (
                  <div className="pt-2">
                    <Controller
                      name="deadline"
                      control={control}
                      render={({ field }) => (
                        <CMSInput
                          label="Deadline Target"
                          type="date"
                          leftIcon={<Calendar size={14} />}
                          error={errors.deadline?.message as string}
                          value={field.value ? field.value.split("T")[0] : ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                ) : (
                  <CMSViewItem
                    label="Deadline Target"
                    className="!border-0"
                    value={
                      <div className="flex items-center gap-2">
                        {order.status !== "DONE" && order.deadline && (
                          <CMSBadge
                            variant={
                              (calculateDaysLeft(order.deadline) ?? 0) < 0
                                ? "status"
                                : "brand"
                            }
                            status={
                              (calculateDaysLeft(order.deadline) ?? 0) < 0
                                ? "REVISION"
                                : undefined
                            }
                            className="!rounded-md"
                          >
                            {(calculateDaysLeft(order.deadline) ?? 0) > 0
                              ? `${calculateDaysLeft(order.deadline)} Hari lagi`
                              : (calculateDaysLeft(order.deadline) ?? 0) === 0
                                ? "Deadline Hari Ini"
                                : `Terlambat ${Math.abs(calculateDaysLeft(order.deadline) ?? 0)} Hari`}
                          </CMSBadge>
                        )}
                        <Calendar size={12} className="text-slate-300" />
                        <span>
                          {order.deadline
                            ? new Date(order.deadline).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </span>
                      </div>
                    }
                  />
                )}
                {order.status === "DONE" && order.deliverables_url && (
                  <div className="pt-2.5">
                    <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-md">
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                        <FileText size={14} className="text-slate-500" />{" "}
                        Deliverables Link
                      </label>
                      <a
                        href={order.deliverables_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-500 hover:text-brand-600 hover:underline flex items-center gap-1 font-bold text-sm w-full"
                      >
                        <span className="truncate">
                          {order.deliverables_url}
                        </span>
                        <ExternalLink size={14} className="shrink-0" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pelanggan */}
            <div className="bg-white border border-slate-200 rounded-2xl">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wider">
                  <User size={12} className="text-slate-400" /> Pelanggan
                </h3>
                {order.status === "DRAFT" && (
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(true)}
                    className="text-brand-500 hover:text-brand-600 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus size={10} /> Client Baru
                  </button>
                )}
              </div>
              <div className="p-5 space-y-4">
                {order.status === "DRAFT" ? (
                  <div className="space-y-4">
                    <Controller
                      name="full_name"
                      control={control}
                      render={({ field }) => (
                        <CMSCombobox
                          label="Nama Lengkap"
                          leftIcon={<User size={14} />}
                          error={errors.full_name?.message as string}
                          placeholder="Cari atau ketik nama..."
                          value={field.value}
                          onChange={field.onChange}
                          onSelectOption={(opt) => {
                            const client = clients.find(
                              (c) => c.id === opt.value,
                            );
                            if (client) {
                              field.onChange(client.full_name);
                              setValue("client_id", client.id);
                              setValue(
                                "phone_number",
                                client.phone_number || formValues.phone_number,
                              );
                            }
                          }}
                          options={clients.map((c) => ({
                            label: c.full_name || "",
                            value: c.id,
                            description: c.company || undefined,
                            rightElement:
                              c.client_no !== undefined ? (
                                <span className="text-[9px] font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
                                  {formatClientId(c.client_no)}
                                </span>
                              ) : undefined,
                          }))}
                          onCreateNew={(val) => {
                            setClientSearchQuery(val);
                            setIsClientModalOpen(true);
                          }}
                          createNewText={(val) => `+ Buat "${val}"`}
                        />
                      )}
                    />
                    <Controller
                      name="phone_number"
                      control={control}
                      render={({ field }) => (
                        <CMSInput
                          label="WhatsApp / Nomor HP"
                          leftIcon={
                            <span className="text-[11px] font-bold">WA</span>
                          }
                          error={errors.phone_number?.message as string}
                          placeholder="08xxxxxxxx"
                          {...field}
                        />
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {(() => {
                      const linkedClient = clients.find(
                        (c) => c.id === order.client_id,
                      );
                      const linkedClientId =
                        linkedClient?.client_no !== undefined
                          ? `CLT-${String(linkedClient.client_no).padStart(3, "0")}`
                          : null;
                      return (
                        <CMSViewItem
                          label="Client ID"
                          value={
                            linkedClientId ? (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/cms/clients/${linkedClientId}`)
                                }
                                className="text-brand-500 hover:text-brand-600 hover:underline font-bold text-sm flex items-center gap-1 transition-all cursor-pointer"
                              >
                                {linkedClientId}
                                <ExternalLink size={11} />
                              </button>
                            ) : (
                              "—"
                            )
                          }
                        />
                      );
                    })()}
                    <CMSViewItem
                      label="Nama Pelanggan"
                      value={formValues.full_name}
                      icon={User}
                    />
                    <CMSViewItem
                      label="WhatsApp"
                      value={formValues.phone_number}
                      icon={Phone}
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 !text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  <MessageCircle size={16} className="!text-white" /> Update via
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Voucher Section */}
            {(formValues.status === "DRAFT" || !!formValues.referral_id) && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wider">
                  <Tag size={12} className="text-slate-400" /> Voucher &
                  Referral
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {formValues.status === "DRAFT" && (
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <Controller
                        name="voucher_code"
                        control={control}
                        render={({ field }) => (
                          <CMSInput
                            label="Kode Voucher"
                            placeholder="Contoh: REFXXXXX"
                            leftIcon={<Tag size={14} />}
                            className="font-mono uppercase transition-all"
                            {...field}
                            value={field.value || ""}
                            error={
                              voucherError ||
                              (errors as any).voucher_code?.message
                            }
                            readOnly={!!formValues.referral_id || !!voucherData}
                          />
                        )}
                      />
                    </div>
                    {!formValues.referral_id && !voucherData && (
                      <div className="pt-[26px]">
                        <CMSButton
                          type="button"
                          variant="primary"
                          onClick={handleValidateVoucher}
                          loading={isValidatingVoucher}
                          className="shrink-0 h-[42px]"
                        >
                          Validasi
                        </CMSButton>
                      </div>
                    )}
                  </div>
                )}

                {/* Voucher Card Metadata - Highlighted Coupon Style */}
                {(voucherData || formValues.referral_id) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-emerald-50/40 border border-emerald-300 rounded-xl overflow-hidden shadow-sm shadow-emerald-500/5 transition-all"
                  >
                    {/* Remove Voucher Button - Only visible in DRAFT or before application logic */}
                    {formValues.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="absolute top-2 right-2 p-1 text-emerald-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer z-10"
                        title="Remove Voucher"
                      >
                        <X size={14} />
                      </button>
                    )}

                    <div className="p-4 space-y-3">
                      {/* Top Section: Code & Discount Vertical Stack */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-white border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                          <Tag size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-1.5">
                            Voucher Code
                          </p>
                          <h4 className="font-mono font-black text-sm text-slate-800 leading-none">
                            {voucherData?.code || order.voucher_code}
                          </h4>
                        </div>
                      </div>

                      {/* Dashed Separator */}
                      <div className="border-t border-dashed border-emerald-300 mx-[-1rem] px-4" />

                      {/* Bottom Section: Issuer info & Discount Value */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-white border border-emerald-100 rounded-full flex items-center justify-center text-emerald-400">
                              <User size={10} />
                            </div>
                            <p className="text-[11px] font-medium text-slate-500">
                              Issued for{" "}
                              <span className="font-bold text-slate-800">
                                {voucherData?.issuer_name || "Pelanggan"}
                              </span>
                            </p>
                          </div>

                          <div className="pl-7">
                            <div className="flex items-baseline gap-1 leading-none">
                              <span className="text-base font-black text-emerald-600 tracking-tight">
                                {voucherData?.discount_type === "fixed" ||
                                order.discount_type === "fixed"
                                  ? "Rp "
                                  : ""}
                                {voucherData?.discount_value ||
                                  order.discount_value}
                                {voucherData?.discount_type === "percentage" ||
                                order.discount_type === "percentage"
                                  ? "%"
                                  : ""}
                              </span>
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                Discount
                              </span>
                            </div>
                          </div>
                        </div>

                        {formValues.referral_id ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500 !text-white rounded text-[10px] font-black uppercase tracking-wider">
                            <Check size={10} strokeWidth={4} />
                            Applied
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[10px] font-black uppercase tracking-wider">
                            Verified
                          </div>
                        )}
                      </div>
                    </div>

                    {formValues.referral_id &&
                      formValues.referral_id !== order.referral_id && (
                        <div className="px-4 py-2 bg-emerald-500/10 border-t border-emerald-100 italic">
                          <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            Voucher Applied! Silakan klik simpan untuk menyimpan
                            perubahan.
                          </p>
                        </div>
                      )}

                    {!formValues.referral_id && voucherData && (
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 !text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:bg-emerald-800 cursor-pointer"
                      >
                        Apply Discount to Order
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}

            {/* Pembayaran & Tagihan */}
            {order.id !== "NEW" && (
              <div
                className={`border rounded-2xl ${
                  ["DRAFT", "WAITING FOR PAYMENT"].includes(order.status || "")
                    ? "bg-white border-slate-200"
                    : "bg-emerald-50/50 border-emerald-200"
                }`}
              >
                <div
                  className={`px-6 py-4 border-b flex items-center justify-between rounded-t-[15px] ${
                    ["DRAFT", "WAITING FOR PAYMENT"].includes(
                      order.status || "",
                    )
                      ? "border-slate-100 bg-slate-50/50"
                      : "border-emerald-100/50 bg-emerald-500/5"
                  }`}
                >
                  <h3
                    className={`text-xs font-bold flex items-center gap-2 uppercase tracking-wider ${
                      ["DRAFT", "WAITING FOR PAYMENT"].includes(
                        order.status || "",
                      )
                        ? "text-slate-400"
                        : "text-emerald-600"
                    }`}
                  >
                    <CreditCard
                      size={12}
                      className={
                        ["DRAFT", "WAITING FOR PAYMENT"].includes(
                          order.status || "",
                        )
                          ? "text-slate-300"
                          : "text-emerald-500"
                      }
                    />{" "}
                    Pembayaran
                  </h3>
                  <CMSBadge
                    variant={
                      ["DRAFT", "WAITING FOR PAYMENT"].includes(
                        order.status || "",
                      )
                        ? "neutral"
                        : "status"
                    }
                    status={
                      !["DRAFT", "WAITING FOR PAYMENT"].includes(
                        order.status || "",
                      )
                        ? "DONE"
                        : undefined
                    }
                    className={
                      ["DRAFT", "WAITING FOR PAYMENT"].includes(
                        order.status || "",
                      )
                        ? "!bg-slate-100 !text-slate-500"
                        : ""
                    }
                  >
                    {["DRAFT", "WAITING FOR PAYMENT"].includes(
                      order.status || "",
                    )
                      ? "Belum Lunas"
                      : "Lunas"}
                  </CMSBadge>
                </div>
                <div className="p-5 space-y-4">
                  {!["DRAFT", "WAITING FOR PAYMENT"].includes(
                    order.status || "",
                  ) && (
                    <div className="space-y-0.5">
                      <CMSViewItem
                        label="Tipe Verifikasi"
                        value={
                          order.is_sandbox === null ||
                          order.is_sandbox === undefined
                            ? "Manual Verification"
                            : order.is_sandbox === false
                              ? "Otomatis (Pakasir)"
                              : "Sandbox (Pakasir - Testing)"
                        }
                      />
                      <CMSViewItem
                        label="Metode"
                        value={
                          <span className="uppercase font-bold">
                            {order.payment_method?.replace(/_/g, " ") || "-"}
                          </span>
                        }
                      />
                      <CMSViewItem
                        label="Nominal Dibayar"
                        value={
                          <span className="font-black text-emerald-600">
                            {order.paid_amount
                              ? new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(order.paid_amount)
                              : "-"}
                          </span>
                        }
                      />
                      <CMSViewItem
                        label="Waktu Verifikasi"
                        value={
                          order.paid_at
                            ? new Date(order.paid_at).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"
                        }
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadInvoice}
                    className={`w-full py-3 font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      ["DRAFT", "WAITING FOR PAYMENT"].includes(
                        order.status || "",
                      )
                        ? "bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 text-slate-700"
                        : "bg-white border border-emerald-400 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    <FileDown size={16} /> Unduh{" "}
                    {["DRAFT", "WAITING FOR PAYMENT"].includes(
                      order.status || "",
                    )
                      ? "Proforma Invoice"
                      : "Invoice Resmi"}
                  </button>
                </div>
              </div>
            )}

            {/* Manual Payment Verification & Proof */}
            {order.payment_proof_url && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                  <ImageIcon size={12} className="text-emerald-500" />
                  Bukti Pembayaran
                </h3>
                <div
                  className="relative group rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-video cursor-zoom-in group"
                  onClick={() => {
                    if (order.payment_proof_url) {
                      window.open(order.payment_proof_url, "_blank");
                    }
                  }}
                >
                  <img
                    src={order.payment_proof_url || ""}
                    alt="Bukti Pembayaran"
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <Maximize2
                      size={32}
                      className="!text-white transform scale-75 group-hover:scale-110 transition-transform"
                    />
                  </div>
                </div>
                {order.status === "WAITING FOR PAYMENT" && (
                  <CMSButton
                    type="button"
                    onClick={() => {
                      setVerifyPaidAmount(
                        order.final_price ?? order.price ?? 0,
                      );
                      setVerifyPaymentMethod("Manual Transfer");
                      setIsVerifyPaymentModalOpen(true);
                    }}
                    className="w-full mt-2 py-3"
                  >
                    Konfirmasi Pembayaran
                  </CMSButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-end gap-3 z-30 px-6 md:px-8">
        <CMSButton variant="ghost" type="button" onClick={onCancel}>
          Batal
        </CMSButton>
        {order.status === "DRAFT" && order.id !== "NEW" && (
          <CMSButton
            type="button"
            className="!bg-orange-500 !text-white hover:!bg-orange-600 border-none"
            onClick={async () => {
              await onStatusUpdate(order.id, "WAITING FOR PAYMENT");
            }}
            icon={CreditCard}
          >
            Minta Pembayaran
          </CMSButton>
        )}
        {order.status === "IN PROGRESS" && order.id !== "NEW" && (
          <CMSButton
            type="button"
            className="!bg-purple-500 !text-white hover:!bg-purple-600 border-none"
            onClick={() => onStatusUpdate(order.id, "REVIEWED")}
          >
            Send for Review
          </CMSButton>
        )}
        {order.status === "REVIEWED" && order.id !== "NEW" && (
          <>
            <CMSButton
              type="button"
              className="!bg-rose-500 !text-white hover:!bg-rose-600 border-none"
              onClick={() => onStatusUpdate(order.id, "REVISION")}
            >
              Revision
            </CMSButton>
            <CMSButton
              type="button"
              className="!bg-emerald-500 !text-white hover:!bg-emerald-600 border-none"
              onClick={() => setIsSelesaiModalOpen(true)}
            >
              Selesai
            </CMSButton>
          </>
        )}
        <CMSButton type="submit" loading={savingDetails} icon={CheckCircle2}>
          Simpan Perubahan
        </CMSButton>
      </div>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={(client) => {
          onClientAdded(client);
          setValue("client_id", client.id);
          setValue("full_name", client.full_name);
          setValue("phone_number", client.phone_number || "");
          setIsClientModalOpen(false);
        }}
        initialData={
          clientSearchQuery
            ? ({ id: "NEW", full_name: clientSearchQuery } as any)
            : null
        }
      />

      {/* Modals for verification and Selesai would go here. Omitted for brevity or implement simply: */}
      {isVerifyPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="font-black text-xl tracking-tight">
                Verifikasi Pembayaran
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Metode Pembayaran
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Transfer BCA, Cash, dll."
                  value={verifyPaymentMethod}
                  onChange={(e) => setVerifyPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Nominal yang Dibayar
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={verifyPaidAmount}
                    onChange={(e) =>
                      setVerifyPaidAmount(Number(e.target.value))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-11 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifyPaymentModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const success = await onStatusUpdate(
                    order.id,
                    "IN PROGRESS",
                    {
                      payment_method: verifyPaymentMethod,
                      paid_amount: verifyPaidAmount,
                      paid_at: new Date().toISOString(),
                      is_sandbox: null,
                    },
                  );
                  if (success) {
                    setIsVerifyPaymentModalOpen(false);
                  }
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 !text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
              >
                Konfirmasi
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isSelesaiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">Selesaikan Pesanan</h2>
            <input
              type="url"
              placeholder="G Drive link..."
              value={deliverablesInput}
              onChange={(e) => setDeliverablesInput(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsSelesaiModalOpen(false)}
                className="flex-1 p-2 bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatusUpdate(order.id, "DONE", {
                    deliverables_url: deliverablesInput,
                  });
                  setIsSelesaiModalOpen(false);
                }}
                className="flex-1 p-2 bg-emerald-500 !text-white rounded-lg"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Invoice Template for Image Generation */}
      {order.id !== "NEW" && (
        <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
          <InvoiceTemplate
            order={formValues as OrderItem}
            packageData={selectedPricelist}
            type={
              ["DRAFT", "WAITING FOR PAYMENT"].includes(order.status)
                ? "PROFORMA"
                : "INVOICE"
            }
          />
        </div>
      )}
    </form>
  );
};

export default OrderForm;
