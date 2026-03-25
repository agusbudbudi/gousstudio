import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Lightbox from "../ui/Lightbox";
import { resolveImageUrl, getFallbackImageUrl } from "../utils/imageResolver";
import * as LucideIcons from "lucide-react";
import { ImageOff, Search, ArrowRight } from "lucide-react";
import LazyImage from "../ui/LazyImage";
import { supabase } from "../utils/supabase";
import PortfolioCard from "./PortfolioCard";

import { PortfolioItem } from "../types";

interface PortfolioProps {
  showTitle?: boolean;
  limit?: number | null;
  initialTab?: string;
  isSticky?: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({
  showTitle = true,
  limit = null,
  initialTab = "poster",
  isSticky = false,
}) => {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [portfolioData, setPortfolioData] = useState<Record<string, PortfolioItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 36;

  useEffect(() => {
    setActiveTab(initialTab);
    setSelectedCategory("All");
    setSearchTerm("");
    setCurrentPage(1); // Reset pagination when tab changes
  }, [initialTab]);

  useEffect(() => {
    setSelectedCategory("All");
    setSearchTerm("");
    setCurrentPage(1); // Reset filter and pagination when active tab changes
  }, [activeTab]);

  // Load portfolio items from Supabase (public side via anon key).
  useEffect(() => {
    let cancelled = false;
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from("portfolios")
          .select("*")
          .order("order_index", { ascending: true });

        if (fetchError) throw fetchError;

        const mapped: PortfolioItem[] = (data || []).map((row) => ({
          // Normalize field names so existing UI keeps working.
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category,
          tags: row.tags || [],
          imgAlt: row.imgalt || "",
          linkUrl: row.linkurl || "",
          image: row.image || null,
          role: row.role || "",
          tools: row.tools || [],
          order_index: row.order_index,
        }));

        const grouped = mapped.reduce((acc: Record<string, PortfolioItem[]>, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});

        if (!cancelled) setPortfolioData(grouped);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load portfolio");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPortfolio();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    { id: "poster", icon: "Image", name: "Poster Design" },
    { id: "feed", icon: "Grid", name: "Feed Sosial Media" },
    { id: "ecommerce", icon: "ShoppingCart", name: "E-commerce" },
    { id: "logo", icon: "Palette", name: "Logo Design" },
    { id: "management", icon: "BarChart", name: "Sosmed Management" },
    { id: "ads", icon: "Megaphone", name: "Ads Design" },
  ];

  // Generate structured data for portfolio items
  const generateStructuredData = () => {
    const portfolioItems = Object.values(portfolioData).flat() as PortfolioItem[];
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Gous Studio Portfolio",
      description: "Portfolio of creative design works by Gous Studio",
      numberOfItems: portfolioItems.length,
      itemListElement: portfolioItems.map((item, index) => ({
        "@type": "CreativeWork",
        position: index + 1,
        name: item.title,
        description: item.description,
        creator: {
          "@type": "Organization",
          name: "Gous Studio",
        },
        genre: item.tags,
        url:
          item.linkUrl ||
          `https://gousstudio.com/portfolio#${item.title?.toLowerCase().replace(/\s+/g, "-")}`,
      })),
    };
  };

  // Add structured data to head
  const structuredDataScriptRef = React.useRef<HTMLScriptElement | null>(null);
  useEffect(() => {
    // Avoid injecting SEO script until data available.
    if (loading) return;
    const allItems = Object.values(portfolioData).flat();
    if (!allItems.length) return;

    if (structuredDataScriptRef.current) {
      document.head.removeChild(structuredDataScriptRef.current);
      structuredDataScriptRef.current = null;
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(generateStructuredData());
    document.head.appendChild(script);
    structuredDataScriptRef.current = script;

    return () => {
      if (structuredDataScriptRef.current) {
        document.head.removeChild(structuredDataScriptRef.current);
        structuredDataScriptRef.current = null;
      }
    };
  }, [loading, portfolioData]);

  const bannerCategories =
    activeTab === "ecommerce"
      ? [
          "All",
          ...Array.from(new Set((portfolioData.ecommerce || []).flatMap((item) => item.tags || []))),
        ]
      : [];

  const allItems = portfolioData[activeTab] || [];

  // Apply category filter
  const categoryFilteredItems =
    activeTab === "ecommerce" && selectedCategory !== "All"
      ? allItems.filter((item) => item.tags?.includes(selectedCategory))
      : allItems;

  // Apply search filter
  const searchFilteredItems = categoryFilteredItems.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  // Apply pagination
  const totalPages = Math.ceil(searchFilteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = limit
    ? searchFilteredItems.slice(0, limit)
    : searchFilteredItems.slice(startIndex, endIndex);

  const displayItems = paginatedItems;
  const hasMore = limit && searchFilteredItems.length > limit;

  if (loading) {
    return (
      <section id="portfolio" className={`${showTitle ? "py-10" : "pb-10"} px-0`}>
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-medium">
              Memuat portofolio...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="portfolio" className={`${showTitle ? "py-10" : "pb-10"} px-0`}>
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="py-20 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-rose-500 font-bold text-sm">Gagal memuat portfolio</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className={`${showTitle ? "py-10" : "pb-10"} px-0`}>
      {showTitle && (
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 text-center mb-10 reveal">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 title-gradient-line">
            🎨 Portofolio Gous Studio
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-4">
            Menampilkan desain pilihan yang memadukan kreativitas, strategi, dan
            sentuhan personal.
          </p>
        </div>
      )}

      {/* TABS CONTAINER */}
      <div
        className={
          isSticky
            ? "sticky top-15 lg:top-15 z-30 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border-adaptive)] py-2 mb-10"
            : "mb-10 reveal"
        }
      >
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="flex md:justify-center overflow-x-auto scrollbar-hide">
            <div className="inline-flex items-center p-1.5 glass neon-border rounded-2xl gap-1 w-max mx-auto md:mx-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-brand-500 text-white neon-glow"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-title)]"
                  }`}
                  aria-pressed={activeTab === tab.id}
                  aria-label={`View ${tab.name} portfolio`}
                  role="tab"
                >
                  {React.createElement(
                    (LucideIcons as any)[tab.icon] || LucideIcons.HelpCircle,
                    {
                      size: 16,
                    },
                  )}
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6 reveal">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={`Cari ${tabs.find((tab) => tab.id === activeTab)?.name?.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              aria-label="Search portfolio items"
            />
          </div>
        </div>
      </div>

      {activeTab === "ecommerce" && bannerCategories.length > 1 && (
        <div className="mb-6 reveal">
          <div className="max-w-[1400px] mx-auto px-3 md:px-6">
            <div className="flex flex-wrap justify-center gap-2">
              {bannerCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-brand-500 text-white neon-glow"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-pressed={selectedCategory === category}
                  aria-label={`Filter by ${category} category`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-3 md:px-6 relative">
        <div
          className={`tab-content active columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6 ${hasMore ? "relative pb-0" : ""}`}
          style={
            hasMore
              ? {
                  maskImage:
                    "linear-gradient(to top, transparent 0px, black 300px)",
                  WebkitMaskImage:
                    "linear-gradient(to top, transparent 0px, black 300px)",
                }
              : {}
          }
        >
          {displayItems.map((item, index) => (
            <PortfolioCard
              key={item.id || `${item.title || "item"}-${index}`}
              item={item}
              index={index}
              onClick={setLightboxIndex}
            />
          ))}
        </div>

        {/* PAGINATION CONTROLS */}
        {!limit && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 mb-6 reveal">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              ← Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-all ${
                      currentPage === pageNum
                        ? "bg-brand-500 text-white"
                        : "bg-white/5 hover:bg-white/10 text-white"
                    }`}
                    aria-label={`Page ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        )}

        {hasMore && (
          <div className="relative z-20 flex justify-center -mt-24 mb-0 reveal">
            <Link
              to="/portfolio"
              state={{ activeTab }}
              className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-12 py-5 rounded-2xl bg-brand-500 text-white font-black text-lg transition-all duration-300 shadow-[0_0_20px_rgba(255,119,57,0.3)] hover:shadow-[0_0_40px_rgba(255,119,57,0.4)] hover:scale-105 active:scale-[0.98]"
            >
              Lihat semua {allItems.length} Project
              <ArrowRight
                size={22}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={displayItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(dir) =>
            setLightboxIndex(
              (prev) => {
                if (prev === null) return 0;
                return (prev + dir + displayItems.length) % displayItems.length;
              },
            )
          }
        />
      )}
    </section>
  );
};

export default Portfolio;
