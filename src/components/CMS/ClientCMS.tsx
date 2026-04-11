import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Search,
  Plus,
  Users,
  Calendar,
  ShoppingBag,
  Clock,
  ExternalLink,
  Phone,
  Building2,
  FileText,
  User,
  Trash2,
  Pencil,
  Smile,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import CMSHeader from "./CMSHeader";
import { ClientItem, OrderItem } from "../../types";
import ClientModal from "./ClientModal";
import CMSButton from "./Common/CMSButton";
import CMSBadge from "./Common/CMSBadge";
import CMSSearchBar from "./Common/CMSSearchBar";
import CMSStatCard from "./Common/CMSStatCard";
import CMSInfoItem from "./Common/CMSInfoItem";
import CMSViewItem from "./Common/CMSViewItem";
import CMSEmptyState from "./Common/CMSEmptyState";
import {
  CMSTableContainer,
  CMSTableHeader,
  CMSTableHeaderCell,
  CMSTableRow,
  CMSTableCell,
} from "./Common/CMSTable";

const formatClientId = (no?: number) =>
  no !== undefined ? `CLT-${String(no).padStart(3, "0")}` : "—";

const ClientCMS: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { clientNo } = useParams<{ clientNo?: string }>();

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
  const viewMode = clientNo ? "DETAILS" : "LIST";
  const [clientOrders, setClientOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Sync selectedClient with URL parameter
  useEffect(() => {
    if (clientNo === "new") {
      setSelectedClient({
        id: "NEW",
        full_name: "",
        phone_number: "",
        company: "",
        notes: "",
        created_at: new Date().toISOString(),
      });
      setIsModalOpen(true);
    } else if (clientNo) {
      const client = clients.find(
        (c) => formatClientId(c.client_no) === clientNo,
      );
      if (client) {
        setSelectedClient(client);
        fetchClientOrders(client.id);
      }
    } else {
      setSelectedClient(null);
      setClientOrders([]);
    }
  }, [clientNo, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/clients?action=get");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch clients");
      }
      const result = await res.json();
      setClients((result.data as ClientItem[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setSelectedClient({
      id: "NEW",
      full_name: "",
      phone_number: "",
      company: "",
      notes: "",
      created_at: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!selectedClient) return;
    setIsModalOpen(true);
  };

  const handleEditClient = (client: ClientItem) => {
    navigate(`/cms/clients/${formatClientId(client.client_no)}`);
  };

  const fetchClientOrders = async (clientId: string) => {
    try {
      setLoadingOrders(true);
      const res = await fetch(
        `/api/cms/orders?action=get&clientId=${clientId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch client orders");
      const result = await res.json();
      const allOrders = (result.data as OrderItem[]) || [];
      // Filter client orders client-side since get-orders returns all
      setClientOrders(allOrders.filter((o) => o.client_id === clientId));
    } catch (err: any) {
      addToast(`Gagal memuat history order: ${err.message}`, "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateClientField = (field: keyof ClientItem, value: string) => {
    if (!selectedClient) return;
    setSelectedClient({ ...selectedClient, [field]: value });
  };

  const handleModalSuccess = (client: ClientItem) => {
    fetchClients();
    // Redirect to the new client's details page if it was a new creation
    if (selectedClient?.id === "NEW") {
      navigate(`/cms/clients/${formatClientId(client.client_no)}`);
    } else if (
      viewMode === "DETAILS" &&
      (selectedClient?.id === client.id ||
        (clientNo && formatClientId(client.client_no) === clientNo))
    ) {
      setSelectedClient(client);
    }
    setIsModalOpen(false);
  };

  const handleBackToList = () => {
    navigate("/cms/clients");
  };

  const deleteClient = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Hapus client "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/cms/clients?action=delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete client");
      setClients((prev) => prev.filter((c) => c.id !== id));
      setSelectedClient(null);
      addToast(`Client "${name}" berhasil dihapus.`, "success");
    } catch (err: any) {
      addToast(`Gagal menghapus: ${err.message}`, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.phone_number?.includes(q) ||
      formatClientId(c.client_no).toLowerCase().includes(q)
    );
  });

  const isNew = selectedClient?.id === "NEW";

  return (
    <div className="flex flex-col h-full">
      <CMSHeader
        title={
          viewMode === "DETAILS" && selectedClient ? (
            <div className="flex items-center gap-2">
              <span>Detail Client</span>
              <span className="text-slate-400 mx-1">-</span>
              <span className="text-brand-600 text-xl font-bold">
                {formatClientId(selectedClient.client_no)}
              </span>
            </div>
          ) : (
            "Data Clients"
          )
        }
        countText={
          viewMode === "LIST" ? `${clients.length} client terdaftar` : undefined
        }
        onBack={viewMode === "DETAILS" ? handleBackToList : undefined}
      >
        {viewMode === "LIST" && (
          <div className="flex items-center gap-2">
            <CMSSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari Nama/Perusahaan..."
              className="w-full md:w-64"
            />
            <CMSButton
              onClick={handleAddClient}
              icon={Plus}
              className="shrink-0"
            >
              Tambah
            </CMSButton>
          </div>
        )}
      </CMSHeader>

      <div className="flex-1 min-h-0 flex flex-col pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Memuat data client...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
        ) : viewMode === "DETAILS" && selectedClient ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0 overflow-hidden pb-4">
            {/* Left Panel: Client Info */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-1">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col relative">
                {/* Header Action Buttons (Edit/Delete) */}
                <div className="absolute top-6 right-6 flex items-center gap-1">
                  {!isNew && (
                    <>
                      <CMSButton
                        variant="ghost"
                        onClick={handleOpenEditModal}
                        icon={Pencil}
                        iconSize={14}
                        title="Edit Client"
                      />
                      <CMSButton
                        variant="danger"
                        onClick={() =>
                          deleteClient(
                            selectedClient.id,
                            selectedClient.full_name,
                          )
                        }
                        icon={Trash2}
                        iconSize={14}
                        title="Hapus Client"
                      />
                    </>
                  )}
                </div>

                <div className="p-6">
                  {/* Top: Avatar & Name */}
                  <div className="flex items-center gap-4 mb-4 pr-20">
                    <div className="shrink-0">
                      {selectedClient.photo_url ? (
                        <div
                          className="rounded-lg overflow-hidden"
                          style={{ width: 88, height: 40 }}
                        >
                          <img
                            src={selectedClient.photo_url}
                            alt={selectedClient.full_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-[42px] h-[42px] rounded-full bg-brand-500/10 flex items-center justify-center">
                          <span className="text-brand-500 font-bold text-lg leading-none">
                            {selectedClient.full_name
                              ?.charAt(0)
                              .toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 mb-1 leading-tight">
                        {selectedClient.full_name}
                      </h2>
                    </div>
                  </div>

                  {/* List Data */}
                  <div className="flex flex-col mt-4 border-t border-slate-100 pt-2">
                    <CMSViewItem
                      label="Phone Number"
                      value={selectedClient.phone_number || "—"}
                      icon={Phone}
                    />
                    <CMSViewItem
                      label="Company"
                      value={selectedClient.company || "—"}
                      icon={Building2}
                      className="!border-0"
                    />
                    <div className="pt-2">
                      <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-md">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                          <FileText size={14} className="text-slate-500" />
                          Customer Notes
                        </label>
                        <span className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {selectedClient.notes || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Value Card */}
              {(() => {
                const totalTransactions = clientOrders.length;
                const totalSpend = clientOrders.reduce(
                  (sum, order) => sum + (order.final_price ?? order.price ?? 0),
                  0,
                );
                const averageSpend =
                  totalTransactions > 0 ? totalSpend / totalTransactions : 0;

                return (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shrink-0">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                      <ShoppingBag size={12} className="text-slate-400" />
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Customer Value
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 p-5 border-b border-slate-100 relative bg-white gap-4">
                      {/* Vertical divider */}
                      <div className="absolute left-1/2 top-5 bottom-5 w-px bg-slate-100 hidden sm:block"></div>

                      <div className="pr-2">
                        <span className="text-sm font-medium text-slate-600 block mb-1">
                          Total Transactions
                        </span>
                        <span className="text-lg font-bold text-slate-800">
                          {totalTransactions}
                        </span>
                      </div>

                      <div className="sm:pl-4">
                        <span className="text-sm font-medium text-slate-600 block mb-1">
                          Total Spend
                        </span>
                        <span className="text-lg font-bold text-slate-800">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(totalSpend)}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50/20">
                      <span className="text-sm font-medium text-slate-600 block mb-1">
                        Average Spend per Purchase
                      </span>
                      <span className="text-lg font-bold text-slate-800">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(averageSpend)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right Panel: Order History */}
            <div className="lg:col-span-8 flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wider">
                  <Clock size={12} className="text-slate-400" />
                  History Order
                </h3>
                {loadingOrders && (
                  <Loader2 size={14} className="text-brand-500 animate-spin" />
                )}
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar p-6">
                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2
                      size={32}
                      className="text-brand-500 animate-spin mb-3"
                    />
                    <p className="text-slate-400 text-xs font-medium">
                      Memuat history...
                    </p>
                  </div>
                ) : clientOrders.length === 0 ? (
                  <CMSEmptyState
                    icon={ShoppingBag}
                    title={`Client "${selectedClient.full_name}"`}
                    description="Belum memiliki riwayat transaksi atau order saat ini."
                    containerClassName="py-20"
                  />
                ) : (
                  <CMSTableContainer>
                    <CMSTableHeader>
                      <CMSTableHeaderCell>Order Unit</CMSTableHeaderCell>
                      <CMSTableHeaderCell>Paket & Kategori</CMSTableHeaderCell>
                      <CMSTableHeaderCell>Status</CMSTableHeaderCell>
                      <CMSTableHeaderCell align="right">
                        Harga
                      </CMSTableHeaderCell>
                    </CMSTableHeader>
                    <tbody className="divide-y divide-slate-50">
                      {clientOrders.map((order) => (
                        <CMSTableRow key={order.id} className="cursor-default">
                          <CMSTableCell>
                            <button
                              onClick={() =>
                                navigate(`/cms/orders/${order.order_number}`)
                              }
                              className="text-xs font-bold text-brand-500 hover:text-brand-600 hover:underline transition-all cursor-pointer block mb-1"
                            >
                              #{order.order_number}
                            </button>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                              <Calendar size={10} />
                              {new Date(order.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </CMSTableCell>
                          <CMSTableCell>
                            <div className="text-xs font-bold text-slate-700">
                              {order.selected_package}
                            </div>
                            <div className="text-[10px] text-brand-500 font-bold">
                              {order.design_category}
                            </div>
                          </CMSTableCell>
                          <CMSTableCell>
                            <CMSBadge variant="status" status={order.status}>
                              {order.status}
                            </CMSBadge>
                          </CMSTableCell>
                          <CMSTableCell align="right">
                            <div className="text-xs font-bold text-emerald-600">
                              Rp{" "}
                              {(order.final_price || 0).toLocaleString("id-ID")}
                            </div>
                          </CMSTableCell>
                        </CMSTableRow>
                      ))}
                    </tbody>
                  </CMSTableContainer>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ─── List Table View ─── */
          <>
            {filteredClients.length === 0 ? (
              <CMSEmptyState
                icon={Users}
                title={
                  searchQuery
                    ? "Tidak ada hasil ditemukan"
                    : "Belum ada data client"
                }
                description={
                  searchQuery
                    ? "Coba gunakan kata kunci pencarian yang lain."
                    : "Klik tombol 'Tambah' untuk mendaftarkan client pertama."
                }
              />
            ) : (
              <CMSTableContainer className="flex-1 !overflow-y-auto custom-scrollbar">
                <CMSTableHeader>
                  <CMSTableHeaderCell width="130px">
                    Client ID
                  </CMSTableHeaderCell>
                  <CMSTableHeaderCell>Nama</CMSTableHeaderCell>
                  <CMSTableHeaderCell>Perusahaan</CMSTableHeaderCell>
                  <CMSTableHeaderCell className="hidden md:table-cell">
                    No. HP
                  </CMSTableHeaderCell>
                  <CMSTableHeaderCell className="hidden lg:table-cell">
                    Catatan
                  </CMSTableHeaderCell>
                  <CMSTableHeaderCell />
                </CMSTableHeader>
                <tbody className="divide-y divide-slate-50">
                  {filteredClients.map((client) => (
                    <CMSTableRow key={client.id}>
                      <CMSTableCell>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="font-bold text-brand-500 hover:text-brand-600 hover:underline transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {formatClientId(client.client_no)}
                        </button>
                        <div className="text-[10px] text-slate-500 mt-1 whitespace-nowrap">
                          {new Date(client.created_at).toLocaleDateString(
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full overflow-hidden bg-brand-500/10 flex items-center justify-center shrink-0 border border-slate-100">
                            {client.photo_url ? (
                              <img
                                src={client.photo_url}
                                alt={client.full_name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-brand-500 font-bold text-xs leading-none">
                                {client.full_name?.charAt(0).toUpperCase() ||
                                  "?"}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">
                            {client.full_name}
                          </span>
                        </div>
                      </CMSTableCell>
                      <CMSTableCell>
                        <span className="text-slate-600 text-sm font-medium">
                          {client.company || (
                            <span className="text-slate-400">—</span>
                          )}
                        </span>
                      </CMSTableCell>
                      <CMSTableCell className="hidden md:table-cell">
                        <span className="text-slate-600 text-sm font-medium">
                          {client.phone_number || (
                            <span className="text-slate-400">—</span>
                          )}
                        </span>
                      </CMSTableCell>
                      <CMSTableCell className="hidden lg:table-cell max-w-[200px]">
                        <span className="text-slate-500 text-xs truncate block">
                          {client.notes || (
                            <span className="text-slate-300">—</span>
                          )}
                        </span>
                      </CMSTableCell>
                      <CMSTableCell align="right">
                        <CMSButton
                          variant="danger"
                          onClick={() =>
                            deleteClient(client.id, client.full_name)
                          }
                          loading={deletingId === client.id}
                          icon={Trash2}
                          iconSize={14}
                          title="Hapus Client"
                        />
                      </CMSTableCell>
                    </CMSTableRow>
                  ))}
                </tbody>
              </CMSTableContainer>
            )}
          </>
        )}
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialData={selectedClient}
      />
    </div>
  );
};

export default ClientCMS;
