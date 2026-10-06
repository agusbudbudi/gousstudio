import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, ExternalLink, RotateCw } from "lucide-react";
import CMSTableSkeleton from "./Common/CMSTableSkeleton";
import CMSEmptyState from "./Common/CMSEmptyState";
import CMSButton from "./Common/CMSButton";

import { OrderItem, PricelistItem, ClientItem } from "../../types";
import { useToast } from "../../hooks/useToast";
import { useOrders } from "../../hooks/useOrders";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useConfirm } from "./Common/CMSConfirmDialog";
import CMSHeader from "./CMSHeader";
import OrderFilters from "./Orders/OrderFilters";
import OrderList from "./Orders/OrderList";
import OrderForm from "./Orders/OrderForm";
import OrderKanban from "./Orders/OrderKanban";
import OrderTimeline from "./Orders/OrderTimeline";

const OrderCMS: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { confirm, confirmDialog } = useConfirm();
  const { orderNumber } = useParams<{ orderNumber?: string }>();

  const {
    orders,
    loading,
    error,
    updatingId,
    savingDetails,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
  } = useOrders();

  const handleDeleteOrder = async (id: string, orderNumber: string) => {
    const ok = await confirm({
      title: `Hapus order #${orderNumber}?`,
      description: "Order beserta datanya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
      destructive: true,
    });
    return ok ? deleteOrder(id, orderNumber) : false;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [viewMode, setViewMode] = useState<"LIST" | "KANBAN" | "TIMELINE">("LIST");

  const { data: pricelists = [] } = useQuery({
    queryKey: ["pricelists"],
    queryFn: async () => {
      // Embed the parent service: an order's design_category is the package's service
      const { data } = await supabase
        .from("pricelists")
        .select("*, service:services(id, slug, title)")
        .order("order_index");
      return (data as PricelistItem[]) || [];
    }
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/cms/clients?action=get");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const result = await res.json();
      return (result.data as ClientItem[]) || [];
    }
  });

  useEffect(() => {
    if (orderNumber === "new") {
      setSelectedOrder({
        id: "NEW",
        order_number: "DRAFT Baru",
        status: "DRAFT",
        full_name: "",
        phone_number: "",
        design_category: "",
        selected_package: "",
        price: "" as any,
        final_price: "" as any,
        discount_value: 0,
        discount_type: "fixed",
        brief_detail: "",
        deadline: "",
        source_order: "web-ops",
        created_at: new Date().toISOString(),
      } as any);
    } else if (orderNumber && orders.length > 0) {
      const order = orders.find((o) => o.order_number === orderNumber);
      if (order) {
        setSelectedOrder(order);
      }
    } else if (!orderNumber) {
      setSelectedOrder(null);
    }
  }, [orderNumber, orders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone_number?.includes(searchQuery) ||
      order.selected_package?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveOrder = async (data: Partial<OrderItem>, selectedPricelist: PricelistItem | null) => {
    if (selectedOrder?.id === "NEW") {
      const now = new Date();
      const dateStr = now.toISOString().slice(2, 10).replace(/-/g, "");
      const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
      const newOrderNumber = `GS-${dateStr}${randomStr}`;

      const payload = {
        ...data,
        order_number: newOrderNumber,
        source_order: "web-ops",
        package_details: selectedPricelist || undefined,
      };

      const newOrder = await createOrder(payload);
      if (newOrder) {
        navigate(`/cms/orders/${newOrder.order_number}`);
      }
    } else if (selectedOrder) {
      const payload = { ...data, package_details: selectedPricelist || undefined };
      await updateOrder(selectedOrder.id, payload);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string, additionalUpdates: any = {}) => {
    return await updateOrderStatus(id, newStatus, additionalUpdates);
  };

  return (
    <div className="flex flex-col h-full">
      <CMSHeader
        title={
          selectedOrder ? (
            <div className="flex items-center gap-2">
              <span>Order Detail</span>
              <span className="text-ink/30 mx-1">-</span>
              <span className="text-violet-700 text-xl">{selectedOrder.order_number}</span>
              <a
                href={`${window.location.origin}/order/${selectedOrder.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-violet-600 rounded-[10px] hover:bg-violet-50 transition-all flex items-center justify-center ms-2"
                aria-label="Buka Halaman Publik" title="Buka Halaman Publik"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          ) : (
            "Data Orders"
          )
        }
        countText={!selectedOrder ? `${orders.length} order terdaftar` : undefined}
        onBack={selectedOrder ? () => navigate("/cms/orders") : undefined}
      >
        {!selectedOrder && (
          <OrderFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAdd={() => navigate("/cms/orders/new")}
          />
        )}
      </CMSHeader>

      {loading && orders.length === 0 ? (
        <div className="pt-6">
          <CMSTableSkeleton rows={8} columns={6} label="Memuat data order..." />
        </div>
      ) : error ? (
        <CMSEmptyState
          icon={AlertTriangle}
          iconClassName="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-[20px]"
          title="Order gagal dimuat"
          description={String(error)}
          action={
            <CMSButton
              variant="secondary"
              icon={RotateCw}
              onClick={() => queryClient.invalidateQueries({ queryKey: ["orders"] })}
            >
              Coba lagi
            </CMSButton>
          }
        />
      ) : selectedOrder ? (
        <OrderForm
          order={selectedOrder}
          pricelists={pricelists}
          clients={clients}
          updatingId={updatingId}
          savingDetails={savingDetails}
          onCancel={() => navigate("/cms/orders")}
          onSave={handleSaveOrder}
          onStatusUpdate={handleStatusUpdate}
          onClientAdded={(newClient) =>
            queryClient.setQueryData(["clients"], (old: ClientItem[] | undefined) => [newClient, ...(old || [])])
          }
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col pt-6">
          {viewMode === "LIST" && (
            <OrderList
              orders={filteredOrders}
              searchQuery={searchQuery}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              updatingId={updatingId}
              onSelectOrder={(orderNumber) => navigate(`/cms/orders/${orderNumber}`)}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {viewMode === "KANBAN" && (
            <OrderKanban
              orders={filteredOrders}
              updatingId={updatingId}
              onSelectOrder={(orderNumber) => navigate(`/cms/orders/${orderNumber}`)}
              onStatusUpdate={handleStatusUpdate}
            />
          )}

          {viewMode === "TIMELINE" && (
            <OrderTimeline
              orders={filteredOrders}
              onSelectOrder={(orderNumber) => navigate(`/cms/orders/${orderNumber}`)}
            />
          )}
        </div>
      )}
      {confirmDialog}
    </div>
  );
};

export default OrderCMS;
