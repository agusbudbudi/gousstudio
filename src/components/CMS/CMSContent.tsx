import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  LogOut,
  Search,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
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
  Shuffle,
  Users,
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import PortfolioList from "./PortfolioList";
import PortfolioModal from "./PortfolioModal";
import PricelistCMS from "./PricelistCMS";
import FastworkCMS from "./FastworkCMS";
import ServicesCMS from "./ServicesCMS";
import OrderCMS from "./OrderCMS";
import ClientCMS from "./ClientCMS";
import { useNavigate, useLocation } from "react-router-dom";
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
  children?: React.ReactNode;
}

const MenuItem = ({
  id,
  icon: Icon,
  label,
  activePage,
  isCollapsed,
  onClick,
}: {
  id: string;
  icon: any;
  label: string;
  activePage: string;
  isCollapsed: boolean;
  onClick: () => void;
}) => {
  const isActive = activePage === id;
  return (
    <div className={`w-full ${isCollapsed ? "flex justify-center" : ""}`}>
      <button
        onClick={onClick}
        className={`relative group flex items-center ${isCollapsed ? "justify-center w-10 h-10 px-0" : "w-full gap-2.5 px-4 py-2.5"} rounded-lg font-bold transition-all text-[11px] cursor-pointer border ${
          isActive
            ? "bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20"
            : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/50"
        }`}
      >
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
        />
        {!isCollapsed && <span className="truncate">{label}</span>}

        {isCollapsed && (
          <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 font-medium !text-white text-[10px] rounded-md opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] shadow-sm pointer-events-none flex items-center">
            {label}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 rounded-sm"></div>
          </div>
        )}
      </button>
    </div>
  );
};

const CMSContent: React.FC<CMSContentProps> = ({ onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("gous_cms_sidebar_collapsed") === "true";
  });

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("gous_cms_sidebar_collapsed", String(newState));
  };

  // Helper to determine active page from URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes("/orders")) return "orders";
    if (path.includes("/clients")) return "clients";
    if (path.includes("/portfolio")) return "portfolio";
    if (path.includes("/pricelist")) return "pricelist";
    if (path.includes("/services")) return "services";
    if (path.includes("/fastwork")) return "fastwork";
    return "orders";
  };

  const activePage = getActivePage();

  return (
    <div
      className="flex flex-1 overflow-hidden bg-[#F8FAFC]"
      style={
        {
          "--sidebar-width": isCollapsed ? "4rem" : "12rem",
        } as React.CSSProperties
      }
    >
      {/* Sidebar */}
      <aside
        className={`${isCollapsed ? "w-16" : "w-48"} transition-all duration-300 z-20 border-r border-slate-200 bg-white flex flex-col -[1px_0_0_rgba(0,0,0,0.02)]`}
      >
        <div
          className={`py-3 ${isCollapsed ? "px-2 flex justify-center" : "px-4"}`}
        >
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} hover:opacity-80 transition-opacity cursor-pointer group w-full`}
          >
            <img
              src="/img/gous-logo.png"
              alt="Gous Studio"
              className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-slate-900 leading-tight text-sm group-hover:text-brand-500 transition-colors truncate">
                  Gous Studio
                </h2>
                <p className="text-[9px] text-slate-400 font-bold truncate">
                  Operation Dashboard
                </p>
              </div>
            )}
          </a>
        </div>

        <nav className={`flex-1 ${isCollapsed ? "p-2" : "p-4"} space-y-4`}>
          {/* Operation Group */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 py-2 text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-wider truncate">
                Project Ops
              </div>
            ) : (
              <div className="h-px bg-slate-100 mx-2 mb-3 mt-1"></div>
            )}
            <div className="space-y-1">
              <MenuItem
                id="orders"
                icon={ShoppingCart}
                label="Orders"
                activePage={activePage}
                isCollapsed={isCollapsed}
                onClick={() => navigate("/cms/orders")}
              />
              <MenuItem
                id="clients"
                icon={Users}
                label="Clients"
                activePage={activePage}
                isCollapsed={isCollapsed}
                onClick={() => navigate("/cms/clients")}
              />
            </div>
          </div>

          {/* Setup Group */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 py-2 text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-wider truncate">
                System Setup
              </div>
            ) : (
              <div className="h-px bg-slate-100 mx-2 mb-3 mt-4"></div>
            )}
            <div className="space-y-1">
              <MenuItem
                id="portfolio"
                icon={ImageIcon}
                label="Portfolio"
                activePage={activePage}
                isCollapsed={isCollapsed}
                onClick={() => navigate("/cms/portfolio")}
              />
              <MenuItem
                id="pricelist"
                icon={DollarSign}
                label="Pricelist"
                activePage={activePage}
                isCollapsed={isCollapsed}
                onClick={() => navigate("/cms/pricelist")}
              />
              <MenuItem
                id="services"
                icon={Shapes}
                label="Services"
                activePage={activePage}
                isCollapsed={isCollapsed}
                onClick={() => navigate("/cms/services")}
              />
              <MenuItem
                id="fastwork"
                icon={Zap}
                label="Fastwork"
                activePage={activePage}
                isCollapsed={isCollapsed}
                onClick={() => navigate("/cms/fastwork")}
              />
            </div>
          </div>
        </nav>

        <div
          className={`p-3 border-t border-slate-100 space-y-2 ${isCollapsed ? "flex flex-col items-center" : ""}`}
        >
          <div className={`w-full ${isCollapsed ? "flex justify-center" : ""}`}>
            <button
              onClick={toggleSidebar}
              className={`relative group flex items-center ${isCollapsed ? "justify-center w-10 h-10 px-0" : "w-full gap-2.5 px-4 py-2.5"} rounded-lg font-bold transition-all text-[11px] cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-slate-50`}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform" />
              ) : (
                <ChevronLeft className="w-4 h-4 shrink-0 transition-transform" />
              )}
              {!isCollapsed && <span className="truncate">Collapse Menu</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 font-medium !text-white text-[10px] rounded-md opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] shadow-sm pointer-events-none flex items-center">
                  Expand Menu
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 rounded-sm"></div>
                </div>
              )}
            </button>
          </div>

          <div className={`w-full ${isCollapsed ? "flex justify-center" : ""}`}>
            <button
              onClick={onLogout}
              className={`relative group flex items-center ${isCollapsed ? "justify-center w-10 h-10 px-0" : "w-full gap-2.5 px-4 py-2.5"} rounded-lg font-bold transition-all text-[11px] cursor-pointer text-slate-400 hover:text-red-500 hover:bg-red-50/50`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Sign Out</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 font-medium !text-white text-[10px] rounded-md opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[100] shadow-sm pointer-events-none flex items-center">
                  Sign Out
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 rounded-sm"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/20 px-6 pb-6 pt-[58px] custom-scrollbar relative">
        {children}
      </main>
    </div>
  );
};

export default CMSContent;
