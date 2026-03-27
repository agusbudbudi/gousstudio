import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import {
  Loader2,
  Plus,
  Search,
  Save,
  ChevronRight,
  Shapes,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import CMSHeader from "./CMSHeader";
import ServicesList from "./ServicesList";
import ServicesModal from "./ServicesModal";
import CMSButton from "./Common/CMSButton";
import CMSSearchBar from "./Common/CMSSearchBar";
import CMSAlertBanner from "./Common/CMSAlertBanner";

import { ServiceItem } from "../../types";

const ServicesCMS: React.FC = () => {
  const { addToast } = useToast();
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
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
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

  const handleDeleteItem = (index: number) => {
    if (!window.confirm("Hapus layanan ini?")) return;
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
      const flatData = items.map((item, index) => ({
        ...(item.id ? { id: item.id } : {}),
        slug: item.slug,
        title: item.title,
        description: item.description,
        icon: item.icon,
        category: item.category,
        color: item.color,
        included: item.included || [],
        order_index: index,
      }));

      const currentIds = items.filter((item) => item.id).map((item) => item.id);
      const deletedIds = pristineItems
        .filter((item) => item.id && !currentIds.includes(item.id))
        .map((item) => item.id);

      const itemsToUpdate = flatData.filter((item) => item.id);
      const itemsToInsert = flatData.filter((item) => !item.id);

      if (deletedIds.length > 0) {
        const { error: delError } = await supabase
          .from("services")
          .delete()
          .in("id", deletedIds);
        if (delError) throw delError;
      }

      if (itemsToUpdate.length > 0) {
        const updatePromises = itemsToUpdate.map(async (item) => {
          const { id, ...updateData } = item;
          const { error } = await supabase
            .from("services")
            .update(updateData)
            .eq("id", id);
          if (error) throw error;
        });
        await Promise.all(updatePromises);
      }

      if (itemsToInsert.length > 0) {
        const { error: insError } = await supabase
          .from("services")
          .insert(itemsToInsert);
        if (insError) throw insError;
      }

      addToast("Layanan berhasil disimpan!", "success");
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
      <div className="pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Memuat services...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
        ) : (
          <ServicesList
            items={items}
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
    </div>
  );
};

export default ServicesCMS;
