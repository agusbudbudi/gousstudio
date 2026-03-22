import React, { useEffect, useState } from "react";
import { getLightboxDisplayUrl } from "../utils/imageResolver";
import { X, ChevronLeft, ChevronRight, Loader2, ImageOff } from "lucide-react";

const Lightbox = ({ items, currentIndex, onClose, onNavigate }) => {
  const item = items[currentIndex];
  const [displayImage, setDisplayImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const tagColors = [
    "border border-brand-500/40 text-[var(--color-brand)] bg-transparent",
    "border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-transparent",
    "border border-violet-500/40 text-violet-600 dark:text-violet-400 bg-transparent",
    "border border-pink-500/40 text-pink-600 dark:text-pink-400 bg-transparent",
    "border border-green-500/40 text-green-600 dark:text-green-400 bg-transparent",
    "border border-orange-500/40 text-orange-600 dark:text-orange-400 bg-transparent",
  ];

  const getTagColor = (i) => tagColors[i % tagColors.length];

  useEffect(() => {
    setLoading(true);
    const resolved = getLightboxDisplayUrl(item);
    setDisplayImage(resolved);
    setLoading(false);
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("lightbox-open");
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("lightbox-open");
    };
  }, [onClose, onNavigate]);

  return (
    <div
      id="lightbox"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-xl transition-all duration-300 active"
    >
      <button
        onClick={onClose}
        aria-label="Close Lightbox"
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
      >
        <X size={32} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(-1);
        }}
        aria-label="Previous Image"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all z-[110]"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(1);
        }}
        aria-label="Next Image"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full glass border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all z-[110]"
      >
        <ChevronRight size={32} />
      </button>

      <div className="relative max-w-5xl w-full px-6 flex flex-col items-center">
        <div
          id="lightbox-content"
          className="w-full h-[65vh] flex items-center justify-center mb-8 relative"
        >
          {loading ? (
            <div className="text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          ) : item.linkUrl && item.linkUrl.includes("canva.com/design/") ? (
            <div className="w-full h-full max-w-4xl max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl relative bg-[var(--color-bg)]">
              <iframe
                src={item.linkUrl}
                className="w-full h-full border-none absolute inset-0"
                allowFullScreen
                title={item.title || "Canva Preview"}
              ></iframe>
            </div>
          ) : displayImage ? (
            <img
              src={displayImage}
              alt={item.title}
              className="max-h-full rounded-xl shadow-2xl bg-[var(--color-bg)]"
              onError={(e) => (e.target.src = "placeholder.png")}
            />
          ) : item.emoji ? (
            <div className="text-9xl">{item.emoji}</div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-slate-500 py-20 px-10 glass rounded-3xl border border-white/5">
              <ImageOff size={64} className="opacity-20" />
              <div className="text-center">
                <p className="font-bold text-lg text-white/50">
                  Preview Not Available
                </p>
                <p className="text-sm opacity-50">
                  Source asset failed to load
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center max-w-2xl">
          <h3 className="text-lg md:text-xl font-bold text-white mb-3">
            {item.title}
          </h3>
          <p className="text-slate-400 text-sm md:text-base mb-5 leading-relaxed">
            {item.description}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {(item.tags || []).map((tag, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-full ${getTagColor(i)} text-xs font-medium`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 text-sm tracking-[0.2em] font-bold">
        {currentIndex + 1} / {items.length}
      </div>
    </div>
  );
};

export default Lightbox;
