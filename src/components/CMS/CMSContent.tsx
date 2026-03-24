import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  LogOut,
  Search,
  Image as ImageIcon,
  ChevronRight,
  Monitor,
  ShoppingBag,
  FileText,
  Palette,
  Briefcase,
  Megaphone,
  Save,
  DollarSign,
  Zap,
  Shapes,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import PortfolioList from "./PortfolioList";
import PortfolioModal from "./PortfolioModal";
import PricelistCMS from "./PricelistCMS";
import FastworkCMS from "./FastworkCMS";
import ServicesCMS from "./ServicesCMS";
import OrderCMS from "./OrderCMS";
import { Loader2 } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import CMSHeader from "./CMSHeader";

import { PortfolioItem } from "../../types";

const CATEGORIES: { id: string; label: string; icon: any }[] = [
  { id: "poster", label: "Poster & Banner", icon: FileText },
  { id: "feed", label: "Social Media Feed", icon: Monitor },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { id: "logo", label: "Logo & Branding", icon: Palette },
  { id: "management", label: "Content Management", icon: Briefcase },
  { id: "ads", label: "Digital Ads", icon: Megaphone },
];

interface CMSContentProps {
  onLogout: () => void;
}

const CMSContent: React.FC<CMSContentProps> = ({ onLogout }) => {
  const { addToast } = useToast();
  const [activePage, setActivePage] = useState("orders"); // 'portfolio' | 'pricelist' | 'orders'
  const [activeTab, setActiveTab] = useState("poster");
  const [data, setData] = useState<Record<string, PortfolioItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const { data: portfolioItems, error: fetchError } = await supabase
          .from("portfolios")
          .select("*")
          .order("order_index", { ascending: true });

        if (fetchError) throw fetchError;

        // Group by category
        const grouped = (portfolioItems as PortfolioItem[]).reduce(
          (acc: Record<string, PortfolioItem[]>, item: PortfolioItem) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          },
          {},
        );

        setData(grouped);
      } catch (err: any) {
        console.error("Error fetching portfolio:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: PortfolioItem, index: number) => {
    setEditingItem({ ...item, index, category: activeTab });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (category: string, index: number) => {
    if (window.confirm("Hapus item ini?")) {
      const newData = { ...data };
      if (newData[category]) {
        newData[category].splice(index, 1);
        setData(newData);
        addToast(
          "Portfolio berhasil dihapus (lokal). Klik 'Simpan' untuk memperbarui database.",
          "success",
        );
      }
    }
  };

  const handleSaveItem = (itemData: any) => {
    const newData = { ...data };
    const { category, index, ...rest } = itemData;

    if (index !== undefined) {
      // Edit existing
      if (!newData[category]) newData[category] = [];
      newData[category][index] = rest;
    } else {
      // Add new
      if (!newData[category]) newData[category] = [];
      newData[category].unshift(rest);
    }

    setData(newData);
    setIsModalOpen(false);
    addToast(
      index !== undefined
        ? "Portfolio berhasil diperbarui (lokal)."
        : "Portfolio berhasil ditambahkan (lokal).",
      "success",
    );
  };

  const handleReorder = (
    category: string,
    index: number,
    direction: "up" | "down",
  ) => {
    const newData = { ...data };
    const items = [...(newData[category] || [])];

    if (direction === "up" && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === "down" && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    } else {
      return; // No movement possible
    }

    newData[category] = items;
    setData(newData);
  };

  const persistData = async () => {
    setSaving(true);
    try {
      const isLocal =
        window.location.hostname === "localhost" && !import.meta.env.PROD;
      const endpoint = "/api/save-portfolio";
      const password = localStorage.getItem("cms_token");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, password }),
      });

      if (response.ok) {
        addToast("Data berhasil disimpan ke Supabase!", "success");
        // Refetch to ensure we have the latest IDs and state
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const err = await response.json();
        addToast(`Gagal menyimpan: ${err.message}`, "error");
      }
    } catch (err: any) {
      addToast(`Error: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      {/* Sidebar */}
      <aside className="w-48 border-r border-slate-200 bg-white flex flex-col shadow-[1px_0_0_rgba(0,0,0,0.02)]">
        <div className="py-3 px-4 border-b border-slate-100">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <img
              src="/img/gous-logo.png"
              alt="Gous Studio"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <h2 className="font-extrabold text-slate-900 leading-tight text-sm group-hover:text-brand-500 transition-colors">
                Gous Studio
              </h2>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                CMS PANEL
              </p>
            </div>
          </a>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Operation Group */}
          <div>
            <div className="px-3 py-2 text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
              Project Ops
            </div>
            <div className="space-y-1">
              {/* Orders Menu */}
              <button
                onClick={() => setActivePage("orders")}
                className={`group w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-bold transition-all text-[11px] cursor-pointer border ${
                  activePage === "orders"
                    ? "bg-white border-brand-500/50 text-brand-600 shadow-sm"
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ShoppingCart
                  className={`w-4 h-4 transition-colors ${activePage === "orders" ? "text-brand-500" : "text-slate-400 group-hover:text-slate-500"}`}
                />
                Orders
              </button>
            </div>
          </div>

          {/* Setup Group */}
          <div>
            <div className="px-3 py-2 text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
              System Setup
            </div>
            <div className="space-y-1">
              {/* Portfolio Menu */}
              <button
                onClick={() => setActivePage("portfolio")}
                className={`group w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-bold transition-all text-[11px] cursor-pointer border ${
                  activePage === "portfolio"
                    ? "bg-white border-brand-500/50 text-brand-600 shadow-sm"
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ImageIcon
                  className={`w-4 h-4 transition-colors ${activePage === "portfolio" ? "text-brand-500" : "text-slate-400 group-hover:text-slate-500"}`}
                />
                Portfolio
              </button>

              {/* Pricelist Menu */}
              <button
                onClick={() => setActivePage("pricelist")}
                className={`group w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-bold transition-all text-[11px] cursor-pointer border ${
                  activePage === "pricelist"
                    ? "bg-white border-brand-500/50 text-brand-600 shadow-sm"
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <DollarSign
                  className={`w-4 h-4 transition-colors ${activePage === "pricelist" ? "text-brand-500" : "text-slate-400 group-hover:text-slate-500"}`}
                />
                Pricelist
              </button>

              {/* Services Menu */}
              <button
                onClick={() => setActivePage("services")}
                className={`group w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-bold transition-all text-[11px] cursor-pointer border ${
                  activePage === "services"
                    ? "bg-white border-brand-500/50 text-brand-600 shadow-sm"
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Shapes
                  className={`w-4 h-4 transition-colors ${activePage === "services" ? "text-brand-500" : "text-slate-400 group-hover:text-slate-500"}`}
                />
                Services
              </button>

              {/* Fastwork Menu */}
              <button
                onClick={() => setActivePage("fastwork")}
                className={`group w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-bold transition-all text-[11px] cursor-pointer border ${
                  activePage === "fastwork"
                    ? "bg-white border-brand-500/50 text-brand-600 shadow-sm"
                    : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Zap
                  className={`w-4 h-4 transition-colors ${activePage === "fastwork" ? "text-brand-500" : "text-slate-400 group-hover:text-slate-500"}`}
                />
                Fastwork
              </button>
            </div>
          </div>
        </nav>

        <div className="p-5 border-t border-slate-100 space-y-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-bold transition-all text-[11px] cursor-pointer text-slate-400 hover:text-red-500 hover:bg-red-50/50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/20 px-6 pb-6 custom-scrollbar relative">
        {activePage === "orders" ? (
          <OrderCMS />
        ) : activePage === "pricelist" ? (
          <PricelistCMS />
        ) : activePage === "fastwork" ? (
          <FastworkCMS />
        ) : activePage === "services" ? (
          <ServicesCMS />
        ) : (
          <div className="flex-1">
            <CMSHeader
              title="Manage Portfolio"
              countText={`${Object.values(data).flat().length} items aktif`}
            >
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Cari portfolio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 w-full md:w-64 shadow-sm transition-all placeholder:text-slate-300"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg flex items-center gap-2 transition-all font-bold text-xs active:scale-[0.98] shrink-0 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
                <button
                  onClick={persistData}
                  disabled={saving}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2 transition-all font-bold text-xs shadow-md shadow-brand-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan
                </button>
              </div>
            </CMSHeader>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === cat.id
                      ? "bg-brand-50 border-brand-500/50 text-brand-700 shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <cat.icon
                    className={`w-4 h-4 ${activeTab === cat.id ? "text-brand-500" : "text-slate-400"}`}
                  />
                  <span className="text-xs font-bold">{cat.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                      activeTab === cat.id
                        ? "bg-brand-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {(data[cat.id] || []).length}
                  </span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <Loader2
                  size={40}
                  className="text-brand-500 animate-spin mb-4"
                />
                <p className="text-slate-400 font-medium">
                  Memuat data dari Supabase...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                <p className="text-red-500 font-bold mb-2">Gagal memuat data</p>
                <p className="text-slate-500 text-sm">{error}</p>
              </div>
            ) : (
              <PortfolioList
                items={data[activeTab] || []}
                category={activeTab}
                searchQuery={searchQuery}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onReorder={handleReorder}
              />
            )}

            <PortfolioModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveItem}
              initialData={editingItem}
              categories={CATEGORIES}
              activeTab={activeTab}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CMSContent;
