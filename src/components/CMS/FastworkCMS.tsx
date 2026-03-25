import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { Loader2, Plus, Save } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import CMSHeader from "./CMSHeader";
import FastworkList from "./FastworkList";
import FastworkModal from "./FastworkModal";
import CMSButton from "./Common/CMSButton";
import CMSSearchBar from "./Common/CMSSearchBar";
import CMSAlertBanner from "./Common/CMSAlertBanner";

import { FastworkItem } from "../../types";

const FastworkCMS: React.FC = () => {
  const { addToast } = useToast();
  const [items, setItems] = useState<FastworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pristineItems, setPristineItems] = useState<FastworkItem[]>([]);

  const isDirty = React.useMemo(() => {
    if (loading) return false;

    const sanitize = (list: FastworkItem[]) =>
      JSON.stringify(
        list.map((item) => ({
          title: item.title,
          url: item.url,
          image: item.image,
          rating: item.rating,
          rehire: item.rehire,
          installment: item.installment,
          delay: item.delay,
        }))
      );

    return sanitize(items) !== sanitize(pristineItems);
  }, [items, pristineItems, loading]);

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
      setItems((data as FastworkItem[]) || []);
      setPristineItems((data as FastworkItem[]) || []);
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

  const handleEditItem = (item: FastworkItem, index: number) => {
    setEditingItem({ ...item, _index: index });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (index: number) => {
    if (!window.confirm("Hapus Fastwork item ini?")) return;
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
        .neq("title", ""); // All items have a title
      if (delError) throw delError;

      if (items.length > 0) {
        const { error: insError } = await supabase
          .from("fastwork_items")
          .insert(items.map((item, index) => ({ ...item, order_index: index })));
        if (insError) throw insError;
      }

      addToast("Data Fastwork berhasil disimpan!", "success");
      await fetchItems();
    } catch (err: any) {
      addToast(`Gagal menyimpan: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CMSHeader
        title="Manage Fastwork"
        countText={`${items.length} item aktif`}
      >
        <CMSSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari item..."
        />
        <CMSButton
          variant="secondary"
          onClick={handleAddItem}
          icon={Plus}
          className="shrink-0"
        >
          Tambah
        </CMSButton>
        <CMSButton
          variant="primary"
          onClick={persistToSupabase}
          loading={saving}
          icon={Save}
          className="shrink-0"
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
      </div>

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
