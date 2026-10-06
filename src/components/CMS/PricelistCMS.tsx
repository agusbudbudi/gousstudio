import { motion } from "framer-motion";
import { EASE } from "../landing/primitives";
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import {
  Plus,
  Search,
  Save,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import CMSTableSkeleton from "./Common/CMSTableSkeleton";
import CMSEmptyState from "./Common/CMSEmptyState";
import { AlertTriangle, RotateCw } from "lucide-react";
import { useConfirm } from "./Common/CMSConfirmDialog";
import CMSHeader from "./CMSHeader";
import PricelistList from "./PricelistList";
import PricelistModal from "./PricelistModal";
import CMSButton from "./Common/CMSButton";
import CMSSearchBar from "./Common/CMSSearchBar";
import CMSAlertBanner from "./Common/CMSAlertBanner";

import { PricelistItem } from "../../types";

const PricelistCMS: React.FC = () => {
  const { addToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();
  const [items, setItems] = useState<PricelistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [pristineItems, setPristineItems] = useState<PricelistItem[]>([]);

  // Check if items have changed since last fetch/save
  const isDirty = React.useMemo(() => {
    if (loading) return false;

    const sanitize = (list: PricelistItem[]) =>
      JSON.stringify(
        list.map((item) => ({
          slug: (item as any).slug,
          servicename: item.servicename,
          description: item.description,
          retailprice: Number(item.retailprice) || 0,
          finalprice: Number(item.finalprice) || 0,
          duration: Number(item.duration) || 0,
          isrevisionunlimited: Boolean(item.isrevisionunlimited),
          totalrevision: Number(item.totalrevision) || 0,
          deliverables: [...(item.deliverables || [])].sort(),
          isShowToCustomer: Boolean(item.isShowToCustomer),
          service_id: item.service_id ?? null,
        })),
      );

    return sanitize(items) !== sanitize(pristineItems);
  }, [items, pristineItems, loading]);

  // Parent services for the "Layanan" field (services-as-parent model)
  const [services, setServices] = useState<{ id: number; title: string }[]>([]);
  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("id, title")
      .order("order_index", { ascending: true });
    setServices(data || []);
  };
  const serviceTitles = React.useMemo(
    () => Object.fromEntries(services.map((s) => [s.id, s.title])) as Record<number, string>,
    [services],
  );

  // Tabs = services (CMS order) that have packages, plus "Lainnya" for packages without a service
  const groupOf = (item: PricelistItem) => (item.service_id ? String(item.service_id) : "none");
  const groupLabel = (key: string) =>
    key === "All" ? "Semua Layanan" : key === "none" ? "Lainnya" : serviceTitles[Number(key)] ?? "Layanan dihapus";
  const categories = React.useMemo(() => {
    const present = new Set(items.map(groupOf));
    const ordered = services.map((s) => String(s.id)).filter((id) => present.has(id));
    const unknown = [...present].filter((k) => k !== "none" && !ordered.includes(k));
    return ["All", ...ordered, ...unknown, ...(present.has("none") ? ["none"] : [])];
  }, [items, services]);

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.servicename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groupLabel(groupOf(item)).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || groupOf(item) === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter, serviceTitles]);

  useEffect(() => {
    fetchPricelist();
    fetchServices();
  }, []);


  // `silent` refetches (after save) keep the list visible instead of flashing the skeleton
  const fetchPricelist = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("pricelists")
        .select("*")
        .order("order_index", { ascending: true });
      if (fetchError) throw fetchError;
      const itemsWithMapping = (data || []).map((row: any) => ({
        ...row,
        isShowToCustomer: Boolean(row.is_show_to_customer),
      }));
      setItems(itemsWithMapping || []);
      setPristineItems(itemsWithMapping || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: PricelistItem, index: number) => {
    setEditingItem({ ...item, _index: index });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (index: number) => {
    const ok = await confirm({
      title: "Hapus paket harga ini?",
      description: "Paket dihapus dari daftar. Perubahan baru tersimpan ke database setelah kamu klik Simpan.",
      destructive: true,
    });
    if (!ok) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    addToast(
      "Item berhasil dihapus (lokal). Klik 'Simpan' untuk memperbarui database.",
      "success",
    );
  };

  const handleToggleVisibility = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, isShowToCustomer: !item.isShowToCustomer }
          : item,
      ),
    );
    addToast(
      "Visibility diubah (lokal). Klik 'Simpan' untuk memperbarui database.",
      "info",
    );
  };

  const handleReorder = (index: number, direction: "up" | "down") => {
    setItems((prev) => {
      const arr = [...prev];
      if (direction === "up" && index > 0) {
        [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
      } else if (direction === "down" && index < arr.length - 1) {
        [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      }
      return arr;
    });
  };

  const handleSaveItem = (itemData: any) => {
    const { _index, ...rest } = itemData;
    if (_index !== undefined) {
      setItems((prev) => prev.map((item, i) => (i === _index ? rest : item)));
    } else {
      setItems((prev) => [rest, ...prev]);
    }
    setIsModalOpen(false);
    addToast(
      _index !== undefined
        ? "Item berhasil diperbarui (lokal)."
        : "Item berhasil ditambahkan (lokal).",
      "success",
    );
  };

  const persistToSupabase = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/cms/pricelists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: items }),
      });

      if (response.ok) {
        addToast("Pricelist berhasil disimpan ke Supabase!", "success");
        await fetchPricelist({ silent: true }); // Await the refresh
      } else {
        const err = await response.json();
        addToast(`Gagal menyimpan: ${err.message}`, "error");
      }
    } catch (err: any) {
      addToast(`Gagal menyimpan: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CMSHeader
        title="Manage Pricelist"
        countText={`${items.length} paket harga aktif`}
      >
        <CMSSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari pricelist..."
          className="w-full md:w-64"
        />

        <CMSButton
          variant="secondary"
          onClick={handleAddItem}
          icon={Plus}
          className="shrink-0 !font-bold"
        >
          Tambah
        </CMSButton>
        <CMSButton
          variant="primary"
          onClick={persistToSupabase}
          loading={saving}
          icon={Save}
          className="shrink-0 !font-bold"
        >
          Simpan
        </CMSButton>
      </CMSHeader>

      {/* Unsaved Changes Banner */}
      <div className="relative z-30">
        <CMSAlertBanner
          isVisible={isDirty}
          isSaving={saving}
          onSave={persistToSupabase}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-6">
        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="Layanan"
          className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar"
        >
          {categories.map((cat) => {
            const count =
              cat === "All"
                ? items.length
                : items.filter((i) => groupOf(i) === cat).length;

            return (
              <button
                key={cat}
                role="tab"
                aria-selected={categoryFilter === cat}
                onClick={() => setCategoryFilter(cat)}
                className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 transition-colors duration-200 ${
                  categoryFilter === cat
                    ? "border-ink text-paper"
                    : "border-ink/10 bg-white text-muted hover:border-ink/25 hover:text-ink"
                }`}
              >
                {categoryFilter === cat && (
                  <motion.span
                    layoutId="pricelist-filter-pill"
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute -inset-px rounded-full bg-ink"
                  />
                )}
                <span className="relative text-sm font-semibold">
                  {groupLabel(cat)}
                </span>
                <span
                  className={`relative rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    categoryFilter === cat ? "bg-paper/15 text-paper" : "bg-ink/5 text-ink/50"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <CMSTableSkeleton rows={6} columns={4} label="Memuat pricelist..." />
        ) : error ? (
          <CMSEmptyState
            icon={AlertTriangle}
            iconClassName="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-[20px]"
            title="Pricelist gagal dimuat"
            description={String(error)}
            action={
              <CMSButton variant="secondary" icon={RotateCw} onClick={() => fetchPricelist()}>
                Coba lagi
              </CMSButton>
            }
          />
        ) : (
          <PricelistList
            items={items}
            filteredItems={filteredItems}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onReorder={handleReorder}
            onToggleVisibility={handleToggleVisibility}
            serviceTitles={serviceTitles}
            isSearchingOrFiltering={
              searchQuery.length > 0 || categoryFilter !== "All"
            }
          />
        )}
      </div>

      <PricelistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        services={services}
      />
      {confirmDialog}
    </div>
  );
};

export default PricelistCMS;
