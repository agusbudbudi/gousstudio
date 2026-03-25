import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Search,
  ChevronRight,
  Clock,
  Infinity,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Check,
  CheckCircle2,
  MessageCircle,
  Filter,
  Image as ImageIcon,
  Maximize2,
  Tag,
  Package,
  FileText,
  Trash2,
  Plus,
  User,
  Users,
  Calendar,
  ChevronDown,
} from "lucide-react";

import { OrderItem, PricelistItem, ClientItem } from "../../types";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import CMSHeader from "./CMSHeader";
import ClientModal from "./ClientModal";
import CMSButton from "./Common/CMSButton";
import CMSBadge from "./Common/CMSBadge";
import CMSSearchBar from "./Common/CMSSearchBar";
import CMSStatCard from "./Common/CMSStatCard";
import CMSInfoItem from "./Common/CMSInfoItem";
import CMSInput from "./Common/CMSInput";
import CMSSelect from "./Common/CMSSelect";
import {
  CMSTableContainer,
  CMSTableHeader,
  CMSTableHeaderCell,
  CMSTableRow,
  CMSTableCell,
} from "./Common/CMSTable";

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
  brief_detail: z.string().min(10, "Brief minimal 10 karakter"),
  deadline: z.string().min(1, "Silakan tentukan deadline"),
});

const STATUSES: string[] = [
  "DRAFT",
  "WAITING FOR PAYMENT",
  "IN PROGRESS",
  "REVIEWED",
  "REVISION",
  "DONE",
];

const formatClientId = (no?: number) =>
  no !== undefined ? `CLT-${String(no).padStart(3, "0")}` : "";

const OrderCMS: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { orderNumber } = useParams<{ orderNumber?: string }>();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Sync selectedOrder with URL parameter
  useEffect(() => {
    if (orderNumber === "new") {
      setSelectedOrder({
        id: "NEW",
        order_number: "DRAFT Baru",
        status: "DRAFT",
        full_name: "",
        phone_number: "",
        design_category: "",
        selected_package: "",
        price: "" as any,
        final_price: "" as any,
        discount_value: 0,
        discount_type: "fixed",
        brief_detail: "",
        deadline: "",
        source_order: "web-ops",
        created_at: new Date().toISOString(),
      } as any);
    } else if (orderNumber) {
      const order = orders.find((o) => o.order_number === orderNumber);
      if (order) {
        setSelectedOrder(order);
      } else if (!loading) {
        // If not found and not loading, maybe it's not in the current list or needs fetching
        // For simplicity, we'll wait for the initial fetch to complete
      }
    } else {
      setSelectedOrder(null);
    }
  }, [orderNumber, orders, loading]);
  const [savingDetails, setSavingDetails] = useState(false);
  const [pricelists, setPricelists] = useState<PricelistItem[]>([]);
  const briefTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  // Client integration state
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientDropdownRef = React.useRef<HTMLDivElement>(null);

  const calculateDaysLeft = (deadlineDateStr?: string) => {
    if (!deadlineDateStr) return null;
    const deadline = new Date(deadlineDateStr);
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = (deadline as any) - (today as any);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const adjustHeight = () => {
      if (briefTextareaRef.current) {
        briefTextareaRef.current.style.height = "auto";
        briefTextareaRef.current.style.height = `${briefTextareaRef.current.scrollHeight}px`;
      }
    };

    adjustHeight();
    // Also adjust on window resize
    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [selectedOrder?.brief_detail, selectedOrder?.id]);

  useEffect(() => {
    fetchOrders();
    const fetchPricelists = async () => {
      const { data } = await supabase
        .from("pricelists")
        .select("*")
        .order("order_index");
      if (data) setPricelists(data as PricelistItem[]);
    };
    const fetchClients = async () => {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("full_name");
      if (data) setClients(data as ClientItem[]);
    };
    fetchPricelists();
    fetchClients();

    // Click outside to close client dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(event.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setOrders((data as OrderItem[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = (client: ClientItem) => {
    if (!selectedOrder) return;
    setSelectedOrder({
      ...selectedOrder,
      client_id: client.id,
      full_name: client.full_name,
      phone_number: client.phone_number || selectedOrder.phone_number,
    });
    // Clear validation errors for name and phone
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.full_name;
      delete next.phone_number;
      return next;
    });
    setShowClientDropdown(false);
    setClientSearchQuery("");
  };

  const handleClientModalSuccess = (client: ClientItem) => {
    // Add to local list and select
    setClients((prev) => [client, ...prev]);
    handleSelectClient(client);
    setIsClientModalOpen(false);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    // If it's a new draft, just update local state
    if (id === "NEW") {
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: newStatus } as OrderItem);
      }
      return;
    }

    setUpdatingId(id);
    try {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);
      if (updateError) throw updateError;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? ({ ...order, status: newStatus } as OrderItem)
            : order,
        ),
      );

      // Also update selectedOrder if it's the one being updated
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) =>
          prev ? ({ ...prev, status: newStatus } as OrderItem) : null,
        );
      }
      const orderNumber = orders.find((o) => o.id === id)?.order_number || id;
      addToast(
        `Status order #${orderNumber} diperbarui ke ${newStatus}`,
        "success",
      );
    } catch (err: any) {
      addToast(`Gagal update status: ${err.message}`, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (id: string, orderNumber: string) => {
    if (
      !window.confirm(
        `Hapus order #${orderNumber}? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;

    try {
      setUpdatingId(id);
      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setOrders((prev) => prev.filter((o) => o.id !== id));
      addToast(`Order #${orderNumber} berhasil dihapus.`, "success");
    } catch (err: any) {
      addToast(`Gagal menghapus order: ${err.message}`, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const calculateFinalPrice = (
    price?: number | string | null,
    discountValue?: number | string | null,
    discountType?: string | null,
  ) => {
    const p = parseFloat(String(price)) || 0;
    const v = parseFloat(String(discountValue)) || 0;
    if (discountType === "percentage") {
      return p - (p * v) / 100;
    }
    return p - v;
  };

  const handleOrderChange = (field: string, value: any) => {
    if (!selectedOrder) return;

    let newOrder = { ...selectedOrder, [field]: value } as OrderItem;

    // Reset discount to 0 if type changes
    if (field === "discount_type") {
      newOrder.discount_value = 0;
    }

    // Validation: Cap discount values
    let val = parseFloat(String(newOrder.discount_value)) || 0;
    if (val < 0) val = 0;

    if (newOrder.discount_type === "percentage" && val > 100) {
      val = 100;
    }

    if (
      newOrder.discount_type === "fixed" &&
      val > parseFloat(String(newOrder.price || 0))
    ) {
      val = parseFloat(String(newOrder.price || 0));
    }

    newOrder.discount_value = val;

    // Recalculate final_price if any price or discount field changes
    if (
      field === "price" ||
      field === "discount_value" ||
      field === "discount_type"
    ) {
      newOrder.final_price = calculateFinalPrice(
        newOrder.price,
        newOrder.discount_value,
        newOrder.discount_type || "fixed",
      );
    }

    setSelectedOrder(newOrder);
  };

  const saveOrderDetails = async () => {
    if (!selectedOrder) return;

    const validationResult = cmsOrderValidationSchema.safeParse({
      full_name: selectedOrder.full_name || "",
      phone_number: selectedOrder.phone_number || "",
      design_category: selectedOrder.design_category || "",
      selected_package: selectedOrder.selected_package || "",
      price:
        selectedOrder.price !== undefined &&
        selectedOrder.price !== null &&
        String(selectedOrder.price) !== ""
          ? Number(selectedOrder.price)
          : -1,
      final_price:
        selectedOrder.final_price !== undefined &&
        selectedOrder.final_price !== null &&
        String(selectedOrder.final_price) !== ""
          ? Number(selectedOrder.final_price)
          : selectedOrder.price !== undefined &&
              selectedOrder.price !== null &&
              String(selectedOrder.price) !== ""
            ? Number(selectedOrder.price)
            : -1,
      brief_detail: selectedOrder.brief_detail || "",
      deadline: selectedOrder.deadline || "",
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    setSavingDetails(true);
    try {
      if (selectedOrder.id === "NEW") {
        const now = new Date();
        const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "");
        const randomStr = Math.random()
          .toString(36)
          .substring(2, 5)
          .toUpperCase();
        const orderNumber = `GS-${dateStr}${randomStr}`;

        const payload = {
          order_number: orderNumber,
          status: selectedOrder.status || "DRAFT",
          client_id: selectedOrder.client_id || null,
          full_name: selectedOrder.full_name,
          phone_number: selectedOrder.phone_number,
          design_category: selectedOrder.design_category,
          selected_package: selectedOrder.selected_package,
          price: selectedOrder.price,
          discount_type: selectedOrder.discount_type || "fixed",
          discount_value: selectedOrder.discount_value || 0,
          final_price:
            selectedOrder.final_price !== undefined &&
            selectedOrder.final_price !== null
              ? selectedOrder.final_price
              : selectedOrder.price || 0,
          brief_detail: selectedOrder.brief_detail,
          deadline: selectedOrder.deadline,
          source_order: selectedOrder.source_order || "web-ops",
          deliverables_url: selectedOrder.deliverables_url || null,
          internal_notes: selectedOrder.internal_notes || null,
        };

        const { data, error: insertError } = await supabase
          .from("orders")
          .insert(payload)
          .select()
          .single();

        if (insertError) throw insertError;

        setOrders((prev) => [data as OrderItem, ...prev]);
        navigate(`/cms/orders/${data.order_number}`);
        addToast("Order baru berhasil dibuat.", "success");
      } else {
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            client_id: selectedOrder.client_id || null,
            full_name: selectedOrder.full_name,
            phone_number: selectedOrder.phone_number,
            design_category: selectedOrder.design_category,
            selected_package: selectedOrder.selected_package,
            price: selectedOrder.price || 0,
            discount_value: selectedOrder.discount_value || 0,
            discount_type: selectedOrder.discount_type || "fixed",
            final_price:
              selectedOrder.final_price !== undefined &&
              selectedOrder.final_price !== null
                ? selectedOrder.final_price
                : selectedOrder.price || 0,
            brief_detail: selectedOrder.brief_detail,
            deadline: selectedOrder.deadline || null,
            deliverables_url: selectedOrder.deliverables_url || null,
            internal_notes: selectedOrder.internal_notes || null,
          })
          .eq("id", selectedOrder.id);

        if (updateError) throw updateError;

        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? selectedOrder : o)),
        );
        addToast("Detail order berhasil diperbarui.", "success");
      }
    } catch (err: any) {
      addToast(`Gagal menyimpan detail: ${err.message}`, "error");
    } finally {
      setSavingDetails(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone_number?.includes(searchQuery) ||
      order.selected_package?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSendWhatsApp = () => {
    if (!selectedOrder) return;

    // Get phone number, remove non-digits, and ensure 62 prefix
    let phone = (selectedOrder.phone_number || "").replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "62" + phone.slice(1);
    }

    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/order/${selectedOrder.order_number}`;

    const message = `Halo ${selectedOrder.full_name},

📦 Update untuk pesanan Anda #${selectedOrder.order_number}:
Status: *${selectedOrder.status}*
Paket: ${selectedOrder.selected_package}

Cek detail pesanan selengkapnya di sini:
${publicUrl}

Terima kasih,
Gous Studio`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;

    addToast(`Membuka WhatsApp untuk ${selectedOrder.full_name}...`, "info");
    window.open(whatsappUrl, "_blank");
  };

  const selectedPricelist = pricelists.find(
    (p) => p.servicename === selectedOrder?.selected_package,
  );

  return (
    <div className="flex flex-col h-full">
      <CMSHeader
        title={
          selectedOrder ? (
            <div className="flex items-center gap-2">
              <span>Order Detail</span>
              <span className="text-slate-300 mx-1">-</span>
              <span className="text-brand-600 text-xl">
                {selectedOrder.order_number}
              </span>
              <a
                href={`${window.location.origin}/order/${selectedOrder.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-brand-500 rounded-lg hover:bg-brand-50 transition-all flex items-center justify-center ms-2"
                title="Buka Halaman Publik"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          ) : (
            "Data Orders"
          )
        }
        countText={
          !selectedOrder ? `${orders.length} order terdaftar` : undefined
        }
        onBack={selectedOrder ? () => navigate("/cms/orders") : undefined}
      >
        {!selectedOrder && (
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <CMSSelect
              icon={Filter}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              containerClassName="shrink-0 w-[160px]"
              className="!h-[38px] !rounded-lg text-xs"
            >
              <option value="ALL">Semua Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </CMSSelect>

            <CMSSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari Order..."
              className="w-44 shrink-0"
            />
            <CMSButton
              onClick={() => navigate("/cms/orders/new")}
              icon={Plus}
              className="shrink-0"
            >
              Tambah
            </CMSButton>
          </div>
        )}
      </CMSHeader>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Memuat data order...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      ) : selectedOrder ? (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
              {/* Left Column (Main Details) - 8 Cols */}
              <div className="lg:col-span-8 space-y-4">
                {/* Section: Detail Paket */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                      <Package size={12} className="text-slate-300" />
                      Detail Paket & Layanan
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex-1">
                        <CMSInput
                          label="Kategori"
                          leftIcon={<Tag size={14} />}
                          error={validationErrors.design_category}
                          placeholder="Kategori Desain"
                          value={selectedOrder.design_category || ""}
                          onChange={(e) =>
                            handleOrderChange("design_category", e.target.value)
                          }
                        />
                      </div>

                      <CMSSelect
                        icon={Package}
                        label="Paket Terpilih"
                        className={`${validationErrors.selected_package ? "border-rose-500" : "border-slate-200"} text-brand-600`}
                        value={selectedOrder.selected_package || ""}
                        onChange={(e) => {
                          const newPkg = e.target.value;
                          const pkgInfo = pricelists.find(
                            (p) => p.servicename === newPkg,
                          );
                          if (pkgInfo) {
                            setSelectedOrder({
                              ...selectedOrder,
                              selected_package: newPkg,
                              design_category: pkgInfo.category,
                              price: pkgInfo.finalprice,
                              final_price: calculateFinalPrice(
                                pkgInfo.finalprice,
                                selectedOrder.discount_value,
                                selectedOrder.discount_type || "fixed",
                              ),
                            });
                          } else {
                            handleOrderChange("selected_package", newPkg);
                          }
                        }}
                      >
                        <option value="">Pilih Paket...</option>
                        {pricelists.map((p) => (
                          <option key={p.servicename} value={p.servicename}>
                            {p.servicename}
                          </option>
                        ))}
                        <option value="Custom Package">Custom Package</option>
                        <option value="Other">Other</option>
                      </CMSSelect>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                      <CMSInput
                        label="Harga Base"
                        type="number"
                        leftIcon={<span className="text-xs font-bold">Rp</span>}
                        className="!bg-white"
                        value={selectedOrder.price || ""}
                        onChange={(e) =>
                          handleOrderChange("price", e.target.value)
                        }
                      />
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">
                          Discount
                        </label>
                        <div className="flex items-center gap-2">
                          <CMSInput
                            type="number"
                            min={0}
                            max={
                              selectedOrder.discount_type === "percentage"
                                ? 100
                                : selectedOrder.price || 0
                            }
                            className="text-rose-500 !bg-white"
                            value={selectedOrder.discount_value || ""}
                            onChange={(e) =>
                              handleOrderChange(
                                "discount_value",
                                e.target.value,
                              )
                            }
                          />
                          <CMSSelect
                            containerClassName="shrink-0 w-[60px]"
                            className="!pl-3 !pr-6 !text-[11px]"
                            value={selectedOrder.discount_type || "fixed"}
                            onChange={(e) =>
                              handleOrderChange("discount_type", e.target.value)
                            }
                          >
                            <option value="fixed">Rp</option>
                            <option value="percentage">%</option>
                          </CMSSelect>
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
                        className="!bg-emerald-50 !border-emerald-200 !text-emerald-600 font-bold truncate"
                        value={(() => {
                          const fp =
                            selectedOrder.final_price ?? selectedOrder.price;
                          return Number(fp) === 0
                            ? "GRATIS"
                            : Number(fp || 0).toLocaleString("id-ID");
                        })()}
                      />
                    </div>

                    {/* Package Summary Card */}
                    {selectedPricelist && (
                      <div className="bg-brand-50/30 border border-brand-100 rounded-xl p-4 space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shrink-0">
                              <CheckCircle2 size={16} className="text-white" />
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
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-md">
                                {selectedPricelist.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 shrink-0">
                            <div className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg flex items-center gap-1.5">
                              <Clock size={12} className="text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-600">
                                {selectedPricelist.duration} hari
                              </span>
                            </div>
                            <div className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg flex items-center gap-1.5">
                              {selectedPricelist.isrevisionunlimited ? (
                                <Infinity
                                  size={12}
                                  className="text-slate-400"
                                />
                              ) : (
                                <RefreshCw
                                  size={12}
                                  className="text-slate-300"
                                />
                              )}
                              <span className="text-[11px] font-bold text-slate-600">
                                {selectedPricelist.isrevisionunlimited
                                  ? "Unlimited"
                                  : `${selectedPricelist.totalrevision}x`}{" "}
                                Rev
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Deliverables List */}
                        {selectedPricelist.deliverables &&
                          selectedPricelist.deliverables.length > 0 && (
                            <div className="pt-3 border-t border-brand-100/50">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Apa yang didapat:
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedPricelist.deliverables.map(
                                  (item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 text-xs text-slate-600"
                                    >
                                      <Check
                                        size={12}
                                        className="text-brand-500 mt-0.5 shrink-0"
                                      />
                                      <span className="font-medium">
                                        {item}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Brief & Catatan Project */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                      <FileText size={12} className="text-slate-300" />
                      Brief & Catatan Project
                    </h3>
                  </div>
                  <div className="p-5 space-y-6">
                    {/* Brief Detail */}
                    <CMSInput
                      label="Detail Brief Pelanggan"
                      isTextArea
                      isBold={false}
                      ref={briefTextareaRef}
                      error={validationErrors.brief_detail}
                      className="min-h-[100px] !bg-white overflow-hidden"
                      value={selectedOrder.brief_detail || ""}
                      onChange={(e) =>
                        handleOrderChange("brief_detail", e.target.value)
                      }
                      placeholder="Detail permintaan desain..."
                    />

                    {/* Internal Notes */}
                    <div className="pt-4 border-t border-slate-50">
                      <CMSInput
                        label="Catatan Internal Admin"
                        isTextArea
                        isBold={false}
                        className="min-h-[64px] !bg-slate-50/50"
                        value={selectedOrder.internal_notes || ""}
                        onChange={(e) =>
                          handleOrderChange("internal_notes", e.target.value)
                        }
                        placeholder="Catatan rahasia admin..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar Controls) - 4 Cols */}
              <div className="lg:col-span-4 space-y-4">
                {/* Panel: Status & Deadline */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                      <Clock size={12} className="text-slate-300" />
                      Status & Deadline
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <CMSSelect
                      label="Status Progres"
                      className={`w-full text-xs font-bold transition-all !pr-10
                                 ${
                                   selectedOrder.status === "DONE"
                                     ? "!bg-emerald-50 !text-emerald-700 !border-emerald-200 focus:!ring-emerald-500/10 focus:!border-emerald-500"
                                     : selectedOrder.status === "IN PROGRESS"
                                       ? "!bg-blue-50 !text-blue-700 !border-blue-200 focus:!ring-blue-500/10 focus:!border-blue-500"
                                       : selectedOrder.status === "REVISION"
                                         ? "!bg-rose-50 !text-rose-700 !border-rose-200 focus:!ring-rose-500/10 focus:!border-rose-500"
                                         : selectedOrder.status === "REVIEWED"
                                           ? "!bg-purple-50 !text-purple-700 !border-purple-200 focus:!ring-purple-500/10 focus:!border-purple-500"
                                           : selectedOrder.status ===
                                               "WAITING FOR PAYMENT"
                                             ? "!bg-orange-50 !text-orange-700 !border-orange-200 focus:!ring-orange-500/10 focus:!border-orange-500"
                                             : "!bg-slate-100 !text-slate-600 !border-slate-200 focus:!ring-slate-500/10"
                                 }`}
                      value={selectedOrder.status || "DRAFT"}
                      onChange={(e) => {
                        updateOrderStatus(selectedOrder.id, e.target.value);
                        setSelectedOrder({
                          ...selectedOrder,
                          status: e.target.value as OrderItem["status"],
                        });
                      }}
                      disabled={updatingId === selectedOrder.id}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </CMSSelect>

                    <CMSInfoItem
                      label="Dibuat pada"
                      icon={Calendar}
                      value={
                        selectedOrder.created_at
                          ? new Date(selectedOrder.created_at).toLocaleString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"
                      }
                    />

                    <CMSInput
                      label="Deadline Target"
                      labelRight={
                        selectedOrder.status !== "DONE" &&
                        selectedOrder.deadline && (
                          <CMSBadge
                            variant={
                              (calculateDaysLeft(selectedOrder.deadline) ?? 0) <
                              0
                                ? "status"
                                : "brand"
                            }
                            status={
                              (calculateDaysLeft(selectedOrder.deadline) ?? 0) <
                              0
                                ? "REVISION"
                                : undefined
                            }
                            className="!rounded-md"
                          >
                            {(calculateDaysLeft(selectedOrder.deadline) ?? 0) >
                            0
                              ? `${calculateDaysLeft(selectedOrder.deadline)} Hari lagi`
                              : (calculateDaysLeft(selectedOrder.deadline) ??
                                    0) === 0
                                ? "Deadline Hari Ini"
                                : `Terlambat ${Math.abs(calculateDaysLeft(selectedOrder.deadline) ?? 0)} Hari`}
                          </CMSBadge>
                        )
                      }
                      type="date"
                      leftIcon={<Calendar size={14} />}
                      error={validationErrors.deadline}
                      value={
                        selectedOrder.deadline
                          ? selectedOrder.deadline.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleOrderChange("deadline", e.target.value)
                      }
                    />
                    <CMSInput
                      label="Deliverables Link"
                      labelRight={
                        selectedOrder.deliverables_url && (
                          <a
                            href={selectedOrder.deliverables_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:text-brand-600 flex items-center gap-1 text-[10px] font-bold"
                          >
                            <ExternalLink size={10} /> Link Buka
                          </a>
                        )
                      }
                      type="url"
                      leftIcon={<FileText size={14} />}
                      className="!text-brand-600 truncate"
                      value={selectedOrder.deliverables_url || ""}
                      onChange={(e) =>
                        handleOrderChange("deliverables_url", e.target.value)
                      }
                      placeholder="Link Google Drive / URL Hasil Desain"
                    />
                  </div>
                </div>
                {/* Panel: Informasi Pelanggan */}
                <div className="bg-white border border-slate-200 rounded-2xl">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                      <Users size={12} className="text-slate-300" />
                      Pelanggan
                    </h3>
                    <button
                      onClick={() => setIsClientModalOpen(true)}
                      className="text-brand-500 hover:text-brand-600 flex items-center gap-1 text-[10px] font-bold transition-all cursor-pointer"
                    >
                      <Plus size={10} /> Client Baru
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-4">
                      <div
                        className="space-y-1.5 relative"
                        ref={clientDropdownRef}
                      >
                        <CMSInput
                          label="Nama Lengkap"
                          leftIcon={<User size={14} />}
                          error={validationErrors.full_name}
                          placeholder="Cari atau ketik nama..."
                          value={
                            showClientDropdown
                              ? clientSearchQuery
                              : selectedOrder.full_name || ""
                          }
                          onChange={(e) => {
                            setClientSearchQuery(e.target.value);
                            handleOrderChange("full_name", e.target.value);
                            if (!showClientDropdown)
                              setShowClientDropdown(true);
                          }}
                          onFocus={() => {
                            setShowClientDropdown(true);
                            setClientSearchQuery(selectedOrder.full_name || "");
                          }}
                        />

                        {/* Client Dropdown Results */}
                        {showClientDropdown && (
                          <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                            {(() => {
                              const filtered = clients.filter((c) =>
                                c.full_name
                                  ?.toLowerCase()
                                  .includes(clientSearchQuery.toLowerCase()),
                              );
                              if (filtered.length === 0) {
                                return (
                                  <div className="px-5 py-4 text-center">
                                    <p className="text-[11px] text-slate-400 font-medium">
                                      Pelanggan tidak ditemukan
                                    </p>
                                    <button
                                      onClick={() => setIsClientModalOpen(true)}
                                      className="mt-2 text-[10px] font-bold text-brand-500 cursor-pointer"
                                    >
                                      + Buat "{clientSearchQuery}"
                                    </button>
                                  </div>
                                );
                              }
                              return filtered.map((client) => (
                                <button
                                  key={client.id}
                                  onClick={() => handleSelectClient(client)}
                                  className="w-full text-left px-5 py-3 hover:bg-brand-50 transition-all flex items-center justify-between group border-b border-slate-50 last:border-0"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-700 group-hover:text-brand-600 transition-colors">
                                        {client.full_name}
                                      </span>
                                      {client.client_no !== undefined && (
                                        <span className="text-[9px] font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
                                          {formatClientId(client.client_no)}
                                        </span>
                                      )}
                                    </div>
                                    {client.company && (
                                      <p className="text-[10px] text-slate-400 font-medium">
                                        {client.company}
                                      </p>
                                    )}
                                  </div>
                                  <ChevronRight
                                    size={14}
                                    className="text-slate-200 group-hover:text-brand-400 transition-all group-hover:translate-x-0.5"
                                  />
                                </button>
                              ));
                            })()}
                          </div>
                        )}
                      </div>

                      <CMSInput
                        label="WhatsApp / Nomor HP"
                        leftIcon={
                          <span className="text-[11px] font-bold">WA</span>
                        }
                        error={validationErrors.phone_number}
                        placeholder="08xxxxxxxx"
                        value={selectedOrder.phone_number || ""}
                        onChange={(e) =>
                          handleOrderChange("phone_number", e.target.value)
                        }
                      />

                      <button
                        onClick={handleSendWhatsApp}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 !text-white py-3 rounded-xl font-bold text-[11px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 cursor-pointer"
                      >
                        <MessageCircle size={16} className="!text-white" />
                        Update Progres via WhatsApp
                      </button>
                    </div>
                  </div>
                </div>

                {/* Proof of Payment Section */}
                {selectedOrder.payment_proof_url && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                      <ImageIcon size={12} className="text-emerald-500" />
                      Bukti Pembayaran Terlampir
                    </h3>
                    <div
                      className="relative group rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-video cursor-zoom-in group"
                      onClick={() =>
                        window.open(selectedOrder.payment_proof_url, "_blank")
                      }
                    >
                      <img
                        src={selectedOrder.payment_proof_url}
                        alt="Bukti Pembayaran"
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Maximize2
                          size={32}
                          className="text-white transform scale-75 group-hover:scale-110 transition-transform"
                        />
                      </div>
                    </div>
                    {selectedOrder.status === "WAITING FOR PAYMENT" && (
                      <CMSButton
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, "IN PROGRESS")
                        }
                        loading={updatingId === selectedOrder.id}
                        className="w-full mt-2 py-3"
                      >
                        Konfirmasi Pembayaran & Kerjakan
                      </CMSButton>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Detail Footer (Bottom Bar) */}
          <div className="fixed lg:absolute bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-end gap-3 z-30 px-6 md:px-8">
            <CMSButton variant="ghost" onClick={() => setSelectedOrder(null)}>
              Batal
            </CMSButton>
            <CMSButton
              onClick={saveOrderDetails}
              loading={savingDetails}
              icon={CheckCircle2}
            >
              Simpan Perubahan
            </CMSButton>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden pt-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold mb-1">
                {searchQuery
                  ? "Tidak ada hasil ditemukan"
                  : "Belum ada data order"}
              </p>
              <p className="text-slate-400 text-sm">
                {searchQuery
                  ? "Coba kata kunci lain"
                  : "Klik tombol 'Tambah' untuk membuat order pertama"}
              </p>
            </div>
          ) : (
            <CMSTableContainer>
              <CMSTableHeader>
                <CMSTableHeaderCell>Order ID & Tanggal</CMSTableHeaderCell>
                <CMSTableHeaderCell>Pelanggan</CMSTableHeaderCell>
                <CMSTableHeaderCell>Paket / Kategori</CMSTableHeaderCell>
                <CMSTableHeaderCell align="right">
                  Final Price
                </CMSTableHeaderCell>
                <CMSTableHeaderCell className="hidden md:table-cell">
                  Deadline
                </CMSTableHeaderCell>
                <CMSTableHeaderCell>Status</CMSTableHeaderCell>
                <CMSTableHeaderCell />
              </CMSTableHeader>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map((order) => (
                  <CMSTableRow key={order.id}>
                    <CMSTableCell>
                      <button
                        onClick={() =>
                          navigate(`/cms/orders/${order.order_number}`)
                        }
                        className="font-bold text-brand-500 hover:text-brand-600 hover:underline transition-all flex items-center gap-1 cursor-pointer"
                      >
                        #{order.order_number}
                      </button>
                      <div className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </CMSTableCell>
                    <CMSTableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-700 text-sm">
                          {order.full_name}
                        </div>
                        {order.payment_proof_url && (
                          <div
                            className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-bold flex items-center gap-1"
                            title="Bukti Bayar Tersedia"
                          >
                            <ImageIcon size={8} /> BUKTI
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">
                        {order.phone_number}
                      </div>
                    </CMSTableCell>
                    <CMSTableCell>
                      <div className="font-bold text-slate-700 text-xs">
                        {order.selected_package}
                      </div>
                      <div className="text-[10px] text-brand-500 font-bold mt-0.5">
                        {order.design_category}
                      </div>
                    </CMSTableCell>
                    <CMSTableCell align="right">
                      <span className="text-emerald-700 font-bold text-xs">
                        {Number(order.final_price || 0) === 0
                          ? "GRATIS"
                          : `Rp ${(order.final_price || 0).toLocaleString("id-ID")}`}
                      </span>
                    </CMSTableCell>
                    <CMSTableCell className="hidden md:table-cell">
                      {order.deadline ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(order.deadline).toLocaleDateString("id-ID")}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </CMSTableCell>
                    <CMSTableCell>
                      <CMSSelect
                        containerClassName="max-w-[180px]"
                        className={`w-full text-[10px] !h-auto py-1 font-bold transition-all rounded-lg
                                   ${
                                     order.status === "DONE"
                                       ? "!bg-emerald-50 !text-emerald-700 !border-emerald-200 focus:!ring-emerald-500/10"
                                       : order.status === "IN PROGRESS"
                                         ? "!bg-blue-50 !text-blue-700 !border-blue-200 focus:!ring-blue-500/10"
                                         : order.status === "REVISION"
                                           ? "!bg-rose-50 !text-rose-700 !border-rose-200 focus:!ring-rose-500/10"
                                           : order.status === "REVIEWED"
                                             ? "!bg-purple-50 !text-purple-700 !border-purple-200 focus:!ring-purple-500/10"
                                             : order.status ===
                                                 "WAITING FOR PAYMENT"
                                               ? "!bg-orange-50 !text-orange-700 !border-orange-200 focus:!ring-orange-500/10"
                                               : "!bg-slate-100 !text-slate-600 !border-slate-200 focus:!ring-slate-500/10"
                                   }`}
                        value={order.status || "DRAFT"}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        disabled={updatingId === order.id}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </CMSSelect>
                    </CMSTableCell>
                    <CMSTableCell align="right">
                      <CMSButton
                        variant="danger"
                        onClick={() =>
                          deleteOrder(order.id, order.order_number)
                        }
                        loading={updatingId === order.id}
                        icon={Trash2}
                        iconSize={14}
                        title="Hapus Order"
                      />
                    </CMSTableCell>
                  </CMSTableRow>
                ))}
              </tbody>
            </CMSTableContainer>
          )}
        </div>
      )}

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={handleClientModalSuccess}
        initialData={
          clientSearchQuery
            ? ({ id: "NEW", full_name: clientSearchQuery } as any)
            : null
        }
      />
    </div>
  );
};

export default OrderCMS;
