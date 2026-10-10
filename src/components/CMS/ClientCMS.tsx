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
  Copy,
  Link,
  RefreshCw,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "./Common/CMSConfirmDialog";
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
import CMSSkeleton from "./Common/CMSSkeleton";
import CMSTableSkeleton from "./Common/CMSTableSkeleton";
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
  const { confirm, confirmDialog } = useConfirm();
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
      setError(null);
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
    const ok = await confirm({
      title: `Hapus client "${name}"?`,
      description: "Data client akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
      destructive: true,
    });
    if (!ok) return;
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

  const handleCopyMagicLink = () => {
    if (!selectedClient?.magic_link_token) {
      addToast(
        "Client ini belum memiliki magic link. Harap perbarui database.",
        "error",
      );
      return;
    }
    const token = selectedClient.magic_link_token;
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        addToast("Magic link berhasil disalin!", "success");
      })
      .catch((err) => {
        addToast("Gagal menyalin link.", "error");
      });
  };

  const isNew = selectedClient?.id === "NEW";

  return (
    <div className="flex flex-col h-full">
      <CMSHeader
        title={
          viewMode === "DETAILS" && selectedClient ? (
            <div className="flex items-center gap-2">
              <span>Detail Client</span>
              <span className="text-ink/45 mx-1">-</span>
              <span className="text-violet-700 text-xl font-bold">
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

      <div
        className={`flex-1 min-h-0 flex flex-col ${viewMode === "DETAILS" && selectedClient && !loading && !error ? "" : "pt-6 pb-6"}`}
      >
        {loading ? (
          <CMSTableSkeleton rows={8} columns={5} label="Memuat data client..." />
        ) : error ? (
          <CMSEmptyState
            icon={AlertTriangle}
            iconClassName="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-[20px]"
            title="Client gagal dimuat"
            description={error}
            action={
              <CMSButton variant="secondary" icon={RotateCw} onClick={fetchClients}>
                Coba lagi
              </CMSButton>
            }
          />
        ) : viewMode === "DETAILS" && selectedClient ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start h-full min-h-0 overflow-y-auto custom-scrollbar pt-6 pb-6">
            {/* Left Panel: Client Info */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-white border border-ink/10 rounded-[20px] overflow-hidden flex flex-col shrink-0">
                {/* Top: Avatar, Name & Actions */}
                <div className="p-5 flex items-center gap-3 border-b border-ink/[0.06] shrink-0">
                  <div className="w-12 h-12 shrink-0 rounded-[14px] overflow-hidden bg-violet-600/10 border border-ink/[0.06] flex items-center justify-center">
                    {selectedClient.photo_url ? (
                      <img
                        src={selectedClient.photo_url}
                        alt={selectedClient.full_name}
                        className="w-full h-full object-contain bg-white"
                      />
                    ) : (
                      <span className="text-violet-600 font-bold text-lg leading-none">
                        {selectedClient.full_name?.charAt(0).toUpperCase() ||
                          "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-ink leading-tight truncate">
                      {selectedClient.full_name}
                    </h2>
                    <p className="text-[11px] text-muted font-medium mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      Client sejak{" "}
                      {new Date(selectedClient.created_at).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </p>
                  </div>
                  {!isNew && (
                    <div className="flex items-center gap-1 shrink-0">
                      <CMSButton
                        variant="ghost"
                        onClick={handleOpenEditModal}
                        icon={Pencil}
                        iconSize={14}
                        aria-label="Edit Client" title="Edit Client"
                      />
                      <CMSButton
                        variant="danger"
                        onClick={() =>
                          deleteClient(
                            selectedClient.id,
                            selectedClient.full_name,
                          )
                        }
                        loading={deletingId === selectedClient.id}
                        icon={Trash2}
                        iconSize={14}
                        aria-label="Hapus Client" title="Hapus Client"
                      />
                    </div>
                  )}
                </div>

                {/* List Data */}
                <div className="px-5 py-2 shrink-0">
                  <CMSViewItem
                    label="Phone Number"
                    value={selectedClient.phone_number || "—"}
                    icon={Phone}
                  />
                  <CMSViewItem
                    label="Company"
                    value={selectedClient.company || "—"}
                    icon={Building2}
                  />
                </div>

                {/* Notes */}
                <div className="px-5 pb-5">
                  <div className="flex flex-col gap-2 p-4 bg-paper/80 rounded-[14px] border border-ink/[0.03]">
                    <label className="gs-label text-[10px] text-muted flex items-center gap-1.5">
                      <FileText size={12} className="text-ink/45" />
                      Customer Notes
                    </label>
                    <div className="text-[13px] font-medium text-ink leading-relaxed whitespace-pre-wrap break-words">
                      {selectedClient.notes || (
                        <span className="text-ink/45 italic">Tidak ada catatan</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Value Card */}
              {(() => {
                const paidOrders = clientOrders.filter(
                  (order) => order.status !== "CANCELLED",
                );
                const totalTransactions = clientOrders.length;
                const totalSpend = paidOrders.reduce(
                  (sum, order) => sum + (order.final_price ?? order.price ?? 0),
                  0,
                );
                const averageSpend =
                  paidOrders.length > 0 ? totalSpend / paidOrders.length : 0;
                const formatIDR = (n: number) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(n);

                return (
                  <div className="bg-white border border-ink/10 rounded-[20px] overflow-hidden flex flex-col shrink-0">
                    <div className="px-6 py-4 border-b border-ink/[0.06] bg-paper/50 flex items-center gap-2">
                      <ShoppingBag size={12} className="text-ink/45" />
                      <h3 className="gs-label text-ink">Customer Value</h3>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-ink/[0.06] border-b border-ink/[0.06]">
                      <div className="px-5 py-4 min-w-0">
                        <span className="text-xs font-medium text-muted block mb-1">
                          Total Transactions
                        </span>
                        <span className="text-lg font-bold text-ink">
                          {totalTransactions}
                        </span>
                      </div>
                      <div className="px-5 py-4 min-w-0">
                        <span className="text-xs font-medium text-muted block mb-1">
                          Total Spend
                        </span>
                        <span className="text-lg font-bold text-ink truncate block">
                          {formatIDR(totalSpend)}
                        </span>
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <span className="text-xs font-medium text-muted block mb-1">
                        Average Spend per Purchase
                      </span>
                      <span className="text-lg font-bold text-ink">
                        {formatIDR(averageSpend)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Portal Magic Link Card */}
              {!isNew && (
                <div className="bg-white border border-ink/10 rounded-[20px] overflow-hidden flex flex-col shrink-0">
                  <div className="px-6 py-4 border-b border-ink/[0.06] bg-paper/50 flex items-center gap-2">
                    <Link size={12} className="text-ink/45" />
                    <h3 className="gs-label text-ink">Client Portal Link</h3>
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <p className="text-xs text-muted font-medium">
                      Bagikan link ini agar client dapat melihat seluruh riwayat
                      order dan file final mereka tanpa password.
                    </p>
                    {selectedClient.magic_link_token ? (
                      <button
                        onClick={handleCopyMagicLink}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-paper hover:bg-ink/5 border border-ink/15 hover:border-ink/40 text-ink rounded-full transition-colors font-semibold text-sm cursor-pointer"
                      >
                        <Copy size={16} />
                        Salin Magic Link
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-600 rounded-[10px] text-xs font-medium border border-amber-100">
                        <Loader2 size={14} className="motion-safe:animate-spin" />
                        Menunggu token generated di database...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Order History */}
            <div className="lg:col-span-8 min-w-0 bg-white border border-ink/10 rounded-[20px] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-ink/[0.06] bg-paper/50 flex items-center justify-between">
                <h3 className="gs-label text-ink flex items-center gap-2">
                  <Clock size={12} className="text-ink/45" />
                  History Order
                </h3>
                {!loadingOrders && clientOrders.length > 0 && (
                  <span className="text-[11px] font-semibold text-muted">
                    {clientOrders.length} order
                  </span>
                )}
              </div>

              <div className="overflow-x-auto p-6">
                {loadingOrders ? (
                  <div className="space-y-3" role="status" aria-label="Memuat history order">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-4 rounded-[14px] border border-ink/10 p-4">
                        <CMSSkeleton className="h-10 w-10 !rounded-full" />
                        <div className="flex-1 space-y-2">
                          <CMSSkeleton className={`h-3 ${["w-1/3", "w-1/2", "w-2/5"][i]}`} />
                          <CMSSkeleton className="h-2.5 w-1/4" />
                        </div>
                        <CMSSkeleton className="h-5 w-20 !rounded-full" />
                      </div>
                    ))}
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
                    <tbody className="divide-y divide-ink/[0.04]">
                      {clientOrders.map((order) => (
                        <CMSTableRow key={order.id} className="cursor-default">
                          <CMSTableCell>
                            <button
                              onClick={() =>
                                navigate(`/cms/orders/${order.order_number}`)
                              }
                              className="text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline transition-all cursor-pointer block mb-1"
                            >
                              #{order.order_number}
                            </button>
                            <div className="text-[10px] text-muted flex items-center gap-1 font-medium">
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
                            <div className="text-xs font-bold text-ink">
                              {order.selected_package}
                            </div>
                            <div className="text-[10px] text-violet-600 font-bold">
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
                <tbody className="divide-y divide-ink/[0.04]">
                  {filteredClients.map((client) => (
                    <CMSTableRow key={client.id}>
                      <CMSTableCell>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="font-bold text-violet-600 hover:text-violet-700 hover:underline transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {formatClientId(client.client_no)}
                        </button>
                        <div className="text-[10px] text-muted mt-1 whitespace-nowrap">
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
                          <div className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full overflow-hidden bg-violet-600/10 flex items-center justify-center shrink-0 border border-ink/[0.06]">
                            {client.photo_url ? (
                              <img
                                src={client.photo_url}
                                alt={client.full_name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-violet-600 font-bold text-xs leading-none">
                                {client.full_name?.charAt(0).toUpperCase() ||
                                  "?"}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-ink text-sm">
                            {client.full_name}
                          </span>
                        </div>
                      </CMSTableCell>
                      <CMSTableCell>
                        <span className="text-ink/70 text-sm font-medium">
                          {client.company || (
                            <span className="text-ink/45">—</span>
                          )}
                        </span>
                      </CMSTableCell>
                      <CMSTableCell className="hidden md:table-cell">
                        <span className="text-ink/70 text-sm font-medium">
                          {client.phone_number || (
                            <span className="text-ink/45">—</span>
                          )}
                        </span>
                      </CMSTableCell>
                      <CMSTableCell className="hidden lg:table-cell max-w-[200px]">
                        <span className="text-muted text-xs truncate block">
                          {client.notes || (
                            <span className="text-ink/30">—</span>
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
                          aria-label="Hapus Client" title="Hapus Client"
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
      {confirmDialog}
    </div>
  );
};

export default ClientCMS;
