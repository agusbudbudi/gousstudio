import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { Loader2, Plus, Search, Save, ChevronRight, Zap } from "lucide-react";
import FastworkList from "./FastworkList";
import FastworkModal from "./FastworkModal";

const FastworkCMS = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("fastwork_items")
        .select("*")
        .order("order_index", { ascending: true });
      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item, index) => {
    setEditingItem({ ...item, _index: index });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (index) => {
    if (!window.confirm("Hapus Fastwork item ini?")) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReorder = (index, direction) => {
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

  const handleSaveItem = (itemData) => {
    const { _index, ...rest } = itemData;
    if (_index !== undefined) {
      setItems((prev) => prev.map((item, i) => (i === _index ? rest : item)));
    } else {
      setItems((prev) => [rest, ...prev]);
    }
    setIsModalOpen(false);
  };

  const persistToSupabase = async () => {
    setSaving(true);
    try {
      const flatData = items.map((item, index) => ({
        title: item.title,
        url: item.url,
        image: item.image,
        rating: item.rating,
        rehire: item.rehire,
        installment: item.installment,
        delay: item.delay,
        order_index: index,
      }));

      const { error: delError } = await supabase
        .from("fastwork_items")
        .delete()
        .not("id", "is", null);
      if (delError) throw delError;

      if (flatData.length > 0) {
        const { error: insError } = await supabase.from("fastwork_items").insert(flatData);
        if (insError) throw insError;
      }

      alert("Fastwork items berhasil disimpan!");
      fetchItems();
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-brand-500 text-[9px] font-bold mb-1 uppercase tracking-widest">
            <span>Integrations</span>
            <ChevronRight className="w-3 h-3" />
            <span>Fastwork</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Fastwork</h1>
          <p className="text-xs text-slate-400 mt-0.5">{items.length} item aktif</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 w-full md:w-48 shadow-sm transition-all placeholder:text-slate-200"
            />
          </div>
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg flex items-center gap-2 transition-all font-bold text-[11px] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
          <button
            onClick={persistToSupabase}
            disabled={saving}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2 transition-all font-bold text-[11px] shadow-md shadow-brand-500/10 active:scale-[0.98] shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Memuat fastwork items...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      ) : (
        <FastworkList
          items={items}
          searchQuery={searchQuery}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onReorder={handleReorder}
        />
      )}

      <FastworkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
      />
    </div>
  );
};

export default FastworkCMS;
