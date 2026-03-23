import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import {
  Loader2,
  Search,
  ChevronRight,
  Clock,
  Infinity,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  MessageCircle,
  ChevronDown,
  Filter,
  Image as ImageIcon,
  Maximize2,
  Tag,
  Package,
  FileText,
} from "lucide-react";

const STATUSES = [
  "DRAFT",
  "WAITING FOR PAYMENT",
  "IN PROGRESS",
  "REVISION",
  "REVIEWED",
  "DONE",
];

const OrderCMS = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [savingDetails, setSavingDetails] = useState(false);
  const [pricelists, setPricelists] = useState([]);
  const briefTextareaRef = React.useRef(null);

  const calculateDaysLeft = (deadlineDateStr) => {
    if (!deadlineDateStr) return null;
    const deadline = new Date(deadlineDateStr);
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = deadline - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    if (briefTextareaRef.current) {
      briefTextareaRef.current.style.height = "auto";
      briefTextareaRef.current.style.height = `${briefTextareaRef.current.scrollHeight}px`;
    }
  }, [selectedOrder?.brief_detail]);

  useEffect(() => {
    fetchOrders();
    const fetchPricelists = async () => {
      const { data } = await supabase
        .from("pricelists")
        .select("*")
        .order("order_index");
      if (data) setPricelists(data);
    };
    fetchPricelists();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);
      if (updateError) throw updateError;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order,
        ),
      );

      // Also update selectedOrder if it's the one being updated
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(`Gagal update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const calculateFinalPrice = (price, discountValue, discountType) => {
    const p = parseFloat(price) || 0;
    const v = parseFloat(discountValue) || 0;
    if (discountType === "percentage") {
      return p - (p * v) / 100;
    }
    return p - v;
  };

  const handleOrderChange = (field, value) => {
    let newValue = value;

    // Validation: Cap percentage discount at 100
    if (field === "discount_value" || field === "discount_type") {
      const type =
        field === "discount_type" ? value : selectedOrder.discount_type;
      const val =
        field === "discount_value" ? value : selectedOrder.discount_value;

      if (type === "percentage" && parseFloat(val) > 100) {
        newValue = 100;
      }

      if (
        type === "fixed" &&
        parseFloat(val) > parseFloat(selectedOrder.price || 0)
      ) {
        newValue = parseFloat(selectedOrder.price || 0);
      }
    }

    let newOrder = { ...selectedOrder, [field]: newValue };

    // Clear value if type changes
    if (field === "discount_type") {
      newOrder.discount_value = 0;
      // Also need to recalculate final_price for the 0 discount_value
      newOrder.final_price = calculateFinalPrice(newOrder.price, 0, newValue);
    }

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
    setSavingDetails(true);
    try {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
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
      alert("Detail order berhasil diperbarui.");
    } catch (err) {
      alert(`Gagal menyimpan detail: ${err.message}`);
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

    window.open(whatsappUrl, "_blank");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DONE":
        return "bg-green-50 text-green-700 border-green-200";
      case "IN PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "WAITING FOR PAYMENT":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "REVIEWED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "REVISION":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const selectedPricelist = pricelists.find(
    (p) => p.servicename === selectedOrder?.selected_package,
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div className="flex items-start gap-4">
          {selectedOrder && (
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-1 p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-brand-500 hover:border-brand-200 hover:bg-brand-50 transition-all cursor-pointer"
              title="Kembali ke List Order"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-1.5 text-brand-500 text-[9px] font-bold mb-1 uppercase tracking-widest">
              <span>Manajemen</span>
              <ChevronRight className="w-3 h-3" />
              <span>Orders</span>
              {selectedOrder && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span>Detail</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              {selectedOrder ? (
                <>
                  <span>Order: {selectedOrder.order_number}</span>
                  <a
                    href={`/order/${selectedOrder.order_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-300 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                    title="Buka Link Status Order (Customer View)"
                  >
                    <ExternalLink size={18} />
                  </a>
                </>
              ) : (
                "Data Orders"
              )}
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100 w-fit">
              {selectedOrder
                ? `Dibuat pada: ${new Date(
                    selectedOrder.created_at,
                  ).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : `${orders.length} order terdaftar`}
            </p>
          </div>
        </div>

        {!selectedOrder && (
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Status Filter */}
            <div className="relative group min-w-[160px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 w-full shadow-sm transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none transition-transform group-focus-within:rotate-180" />
            </div>

            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Cari order, nama, atau no. WA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 w-full md:w-64 shadow-sm transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
        )}
      </header>

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
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col relative h-[calc(100vh-[180px])] min-h-[500px]">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column (Main) */}
              <div className="md:col-span-2 space-y-6 flex flex-col">
                <div>
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100">
                    Detail Paket
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                          Kategori
                        </label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none">
                            <Tag size={14} />
                          </div>
                          <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                            value={selectedOrder.design_category || ""}
                            onChange={(e) =>
                              handleOrderChange("design_category", e.target.value)
                            }
                            placeholder="Contoh: Social Media Design"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                          Paket Terpilih
                        </label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none">
                            <Package size={14} />
                          </div>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-9 py-2 text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold text-brand-600 cursor-pointer appearance-none"
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
                            {!pricelists.some(
                              (p) => p.servicename === "Custom Package",
                            ) && <option value="Custom Package">Custom Package</option>}
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none transition-transform group-focus-within:rotate-180" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                          Harga Base (Order)
                        </label>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold pointer-events-none group-focus-within:text-brand-500 transition-colors">
                            Rp
                          </span>
                          <input
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold"
                            value={selectedOrder.price || ""}
                            onChange={(e) =>
                              handleOrderChange("price", e.target.value)
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                          Discount
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-rose-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold"
                              value={selectedOrder.discount_value || ""}
                              onChange={(e) =>
                                handleOrderChange(
                                  "discount_value",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              min="0"
                              max={
                                selectedOrder.discount_type === "percentage"
                                  ? "100"
                                  : selectedOrder.price
                              }
                            />
                          </div>
                          <select
                            className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-slate-600 cursor-pointer focus:outline-none focus:border-brand-500"
                            value={selectedOrder.discount_type || "fixed"}
                            onChange={(e) =>
                              handleOrderChange("discount_type", e.target.value)
                            }
                          >
                            <option value="fixed">Rp</option>
                            <option value="percentage">%</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium font-bold text-emerald-500 tracking-tight">
                          Final Price (To Pay)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-[10px] font-bold">
                            Rp
                          </span>
                          <input
                            type="text"
                            readOnly
                            className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg pl-9 pr-3 py-2 text-sm text-emerald-600 focus:outline-none transition-all font-black"
                            value={(() => {
                              const fp =
                                selectedOrder.final_price !== undefined &&
                                selectedOrder.final_price !== null
                                  ? selectedOrder.final_price
                                  : selectedOrder.price;
                              return Number(fp) === 0
                                ? "GRATIS"
                                : new Intl.NumberFormat("id-ID").format(fp);
                            })()}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Compact Package Overview Card for Freelancers - Full Width */}
                    {selectedPricelist && (
                      <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3">
                        <div className="flex flex-col gap-2 mb-2 pb-2 border-b border-slate-100">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <CheckCircle2
                                size={12}
                                className="text-brand-500"
                              />
                              {selectedPricelist.servicename}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                <Clock size={9} /> {selectedPricelist.duration}{" "}
                                hr
                              </span>
                              <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {selectedPricelist.isrevisionunlimited ? (
                                  <Infinity size={9} />
                                ) : (
                                  <RefreshCw size={9} />
                                )}
                                {selectedPricelist.isrevisionunlimited
                                  ? "Unlimited"
                                  : `${selectedPricelist.totalrevision}x`}{" "}
                                Rev
                              </span>
                              <span className="text-[10px] whitespace-nowrap font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded shadow-sm border border-brand-100">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(selectedPricelist.finalprice)}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            {selectedPricelist.description}
                          </p>
                        </div>
                        {selectedPricelist.deliverables &&
                          selectedPricelist.deliverables.length > 0 && (
                            <div>
                              <span className="block text-[9px] uppercase font-bold text-slate-400 mb-1">
                                Deliverables:
                              </span>
                              <ul className="text-[10px] text-slate-600 pl-3 list-disc space-y-0.5">
                                {selectedPricelist.deliverables.map((d, i) => (
                                  <li key={i}>{d}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100">
                    Brief Project
                  </h3>
                  <div className="flex-1 flex flex-col">
                    <textarea
                      ref={briefTextareaRef}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none min-h-[120px] overflow-hidden"
                      value={selectedOrder.brief_detail || ""}
                      onChange={(e) =>
                        handleOrderChange("brief_detail", e.target.value)
                      }
                      placeholder="Masukkan detail brief pesanan di sini..."
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col pt-4">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100">
                    Catatan Internal (Admin Only)
                  </h3>
                  <div className="flex-1 flex flex-col">
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none min-h-[100px]"
                      value={selectedOrder.internal_notes || ""}
                      onChange={(e) =>
                        handleOrderChange("internal_notes", e.target.value)
                      }
                      placeholder="Masukkan catatan internal di sini (hanya terlihat oleh admin)..."
                    />
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100">
                    Sistem Order
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs text-slate-400 mb-1.5">
                        Status Saat Ini
                      </span>
                      <select
                        className={`w-full text-xs font-bold rounded-lg px-3 py-2 border appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${getStatusColor(selectedOrder.status)}`}
                        value={selectedOrder.status || "DRAFT"}
                        onChange={(e) => {
                          updateOrderStatus(selectedOrder.id, e.target.value);
                          setSelectedOrder({
                            ...selectedOrder,
                            status: e.target.value,
                          });
                        }}
                        disabled={updatingId === selectedOrder.id}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-xs text-slate-400 font-medium">
                          Deadline
                        </label>
                        {selectedOrder.status !== "DONE" &&
                          selectedOrder.deadline && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                calculateDaysLeft(selectedOrder.deadline) < 0
                                  ? "text-red-600 bg-red-50 border-red-200"
                                  : calculateDaysLeft(
                                        selectedOrder.deadline,
                                      ) === 0
                                    ? "text-orange-600 bg-orange-50 border-orange-200"
                                    : "text-orange-500 bg-orange-50 border-orange-100"
                              }`}
                            >
                              {calculateDaysLeft(selectedOrder.deadline) > 0
                                ? `${calculateDaysLeft(selectedOrder.deadline)} hari lagi`
                                : calculateDaysLeft(selectedOrder.deadline) === 0
                                  ? `Hari ini`
                                  : `Terlewat ${Math.abs(calculateDaysLeft(selectedOrder.deadline))} hari`}
                            </span>
                          )}
                      </div>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none">
                          <Clock size={14} />
                        </div>
                        <input
                          type="date"
                          className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold"
                          value={
                            selectedOrder.deadline
                              ? selectedOrder.deadline.split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleOrderChange("deadline", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs text-slate-400 font-medium">
                          Link Deliverables (Google Drive)
                        </label>
                        {selectedOrder.deliverables_url && (
                          <a
                            href={selectedOrder.deliverables_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1 text-[10px] font-bold"
                          >
                            <ExternalLink size={10} />
                            Buka Link
                          </a>
                        )}
                      </div>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none">
                          <FileText size={14} />
                        </div>
                        <input
                          type="url"
                          className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm text-brand-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-bold placeholder:font-normal placeholder:text-slate-300"
                          value={selectedOrder.deliverables_url || ""}
                          onChange={(e) =>
                            handleOrderChange("deliverables_url", e.target.value)
                          }
                          placeholder="https://drive.google.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100">
                    Informasi Pelanggan
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">
                        Nama Lengkap
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        {selectedOrder.full_name}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">
                        WhatsApp
                      </span>
                      <span className="font-medium text-slate-700 text-sm">
                        {selectedOrder.phone_number}
                      </span>
                    </div>

                    <button
                      onClick={handleSendWhatsApp}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white !text-white py-2.5 rounded-lg font-bold text-[11px] transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98] cursor-pointer group"
                    >
                      <MessageCircle
                        size={14}
                        className="transition-transform group-hover:scale-110 !text-white"
                      />
                      <span className="!text-white">Kirim Update ke WA</span>
                    </button>
                  </div>
                </div>

                {/* Payment Proof Section - Sidebar Link */}
                {selectedOrder.payment_proof_url && (
                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 pb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon size={12} className="text-emerald-500" />
                        Bukti Pembayaran
                      </span>
                    </h3>
                    <div className="space-y-3">
                      <div
                        className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-zoom-in aspect-video transition-all duration-300"
                        onClick={() =>
                          window.open(selectedOrder.payment_proof_url, "_blank")
                        }
                      >
                        <img
                          src={selectedOrder.payment_proof_url}
                          alt="Bukti Pembayaran"
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <Maximize2
                            size={24}
                            className="text-white transform scale-90 group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      {selectedOrder.status === "WAITING FOR PAYMENT" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(selectedOrder.id, "IN PROGRESS")
                          }
                          disabled={updatingId === selectedOrder.id}
                          className="w-full mt-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold rounded-lg transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingId === selectedOrder.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 size={14} className="animate-spin" />
                              <span>Sedang Verifikasi...</span>
                            </div>
                          ) : (
                            "Konfirmasi & Kerjakan"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="p-3 md:px-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0 z-10">
            <button
              onClick={() => setSelectedOrder(null)}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 font-bold text-xs rounded-lg flex items-center gap-2 shadow-sm cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={saveOrderDetails}
              disabled={savingDetails}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all text-white font-bold text-xs rounded-lg flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none shadow-md shadow-brand-500/20 cursor-pointer"
            >
              {savingDetails ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 h-[calc(100vh-280px)] min-h-[400px]">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap border-separate border-spacing-0">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest sticky top-0 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
                <tr>
                  <th className="px-6 py-4">Order ID & Tanggal</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Paket / Kategori</th>
                  <th className="px-6 py-4 text-right">Final Price</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-slate-400 font-medium"
                    >
                      Tidak ada order ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-bold text-brand-500 hover:text-brand-600 hover:underline transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {order.order_number}
                        </button>
                        <div className="text-[10px] text-slate-400 mt-1">
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
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-700">
                            {order.full_name}
                          </div>
                          {order.payment_proof_url && (
                            <div
                              className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-black uppercase tracking-tighter flex items-center gap-1"
                              title="Bukti Bayar Tersedia"
                            >
                              <ImageIcon size={8} /> BUKTI
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {order.phone_number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">
                          {order.selected_package}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {order.design_category}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">
                          {Number(order.final_price || 0) === 0
                            ? "GRATIS"
                            : new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(order.final_price || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-medium text-xs">
                          {order.deadline
                            ? new Date(order.deadline).toLocaleDateString(
                                "id-ID",
                              )
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select
                            className={`text-xs font-bold rounded-lg px-3 py-1.5 border appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${getStatusColor(order.status || "DRAFT")} ${updatingId === order.id ? "opacity-50" : ""}`}
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
                          </select>
                          {updatingId === order.id ? (
                            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-slate-400" />
                          ) : (
                            <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 text-slate-400 pointer-events-none" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCMS;
