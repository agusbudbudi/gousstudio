import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import {
  Plus,
  Search,
  Save,
  ChevronRight,
  Shapes,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import CMSTableSkeleton from "./Common/CMSTableSkeleton";
import CMSEmptyState from "./Common/CMSEmptyState";
import { AlertTriangle, RotateCw } from "lucide-react";
import { useConfirm } from "./Common/CMSConfirmDialog";
import CMSHeader from "./CMSHeader";
import ServicesList, { ServiceStats } from "./ServicesList";
import ServicesModal from "./ServicesModal";
import CMSButton from "./Common/CMSButton";
import CMSSearchBar from "./Common/CMSSearchBar";
import CMSAlertBanner from "./Common/CMSAlertBanner";

import { ServiceItem } from "../../types";

const ServicesCMS: React.FC = () => {
  const { addToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pristineItems, setPristineItems] = useState<ServiceItem[]>([]);

  const isDirty = React.useMemo(() => {
    if (loading) return false;

    const sanitize = (list: ServiceItem[]) =>
      JSON.stringify(
        list.map((item) => ({
          slug: item.slug,
          title: item.title,
          description: item.description,
          icon: item.icon,
          category: item.category,
          color: item.color,
          included: [...(item.included || [])].sort(),
        })),
      );

    return sanitize(items) !== sanitize(pristineItems);
  }, [items, pristineItems, loading]);

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, []);

  // Linked packages / works per service (services-as-parent model). Stays undefined
  // until pricelists.service_id exists, so the list falls back to the deliverables count.
  const [stats, setStats] = useState<Record<string, ServiceStats> | undefined>();
  const fetchStats = async () => {
    const [{ data: packages, error: pkgError }, { data: works }] = await Promise.all([
      supabase.from("pricelists").select("id, service_id, finalprice, is_show_to_customer"),
      supabase.from("portfolios").select("pricelist_id"),
    ]);
    if (pkgError || !packages) return; // column missing before the migration
    const next: Record<string, ServiceStats> = {};
    const serviceByPackage = new Map<number, number>();
    for (const p of packages as any[]) {
      if (!p.service_id) continue;
      serviceByPackage.set(p.id, p.service_id);
      const s = (next[p.service_id] ||= { packages: 0, publicPackages: 0, minPrice: null, works: 0 });
      s.packages += 1;
      if (p.is_show_to_customer) {
        s.publicPackages += 1;
        const price = Number(p.finalprice) || 0;
        if (price > 0) s.minPrice = s.minPrice === null ? price : Math.min(s.minPrice, price);
      }
    }
    for (const w of (works || []) as any[]) {
      const serviceId = serviceByPackage.get(Number(w.pricelist_id));
      if (serviceId) next[serviceId].works += 1;
    }
    setStats(next);
  };

  // `silent` refetches (after save) keep the list visible instead of flashing the skeleton
  const fetchItems = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("services")
        .select("*")
        .order("order_index", { ascending: true });
      if (fetchError) throw fetchError;

      // Ensure 'included' is always an array for consistency with isDirty logic
      const processedData = ((data as ServiceItem[]) || []).map((item) => ({
        ...item,
        included: item.included || [],
      }));

      setItems(processedData);
      setPristineItems(processedData);
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

  const handleEditItem = (item: ServiceItem, index: number) => {
    setEditingItem({ ...item, _index: index });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (index: number) => {
    const ok = await confirm({
      title: "Hapus layanan ini?",
      description: "Layanan dihapus dari daftar. Perubahan baru tersimpan ke database setelah kamu klik Simpan.",
      destructive: true,
    });
    if (!ok) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    addToast(
      "Layanan berhasil dihapus (lokal). Klik 'Simpan' untuk memperbarui database.",
      "success",
    );
  };

  const handleReorder = (index: number, direction: "up" | "down") => {
    setItems((prev) => {
      const arr = [...prev];
      if (direction === "up" && index > 0)
        [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
      else if (direction === "down" && index < arr.length - 1)
        [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
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
        ? "Layanan berhasil diperbarui (lokal)."
        : "Layanan berhasil ditambahkan (lokal).",
      "success",
    );
  };

  const persistToSupabase = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/cms/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: items }),
      });

      if (response.ok) {
        addToast("Layanan berhasil disimpan!", "success");
        await fetchItems({ silent: true });
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
        title="Manage Services"
        countText={`${items.length} layanan aktif`}
      >
        <CMSSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari layanan..."
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
      <div className="pt-6">
        {loading ? (
          <CMSTableSkeleton rows={6} columns={4} label="Memuat services..." />
        ) : error ? (
          <CMSEmptyState
            icon={AlertTriangle}
            iconClassName="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-[20px]"
            title="Services gagal dimuat"
            description={String(error)}
            action={
              <CMSButton variant="secondary" icon={RotateCw} onClick={() => fetchItems()}>
                Coba lagi
              </CMSButton>
            }
          />
        ) : (
          <ServicesList
            items={items}
            stats={stats}
            searchQuery={searchQuery}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onReorder={handleReorder}
          />
        )}
      </div>

      <ServicesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
      />
      {confirmDialog}
    </div>
  );
};

export default ServicesCMS;
