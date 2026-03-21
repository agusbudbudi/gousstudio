import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import portfolioData from "../data/portfolio.json";
import Lightbox from "../ui/Lightbox";
import { resolveImageUrl } from "../utils/imageResolver";
import * as LucideIcons from "lucide-react";
import { ImageOff, Search, ArrowRight } from "lucide-react";
import LazyImage from "../ui/LazyImage";

const Portfolio = ({
  showTitle = true,
  limit = null,
  initialTab = "poster",
  isSticky = false,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const tabs = [
    { id: "poster", icon: "Image", name: "Poster Design" },
    { id: "feed", icon: "Grid", name: "Feed Sosial Media" },
    { id: "logo", icon: "Palette", name: "Logo Design" },
    { id: "management", icon: "BarChart", name: "Sosmed Management" },
    { id: "ads", icon: "Megaphone", name: "Ads Design" },
  ];

  const tagColors = [
    "border border-brand-500/40 text-[var(--color-brand)] bg-transparent",
    "border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-transparent",
    "border border-violet-500/40 text-violet-600 dark:text-violet-400 bg-transparent",
    "border border-pink-500/40 text-pink-600 dark:text-pink-400 bg-transparent",
    "border border-green-500/40 text-green-600 dark:text-green-400 bg-transparent",
    "border border-orange-500/40 text-orange-600 dark:text-orange-400 bg-transparent",
  ];

  const getTagColor = (i) => tagColors[i % tagColors.length];

  const allItems = portfolioData[activeTab] || [];
  const displayItems = limit ? allItems.slice(0, limit) : allItems;
  const hasMore = limit && allItems.length > limit;

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
            ? "sticky top-15 lg:top-15 z-30 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border-adaptive)] py-4 mb-10"
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
                >
                  {React.createElement(
                    LucideIcons[tab.icon] || LucideIcons.HelpCircle,
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

      <div className="max-w-[1400px] mx-auto px-3 md:px-6">
        <div className="tab-content active columns-2 lg:columns-3 gap-3 md:gap-6">
          {displayItems.map((item, index) => (
            <div
              key={index}
              onClick={() => setLightboxIndex(index)}
              className="glass neon-border rounded-xl overflow-hidden group relative cursor-pointer break-inside-avoid mb-4 md:mb-6 duration-400 hover:shadow-[0_16px_40px_var(--color-shadow-primary)] light:hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="relative">
                <div className="overflow-hidden bg-[var(--color-bg)]">
                  {item.linkUrl && item.linkUrl.includes("canva.com/design/") ? (
                    <div className="w-full aspect-video relative pointer-events-none">
                      <iframe src={item.linkUrl} className="absolute inset-0 w-full h-full border-none pointer-events-none rounded-t-xl" title={item.title || "Canva Embed"} loading="lazy"></iframe>
                    </div>
                  ) : resolveImageUrl(item) ? (
                    <LazyImage
                      src={resolveImageUrl(item)}
                      alt={item.imgAlt || item.title}
                      className="w-full transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
                    />
                  ) : item.emoji ? (
                    <div className="aspect-video flex items-center justify-center text-6xl bg-gradient-to-br from-brand-500/10 to-neon/5">
                      {item.emoji}
                    </div>
                  ) : (
                    <div className="aspect-video flex flex-col items-center justify-center text-slate-600 bg-white/5">
                      <ImageOff size={32} />
                      <span className="text-[10px] uppercase tracking-wider font-bold">
                        Preview not available
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="glass px-2 py-1 rounded-lg text-xs text-white flex items-center gap-1">
                    <Search size={14} /> Preview
                  </span>
                </div>
              </div>

              {(item.title ||
                item.description ||
                (item.tags && item.tags.length > 0)) && (
                <div className="p-3 md:p-5">
                  {item.title && (
                    <h3 className="font-bold text-white mb-1.5 md:mb-2 text-sm md:text-base">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-slate-400 text-[11px] md:text-sm mb-2 md:mb-3 line-clamp-2 md:line-clamp-none">
                      {item.description}
                    </p>
                  )}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {item.tags.map((tag, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg ${getTagColor(i)} text-[9px] md:text-xs font-medium`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-12 mb-6 reveal">
            <Link
              to="/portfolio"
              state={{ activeTab }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all duration-300 neon-border hover:scale-105 group"
            >
              Lihat semua {allItems.length} Project
              <ArrowRight
                size={20}
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
              (prev) =>
                (prev + dir + displayItems.length) % displayItems.length,
            )
          }
        />
      )}
    </section>
  );
};

export default Portfolio;
