import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EASE } from "../landing/primitives";
import { Plus, Save, Shuffle, FileSpreadsheet } from "lucide-react";
import { supabase } from "../../utils/supabase";
import PortfolioList, { PortfolioListEntry, PortfolioListSkeleton } from "./PortfolioList";
import PortfolioModal from "./PortfolioModal";
import PortfolioImportModal from "./PortfolioImportModal";
import { ImportRow } from "../../utils/portfolioImport";
import { AlertTriangle, RotateCw } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "./Common/CMSConfirmDialog";
import CMSHeader from "./CMSHeader";
import CMSButton from "./Common/CMSButton";
import CMSSearchBar from "./Common/CMSSearchBar";
import CMSAlertBanner from "./Common/CMSAlertBanner";
import CMSEmptyState from "./Common/CMSEmptyState";
import CMSSkeleton from "./Common/CMSSkeleton";
import { PortfolioItem, PricelistItem } from "../../types";

// Items are grouped by service: the group key is the service id, or NO_SERVICE for unassigned items.
// The API derives service_id (and order_index within the service) from this grouping.
const ALL_TAB = "all";
const NO_SERVICE = "none";
const groupKeyOf = (item: PortfolioItem) => (item.service_id ? String(item.service_id) : NO_SERVICE);

const PortfolioCMS: React.FC = () => {
  const { addToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const [data, setData] = useState<Record<string, PortfolioItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [pristineData, setPristineData] = useState<
    Record<string, PortfolioItem[]>
  >({});
  const [pricelists, setPricelists] = useState<PricelistItem[]>([]);

  // Deep comparison for grouped data
  const isDirty = React.useMemo(() => {
    if (loading) return false;

    const sanitizeData = (d: Record<string, PortfolioItem[]>) => {
      const cleaned: any = {};
      Object.keys(d).forEach((cat) => {
        cleaned[cat] = (d[cat] || []).map((item) => ({
          title: item.title,
          description: item.description,
          image: item.image,
          linkurl: item.linkurl || null,
          service_id: item.service_id ?? null,
          slug: (item as any).slug,
          order_index: item.order_index,
          pricelist_id: item.pricelist_id ? String(item.pricelist_id) : null,
          role: item.role || null, // Include role for completeness
        }));
      });
      return JSON.stringify(cleaned);
    };

    return sanitizeData(data) !== sanitizeData(pristineData);
  }, [data, pristineData, loading]);

  // `silent` refetches (after save) keep the current list visible instead of flashing the skeleton
  const fetchPortfolio = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const { data: portfolioItems, error: fetchError } = await supabase
        .from("portfolios")
        .select("*")
        .order("order_index", { ascending: true });

      if (fetchError) throw fetchError;

      // Group by service
      const grouped = (portfolioItems as PortfolioItem[]).reduce(
        (acc: Record<string, PortfolioItem[]>, item: PortfolioItem) => {
          (acc[groupKeyOf(item)] ||= []).push(item);
          return acc;
        },
        {},
      );

      setData(grouped);
      setPristineData(grouped);
    } catch (err: any) {
      console.error("Error fetching portfolio:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Services = the groups/tabs (CMS service order)
  const [services, setServices] = useState<{ id: number; slug: string; title: string }[]>([]);
  const fetchServices = async () => {
    const { data, error: servicesError } = await supabase
      .from("services")
      .select("id, slug, title")
      .order("order_index", { ascending: true });
    if (servicesError) {
      console.error("Error fetching services:", servicesError);
      addToast("Gagal memuat daftar layanan", "error");
    }
    setServices(data || []);
  };

  const fetchPricelists = async () => {
    try {
      const { data: pricelistItems, error: fetchError } = await supabase
        .from("pricelists")
        .select("*, service:services(id, slug, title)")
        .order("servicename", { ascending: true });

      if (fetchError) throw fetchError;
      setPricelists(pricelistItems || []);
    } catch (err: any) {
      console.error("Error fetching pricelists:", err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchPricelists();
    fetchServices();
  }, []);

  // Groups: every service, any item group with no known service (e.g. services
  // failed to load), plus "Tanpa layanan" while unassigned items exist
  const groups = React.useMemo(() => {
    const list = services.map((svc) => ({ id: String(svc.id), label: svc.title }));
    const known = new Set(list.map((g) => g.id));
    Object.keys(data).forEach((key) => {
      if (key !== NO_SERVICE && !known.has(key) && (data[key] || []).length > 0) {
        list.push({ id: key, label: `Layanan #${key}` });
      }
    });
    if ((data[NO_SERVICE] || []).length > 0) list.push({ id: NO_SERVICE, label: "Tanpa layanan" });
    return list;
  }, [services, data]);
  const groupLabels = React.useMemo(() => Object.fromEntries(groups.map((g) => [g.id, g.label])), [groups]);
  const tabs = [{ id: ALL_TAB, label: "Semua Layanan" }, ...groups];

  const isAllTab = activeTab === ALL_TAB;
  // Default service for new items (the "all" tab is not a real group)
  const defaultServiceId = isAllTab || activeTab === NO_SERVICE ? "" : activeTab;

  const listEntries: PortfolioListEntry[] = isAllTab
    ? groups.flatMap((g) => (data[g.id] || []).map((item, index) => ({ item, group: g.id, index })))
    : (data[activeTab] || []).map((item, index) => ({ item, group: activeTab, index }));

  const handleEditItem = (item: PortfolioItem, group: string, index: number) => {
    setEditingItem({ ...item, index, originalGroup: group });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (group: string, index: number) => {
    const ok = await confirm({
      title: "Hapus portfolio ini?",
      description: "Item dihapus dari daftar. Perubahan baru tersimpan ke database setelah kamu klik Simpan.",
      destructive: true,
    });
    if (ok) {
      const newData = { ...data };
      if (newData[group]) {
        // Copy instead of splice: the array is shared with pristineData
        newData[group] = newData[group].filter((_, i) => i !== index);
        setData(newData);
        addToast(
          "Portfolio berhasil dihapus (lokal). Klik 'Simpan' untuk memperbarui database.",
          "success",
        );
      }
    }
  };

  const handleSaveItem = (itemData: any) => {
    const newData = { ...data };
    const { index, originalGroup, ...rest } = itemData;
    const group = groupKeyOf(rest);

    if (index !== undefined && originalGroup && originalGroup !== group) {
      // Service changed: move the item out of its old list into the new one
      newData[originalGroup] = (newData[originalGroup] || []).filter((_, i) => i !== index);
      newData[group] = [rest, ...(newData[group] || [])];
    } else if (index !== undefined) {
      // Copy instead of mutating: arrays are shared with pristineData
      newData[group] = (newData[group] || []).map((item, i) => (i === index ? rest : item));
    } else {
      newData[group] = [rest, ...(newData[group] || [])];
    }

    setData(newData);
    setIsModalOpen(false);
    addToast(
      index !== undefined
        ? "Portfolio berhasil diperbarui (lokal)."
        : "Portfolio berhasil ditambahkan (lokal).",
      "success",
    );
  };

  const handleReorder = (
    group: string,
    index: number,
    direction: "up" | "down",
  ) => {
    const newData = { ...data };
    const items = [...(newData[group] || [])];

    if (direction === "up" && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === "down" && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    } else {
      return;
    }

    newData[group] = items;
    setData(newData);
  };

  const handleRandomize = () => {
    const newData = { ...data };
    // In the "all" tab, shuffle each group independently
    const targets = isAllTab ? groups.map((g) => g.id) : [activeTab];

    targets.forEach((cat) => {
      const items = [...(newData[cat] || [])];
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      newData[cat] = items;
    });

    setData(newData);
    addToast(
      isAllTab
        ? "Berhasil mengacak urutan portfolio di semua layanan"
        : `Berhasil mengacak urutan portfolio di layanan ${groupLabels[activeTab]}`,
      "info",
    );
  };

  const persistData = async (
    payload: Record<string, PortfolioItem[]> = data,
    successMessage = "Data berhasil disimpan ke Supabase!",
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const endpoint = "/api/cms/portfolio";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });

      if (response.ok) {
        addToast(successMessage, "success");
        fetchPortfolio({ silent: true }); // Refresh data to reset pristine state
        return true;
      }
      const err = await response.json();
      addToast(`Gagal menyimpan: ${err.message}`, "error");
      return false;
    } catch (err: any) {
      addToast(`Error: ${err.message}`, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Insert imported rows into their group (at order_index, or at the end) and save
  const handleImport = async (rows: ImportRow[]) => {
    const newData: Record<string, PortfolioItem[]> = {};
    Object.entries(data).forEach(([cat, items]) => (newData[cat] = [...items]));

    const sorted = [...rows].sort(
      (a, b) => (a.orderIndex ?? Infinity) - (b.orderIndex ?? Infinity),
    );
    sorted.forEach(({ item, orderIndex }) => {
      const list = (newData[item.service_id ? String(item.service_id) : NO_SERVICE] ||= []);
      const entry = { ...item, pricelist_id: item.pricelist_id ?? undefined } as unknown as PortfolioItem;
      if (orderIndex === null) {
        list.push(entry);
      } else {
        list.splice(Math.min(orderIndex, list.length), 0, entry);
      }
    });

    setData(newData);
    return persistData(newData, `${rows.length} portfolio berhasil di-import!`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <CMSHeader
        title="Manage Portfolio"
        countText={loading ? "Memuat..." : `${Object.values(data).flat().length} items aktif`}
      >
        <div className="flex items-center gap-2">
          <CMSSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari portfolio..."
            className="w-full md:w-64"
          />
          <CMSButton
            variant="secondary"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            icon={Plus}
            className="shrink-0 font-bold"
          >
            Tambah
          </CMSButton>
          <CMSButton
            variant="secondary"
            onClick={() => setIsImportOpen(true)}
            icon={FileSpreadsheet}
            className="shrink-0 font-bold"
          >
            Import
          </CMSButton>
          <CMSButton
            variant="secondary"
            onClick={handleRandomize}
            icon={Shuffle}
            title="Acak Urutan"
            className="shrink-0 !font-bold"
          >
            Randomize
          </CMSButton>
          <CMSButton
            variant="primary"
            onClick={() => persistData()}
            loading={saving}
            icon={Save}
            className="shrink-0 font-bold"
          >
            Simpan
          </CMSButton>
        </div>
      </CMSHeader>

      {/* Unsaved Changes Banner */}
      <div className="relative z-30">
        <CMSAlertBanner
          isVisible={isDirty}
          isSaving={saving}
          onSave={() => persistData()}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-6">
        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="Layanan"
          className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar"
        >
          {tabs.map((cat) => {
            const active = activeTab === cat.id;
            return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(cat.id)}
              className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 transition-colors duration-200 ${
                active
                  ? "border-ink text-paper"
                  : "border-ink/10 bg-white text-muted hover:border-ink/25 hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="portfolio-filter-pill"
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute -inset-px rounded-full bg-ink"
                />
              )}
              <span className="relative text-sm font-semibold">{cat.label}</span>
              {loading ? (
                <CMSSkeleton className="relative h-4 w-5 !rounded-full" />
              ) : (
                <span
                  className={`relative rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    active ? "bg-paper/15 text-paper" : "bg-ink/5 text-ink/50"
                  }`}
                >
                  {cat.id === ALL_TAB
                    ? Object.values(data).reduce((sum, list) => sum + list.length, 0)
                    : (data[cat.id] || []).length}
                </span>
              )}
            </button>
            );
          })}
        </div>

        {loading ? (
          <PortfolioListSkeleton showReorder={!isAllTab} />
        ) : error ? (
          <CMSEmptyState
            icon={AlertTriangle}
            iconClassName="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-[20px]"
            title="Portfolio gagal dimuat"
            description={error}
            action={
              <CMSButton variant="secondary" icon={RotateCw} onClick={() => fetchPortfolio()}>
                Coba lagi
              </CMSButton>
            }
          />
        ) : (
          <PortfolioList
            entries={listEntries}
            searchQuery={searchQuery}
            canReorder={!isAllTab}
            groupLabels={isAllTab ? groupLabels : undefined}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onReorder={handleReorder}
            pricelists={pricelists}
          />
        )}

        <PortfolioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          initialData={editingItem}
          services={services}
          defaultServiceId={defaultServiceId}
          pricelists={pricelists}
        />

        <PortfolioImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImport}
          services={services}
          pricelists={pricelists}
        />
      </div>
      {confirmDialog}
    </div>
  );
};

export default PortfolioCMS;
