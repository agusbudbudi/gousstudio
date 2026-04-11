import React, { useState } from "react";
import {
  Plus,
  MessageSquare,
  Loader2,
  RefreshCw,
} from "lucide-react";
import CMSHeader from "./CMSHeader";
import TestimonialList from "./TestimonialList";
import TestimonialModal from "./TestimonialModal";
import CMSButton from "./Common/CMSButton";
import CMSSearchBar from "./Common/CMSSearchBar";
import { useTestimonials } from "../../hooks/useTestimonials";
import { TestimonialItem } from "../../types";

const TestimonialCMS: React.FC = () => {
  const {
    testimonials,
    loading,
    error,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    reorderTestimonials,
    uploadAvatar,
    isSaving,
  } = useTestimonials();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTestimonials = testimonials.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.testimony.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: TestimonialItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: TestimonialItem) => {
    if (data.id) {
      await updateTestimonial({ id: data.id, updates: data });
    } else {
      await createTestimonial({
        ...data,
        order_index: testimonials.length,
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleVisibility = async (item: TestimonialItem) => {
    await updateTestimonial({
      id: item.id!,
      updates: { is_show: !item.is_show },
    });
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newItems = [...testimonials];
    if (direction === "up" && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === "down" && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    } else {
      return;
    }
    await reorderTestimonials(newItems);
  };

  return (
    <div className="flex flex-col h-full">
      <CMSHeader
        title="Manage Testimonials"
        countText={`${testimonials.length} testimonial aktif`}
      >
        <CMSSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari nama atau isi testimoni..."
          className="w-full md:w-80"
        />

        <CMSButton
          variant="secondary"
          onClick={handleAdd}
          icon={Plus}
          className="shrink-0 font-bold"
        >
          Tambah
        </CMSButton>
      </CMSHeader>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Memuat data testimonial...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
            <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
            <p className="text-slate-500 text-sm">{error.message || "Unknown error"}</p>
          </div>
        ) : (
          <TestimonialList
            items={filteredTestimonials}
            onEdit={handleEdit}
            onDelete={deleteTestimonial}
            onReorder={handleReorder}
            onToggleVisibility={handleToggleVisibility}
          />
        )}
      </div>

      <TestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onUploadAvatar={uploadAvatar}
        initialData={editingItem}
      />

      {isSaving && (
        <div className="fixed bottom-8 right-8 bg-white border border-slate-200 shadow-2xl rounded-full px-6 py-3 flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <RefreshCw size={18} className="text-brand-500 animate-spin" />
          <span className="text-sm font-black text-slate-700">Menyimpan perubahan...</span>
        </div>
      )}
    </div>
  );
};

export default TestimonialCMS;
