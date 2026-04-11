import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TestimonialItem } from "../types";
import { useToast } from "./useToast";
import { supabase } from "../utils/supabase";
import { compressAndCropImage } from "../utils/imageUtils";

export function useTestimonials() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading: loading, error } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/cms/testimonials?action=get");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch testimonials");
      }
      const result = await res.json();
      return (result.data as TestimonialItem[]) || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<TestimonialItem>) => {
      const res = await fetch("/api/cms/testimonials?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create testimonial");
      return result.data as TestimonialItem;
    },
    onSuccess: (newTestimonial) => {
      queryClient.setQueryData(["testimonials"], (old: TestimonialItem[] | undefined) => [
        ...(old || []),
        newTestimonial,
      ]);
      addToast("Testimonial berhasil ditambahkan.", "success");
    },
    onError: (err: Error) => {
      addToast(`Gagal menambahkan testimonial: ${err.message}`, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TestimonialItem> }) => {
      const res = await fetch("/api/cms/testimonials?action=update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update testimonial");
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      const previous = queryClient.getQueryData<TestimonialItem[]>(["testimonials"]);
      queryClient.setQueryData(["testimonials"], (old: TestimonialItem[] | undefined) =>
        old?.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["testimonials"], context?.previous);
      addToast(`Gagal memperbarui testimonial: ${err.message}`, "error");
    },
    onSuccess: () => {
      addToast("Testimonial berhasil diperbarui.", "success");
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/cms/testimonials?action=delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete testimonial");
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(["testimonials"], (old: TestimonialItem[] | undefined) =>
        old?.filter((o) => o.id !== id)
      );
      addToast(`Testimonial berhasil dihapus.`, "success");
    },
    onError: (err: Error) => {
      addToast(`Gagal menghapus testimonial: ${err.message}`, "error");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: TestimonialItem[]) => {
      const res = await fetch("/api/cms/testimonials?action=reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Failed to reorder testimonials");
    },
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials"] });
      const previous = queryClient.getQueryData<TestimonialItem[]>(["testimonials"]);
      queryClient.setQueryData(["testimonials"], items);
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["testimonials"], context?.previous);
      addToast("Gagal mengatur ulang urutan.", "error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      // Compress and crop to 400x400 square (JPG 80% quality)
      const compressedBlob = await compressAndCropImage(file, 400, 0.8);

      const fileExt = "jpg"; // We always output JPG in utility
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressedBlob, {
          contentType: "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      addToast(`Gagal mengupload avatar: ${err.message}`, "error");
      return null;
    }
  };

  return {
    testimonials,
    loading,
    error,
    createTestimonial: createMutation.mutateAsync,
    updateTestimonial: updateMutation.mutateAsync,
    deleteTestimonial: (id: string) => {
      if (window.confirm("Hapus testimonial ini?")) {
        return deleteMutation.mutateAsync(id);
      }
    },
    reorderTestimonials: reorderMutation.mutateAsync,
    uploadAvatar,
    isSaving: createMutation.isPending || updateMutation.isPending || reorderMutation.isPending,
  };
}
