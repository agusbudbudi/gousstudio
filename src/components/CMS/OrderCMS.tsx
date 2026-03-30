import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ExternalLink } from "lucide-react";

import { OrderItem, PricelistItem, ClientItem } from "../../types";
import { useToast } from "../../hooks/useToast";
import { useOrders } from "../../hooks/useOrders";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import CMSHeader from "./CMSHeader";
import OrderFilters from "./Orders/OrderFilters";
import OrderList from "./Orders/OrderList";
import OrderForm from "./Orders/OrderForm";

const OrderCMS: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const { data: pricelists = [] } = useQuery({
    queryKey: ["pricelists"],
    queryFn: async () => {
      const { data } = await supabase.from("pricelists").select("*").order("order_index");
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
              <span className="text-slate-300 mx-1">-</span>
              <span className="text-brand-600 text-xl">{selectedOrder.order_number}</span>
              <a
                href={`${window.location.origin}/order/${selectedOrder.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-brand-500 rounded-lg hover:bg-brand-50 transition-all flex items-center justify-center ms-2"
                title="Buka Halaman Publik"
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
            onAdd={() => navigate("/cms/orders/new")}
          />
        )}
      </CMSHeader>

      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Memuat data order...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
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
          <OrderList
            orders={filteredOrders}
            searchQuery={searchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            updatingId={updatingId}
            onSelectOrder={(orderNumber) => navigate(`/cms/orders/${orderNumber}`)}
            onDeleteOrder={deleteOrder}
          />
        </div>
      )}
    </div>
  );
};

export default OrderCMS;
