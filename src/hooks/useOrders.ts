import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderItem } from "../types";
import { useToast } from "./useToast";

export function useOrders() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: loading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/cms/orders?action=get");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch orders");
      }
      const result = await res.json();
      return (result.data as OrderItem[]) || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/cms/orders?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create order");
      return result.data as OrderItem;
    },
    onSuccess: (newOrder) => {
      queryClient.setQueryData(["orders"], (old: OrderItem[] | undefined) => [newOrder, ...(old || [])]);
      addToast("Order baru berhasil dibuat.", "success");
    },
    onError: (err: Error) => {
      addToast(`Gagal membuat order: ${err.message}`, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates, silent }: { id: string; updates: Partial<OrderItem>; silent?: boolean }) => {
      const res = await fetch("/api/cms/orders?action=update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update order");
      return { id, updates, silent };
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const previousOrders = queryClient.getQueryData<OrderItem[]>(["orders"]);
      queryClient.setQueryData(["orders"], (old: OrderItem[] | undefined) =>
        old?.map((order) => (order.id === id ? { ...order, ...updates } : order) as OrderItem)
      );
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["orders"], context?.previousOrders);
      addToast(`Gagal update order: ${err.message}`, "error");
    },
    onSuccess: (data) => {
      if (!data.silent) {
        addToast("Detail order berhasil diperbarui.", "success");
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, orderNumber }: { id: string; orderNumber: string }) => {
      const res = await fetch("/api/cms/orders?action=delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete order");
      return { id, orderNumber };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["orders"], (old: OrderItem[] | undefined) =>
        old?.filter((o) => o.id !== data.id)
      );
      addToast(`Order #${data.orderNumber} berhasil dihapus.`, "success");
    },
    onError: (err: Error) => {
      addToast(`Gagal menghapus order: ${err.message}`, "error");
    },
  });

  const createOrder = async (payload: any): Promise<OrderItem | null> => {
    try {
      return await createMutation.mutateAsync(payload);
    } catch {
      return null;
    }
  };

  const updateOrder = async (id: string, updates: Partial<OrderItem>, silent: boolean = false): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ id, updates, silent });
      return true;
    } catch {
      return false;
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string, additionalUpdates: any = {}) => {
    if (id === "NEW") return false;
    const success = await updateOrder(id, { status: newStatus, ...additionalUpdates }, true);
    if (success) {
      const orderNumber = orders.find((o) => o.id === id)?.order_number || id;
      addToast(`Status order #${orderNumber} diperbarui ke ${newStatus}`, "success");
      return true;
    }
    return false;
  };

  const deleteOrder = async (id: string, orderNumber: string) => {
    if (!window.confirm(`Hapus order #${orderNumber}? Tindakan ini tidak dapat dibatalkan.`)) {
      return false;
    }
    try {
      await deleteMutation.mutateAsync({ id, orderNumber });
      return true;
    } catch {
      return false;
    }
  };

  return {
    orders,
    loading,
    error: error?.message || null,
    updatingId: updateMutation.isPending
      ? updateMutation.variables?.id
      : deleteMutation.isPending
      ? deleteMutation.variables?.id
      : null,
    savingDetails: createMutation.isPending || updateMutation.isPending,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
  };
}
