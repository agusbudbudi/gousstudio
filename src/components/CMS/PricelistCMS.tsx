import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import {
  Loader2,
  Plus,
  Search,
  Save,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import CMSHeader from "./CMSHeader";
import PricelistList from "./PricelistList";
import PricelistModal from "./PricelistModal";

import { PricelistItem } from "../../types";

const PricelistCMS: React.FC = () => {
  const { addToast } = useToast();
  const [items, setItems] = useState<PricelistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPricelist();
  }, []);

  const fetchPricelist = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("pricelists")
        .select("*")
        .order("order_index", { ascending: true });
      if (fetchError) throw fetchError;
      setItems((data as PricelistItem[]) || []);
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

  const handleDeleteItem = (index: number) => {
    if (!window.confirm("Hapus paket harga ini?")) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    addToast(
      "Item berhasil dihapus (lokal). Klik 'Simpan' untuk memperbarui database.",
      "success",
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
      const flatData = items.map((item, index) => ({
        slug: (item as any).slug,
        category: item.category,
        servicename: item.servicename,
        description: item.description,
        retailprice: item.retailprice,
        finalprice: item.finalprice,
        duration: item.duration,
        isrevisionunlimited: item.isrevisionunlimited,
        totalrevision: item.totalrevision,
        deliverables: item.deliverables || [],
        order_index: index,
      }));

      // Delete all then reinsert to preserve order cleanly
      const { error: delError } = await supabase
        .from("pricelists")
        .delete()
        .not("id", "is", null);
      if (delError) throw delError;

      if (flatData.length > 0) {
        const { error: insError } = await supabase
          .from("pricelists")
          .insert(flatData);
        if (insError) throw insError;
      }

      addToast("Pricelist berhasil disimpan ke Supabase!", "success");
      fetchPricelist(); // Refresh to get new IDs
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
        <div className="relative group w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
          <input
            type="text"
            placeholder="Cari pricelist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 w-full shadow-sm transition-all placeholder:text-slate-300"
          />
        </div>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg flex items-center gap-2 transition-all font-bold text-xs active:scale-[0.98] shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
        <button
          onClick={persistToSupabase}
          disabled={saving}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2 transition-all font-bold text-xs shadow-md shadow-brand-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Simpan
        </button>
      </CMSHeader>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Memuat pricelist...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      ) : (
        <PricelistList
          items={items}
          searchQuery={searchQuery}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onReorder={handleReorder}
        />
      )}

      <PricelistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
      />
    </div>
  );
};

export default PricelistCMS;
