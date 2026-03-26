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
import CMSButton from "./Common/CMSButton";
import CMSSearchBar from "./Common/CMSSearchBar";
import CMSSelect from "./Common/CMSSelect";
import CMSAlertBanner from "./Common/CMSAlertBanner";

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
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [pristineItems, setPristineItems] = useState<PricelistItem[]>([]);

  // Check if items have changed since last fetch/save
  const isDirty = React.useMemo(() => {
    if (loading) return false;
    
    const sanitize = (list: PricelistItem[]) =>
      JSON.stringify(
        list.map((item) => ({
          slug: (item as any).slug,
          category: item.category,
          servicename: item.servicename,
          description: item.description,
          retailprice: Number(item.retailprice) || 0,
          finalprice: Number(item.finalprice) || 0,
          duration: Number(item.duration) || 0,
          isrevisionunlimited: Boolean(item.isrevisionunlimited),
          totalrevision: Number(item.totalrevision) || 0,
          deliverables: [...(item.deliverables || [])].sort(),
          isShowToCustomer: Boolean(item.isShowToCustomer),
        }))
      );
    
    return sanitize(items) !== sanitize(pristineItems);
  }, [items, pristineItems, loading]);

  const categories = React.useMemo(() => {
    const cats = new Set(items.map(item => item.category));
    return ["All", ...Array.from(cats)].filter(Boolean);
  }, [items]);

  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.servicename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

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

  const handleDeleteItem = (index: number) => {
    if (!window.confirm("Hapus paket harga ini?")) return;
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
          : item
      )
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
      const flatData = items.map((item, index) => ({
        ...(item.id ? { id: item.id } : {}),
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
        is_show_to_customer: item.isShowToCustomer ?? false,
      }));

      const currentIds = items.filter(item => item.id).map(item => item.id);
      const deletedIds = pristineItems.filter(item => item.id && !currentIds.includes(item.id)).map(item => item.id);

      // Separate items to update vs insert
      const itemsToUpdate = flatData.filter(item => item.id);
      const itemsToInsert = flatData.filter(item => !item.id);

      // Explicitly delete removed items
      if (deletedIds.length > 0) {
        const { error: delError } = await supabase
          .from("pricelists")
          .delete()
          .in("id", deletedIds);
        if (delError) throw delError;
      }

      // Update existing items individually
      if (itemsToUpdate.length > 0) {
        const updatePromises = itemsToUpdate.map(async (item) => {
          const { id, ...updateData } = item;
          const { error } = await supabase
            .from("pricelists")
            .update(updateData)
            .eq("id", id);
          if (error) throw error;
        });
        await Promise.all(updatePromises);
      }

      // Insert new items without IDs
      if (itemsToInsert.length > 0) {
        const { error: insError } = await supabase
          .from("pricelists")
          .insert(itemsToInsert);
        if (insError) throw insError;
      }

      addToast("Pricelist berhasil disimpan ke Supabase!", "success");
      await fetchPricelist(); // Await the refresh
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
        <CMSSelect
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-48"
          containerClassName="!w-auto"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === "All" ? "Semua Kategori" : cat}
            </option>
          ))}
        </CMSSelect>
        <CMSButton
          variant="secondary"
          onClick={handleAddItem}
          icon={Plus}
          className="shrink-0 font-bold"
        >
          Tambah
        </CMSButton>
        <CMSButton
          variant="primary"
          onClick={persistToSupabase}
          loading={saving}
          icon={Save}
          className="shrink-0 font-bold"
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
      <div className="pt-4">
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
            filteredItems={filteredItems}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onReorder={handleReorder}
            onToggleVisibility={handleToggleVisibility}
            isSearchingOrFiltering={searchQuery.length > 0 || categoryFilter !== "All"}
          />
        )}
      </div>

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
