import React from "react";
import { ImageOff, Search } from "lucide-react";
import LazyImage from "../ui/LazyImage";
import { resolveImageUrl } from "../utils/imageResolver";
import { PortfolioItem } from "../types";

interface PortfolioCardProps {
  item: PortfolioItem;
  index: number;
  onClick: (index: number) => void;
}

const tagColors = [
  "border border-brand-500/40 text-[var(--color-brand)] bg-transparent",
  "border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-transparent",
  "border border-violet-500/40 text-violet-600 dark:text-violet-400 bg-transparent",
  "border border-pink-500/40 text-pink-600 dark:text-pink-400 bg-transparent",
  "border border-green-500/40 text-green-600 dark:text-green-400 bg-transparent",
  "border border-orange-500/40 text-orange-600 dark:text-orange-400 bg-transparent",
];

const getTagColor = (i: number) => tagColors[i % tagColors.length];

const PortfolioCard: React.FC<PortfolioCardProps> = ({ item, index, onClick }) => {
  return (
    <article
      onClick={() => onClick(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(index);
        }
      }}
      className="glass neon-border rounded-xl overflow-hidden group relative cursor-pointer break-inside-avoid mb-4 md:mb-6 duration-400 hover:shadow-[0_16px_40px_var(--color-shadow-primary)] light:hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-bg)]"
      tabIndex={0}
      role="button"
      aria-label={`View ${item.title || "portfolio item"} details`}
    >
      <div className="relative">
        <div className="overflow-hidden bg-[var(--color-bg)]">
          {item.linkUrl && item.linkUrl.includes("canva.com/design/") ? (
            <div className="w-full aspect-video relative pointer-events-none">
              <iframe
                src={item.linkUrl}
                className="absolute inset-0 w-full h-full border-none pointer-events-none rounded-t-xl"
                title={item.title || "Canva Embed"}
                loading="lazy"
              ></iframe>
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
    </article>
  );
};

export default PortfolioCard;
