import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Save,
  Shuffle,
  FileText,
  Monitor,
  ShoppingBag,
  Palette,
  Briefcase,
  Megaphone,
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import PortfolioList from "./PortfolioList";
import PortfolioModal from "./PortfolioModal";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import CMSHeader from "./CMSHeader";
import CMSButton from "./Common/CMSButton";
import CMSSearchBar from "./Common/CMSSearchBar";
import CMSAlertBanner from "./Common/CMSAlertBanner";
import { PortfolioItem, PricelistItem } from "../../types";

const CATEGORIES: { id: string; label: string; icon: any }[] = [
  { id: "poster", label: "Poster & Banner", icon: FileText },
  { id: "feed", label: "Social Media Feed", icon: Monitor },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { id: "logo", label: "Logo & Branding", icon: Palette },
  { id: "management", label: "Content Management", icon: Briefcase },
  { id: "ads", label: "Digital Ads", icon: Megaphone },
];

const PortfolioCMS: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("poster");
  const [data, setData] = useState<Record<string, PortfolioItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          category: item.category,
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

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const { data: portfolioItems, error: fetchError } = await supabase
        .from("portfolios")
        .select("*")
        .order("order_index", { ascending: true });

      if (fetchError) throw fetchError;

      // Group by category
      const grouped = (portfolioItems as PortfolioItem[]).reduce(
        (acc: Record<string, PortfolioItem[]>, item: PortfolioItem) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
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

  const fetchPricelists = async () => {
    try {
      const { data: pricelistItems, error: fetchError } = await supabase
        .from("pricelists")
        .select("*")
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
  }, []);

  const handleEditItem = (item: PortfolioItem, index: number) => {
    setEditingItem({ ...item, index, category: activeTab });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (category: string, index: number) => {
    if (window.confirm("Hapus item ini?")) {
      const newData = { ...data };
      if (newData[category]) {
        newData[category].splice(index, 1);
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
    const { category, index, ...rest } = itemData;

    if (index !== undefined) {
      if (!newData[category]) newData[category] = [];
      newData[category][index] = rest;
    } else {
      if (!newData[category]) newData[category] = [];
      newData[category].unshift(rest);
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
    category: string,
    index: number,
    direction: "up" | "down",
  ) => {
    const newData = { ...data };
    const items = [...(newData[category] || [])];

    if (direction === "up" && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === "down" && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    } else {
      return;
    }

    newData[category] = items;
    setData(newData);
  };

  const handleRandomize = () => {
    const newData = { ...data };
    const items = [...(newData[activeTab] || [])];

    if (items.length <= 1) return;

    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    newData[activeTab] = items;
    setData(newData);
    addToast(
      `Berhasil mengacak urutan portfolio di kategori ${CATEGORIES.find((c) => c.id === activeTab)?.label}`,
      "info",
    );
  };

  const persistData = async () => {
    setSaving(true);
    try {
      const endpoint = "/api/cms/portfolio";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (response.ok) {
        addToast("Data berhasil disimpan ke Supabase!", "success");
        fetchPortfolio(); // Refresh data to reset pristine state
      } else {
        const err = await response.json();
        addToast(`Gagal menyimpan: ${err.message}`, "error");
      }
    } catch (err: any) {
      addToast(`Error: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <CMSHeader
        title="Manage Portfolio"
        countText={`${Object.values(data).flat().length} items aktif`}
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
            onClick={handleRandomize}
            icon={Shuffle}
            title="Acak Urutan"
            className="shrink-0 font-bold"
          >
            Randomize
          </CMSButton>
          <CMSButton
            variant="primary"
            onClick={persistData}
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
          onSave={persistData}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === cat.id
                  ? "bg-brand-50 border-brand-500/50 text-brand-700 "
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <cat.icon
                className={`w-4 h-4 ${activeTab === cat.id ? "text-brand-500" : "text-slate-400"}`}
              />
              <span className="text-xs font-bold">{cat.label}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  activeTab === cat.id
                    ? "bg-brand-500 !text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {(data[cat.id] || []).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">
              Memuat data dari Supabase...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
        ) : (
          <PortfolioList
            items={data[activeTab] || []}
            category={activeTab}
            searchQuery={searchQuery}
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
          categories={CATEGORIES}
          activeTab={activeTab}
          pricelists={pricelists}
        />
      </div>
    </div>
  );
};

export default PortfolioCMS;
