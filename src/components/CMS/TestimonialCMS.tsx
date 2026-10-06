import React, { useState } from "react";
import {
  Plus,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import CMSTableSkeleton from "./Common/CMSTableSkeleton";
import CMSEmptyState from "./Common/CMSEmptyState";
import { AlertTriangle, RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "./Common/CMSConfirmDialog";
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
  const queryClient = useQueryClient();
  const { confirm, confirmDialog } = useConfirm();

  const handleDeleteTestimonial = async (id: string) => {
    const ok = await confirm({
      title: "Hapus testimonial ini?",
      description: "Testimonial akan dihapus permanen dan hilang dari halaman publik.",
      destructive: true,
    });
    if (ok) await deleteTestimonial(id);
  };

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
          className="shrink-0 !font-bold"
        >
          Tambah
        </CMSButton>
      </CMSHeader>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-6">
        {loading ? (
          <CMSTableSkeleton rows={6} columns={4} label="Memuat data testimonial..." />
        ) : error ? (
          <CMSEmptyState
            icon={AlertTriangle}
            iconClassName="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-[20px]"
            title="Testimonial gagal dimuat"
            description={String((error as Error).message || "Unknown error")}
            action={
              <CMSButton variant="secondary" icon={RotateCw} onClick={() => queryClient.invalidateQueries({ queryKey: ["testimonials"] })}>
                Coba lagi
              </CMSButton>
            }
          />
        ) : (
          <TestimonialList
            items={filteredTestimonials}
            onEdit={handleEdit}
            onDelete={handleDeleteTestimonial}
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
        <div role="status" className="cms-modal-panel fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-full bg-ink px-5 py-3 text-paper">
          <RefreshCw size={16} className="text-violet-300 motion-safe:animate-spin" />
          <span className="text-sm font-semibold">Menyimpan perubahan...</span>
        </div>
      )}
      {confirmDialog}
    </div>
  );
};

export default TestimonialCMS;
