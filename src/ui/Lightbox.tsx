import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, PanInfo, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { getLightboxDisplayUrl } from "../utils/imageResolver";
import { PortfolioItem } from "../types";
import { workGroup } from "../components/landing/useLandingData";
import { WaButton } from "../components/landing/primitives";

interface LightboxProps {
  items: PortfolioItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}

const isCanva = (item?: PortfolioItem) => Boolean(item?.linkUrl?.includes("canva.com/design/"));

// Full-screen work viewer (docs/DESIGN.md §2.11).
const Lightbox = ({ items, currentIndex, onClose, onNavigate }: LightboxProps) => {
  const reduce = useReducedMotion();
  const item = items[currentIndex];
  const src = item ? getLightboxDisplayUrl(item) : null;
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [direction, setDirection] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  // A swipe ends with a click event; ignore it so swiping never closes the viewer.
  const draggedRef = useRef(false);
  const multiple = items.length > 1;

  const go = (delta: number) => {
    if (!multiple) return;
    setDirection(delta);
    onNavigate(delta);
  };

  useEffect(() => setStatus("loading"), [currentIndex]);

  // Preload neighbours so next/prev feel instant.
  useEffect(() => {
    if (!multiple) return;
    [1, -1].forEach((d) => {
      const n = items[(currentIndex + d + items.length) % items.length];
      const url = n && getLightboxDisplayUrl(n);
      if (url) new Image().src = url;
    });
  }, [currentIndex, items, multiple]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, onNavigate, multiple]);

  if (!item) return null;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    window.setTimeout(() => (draggedRef.current = false), 0);
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  const category = workGroup(item).title;
  const offset = reduce ? 0 : 60;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview karya: ${item.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="gs-dark fixed inset-0 z-[120] flex flex-col bg-ink/[0.97] text-paper backdrop-blur-md"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 md:pt-6">
        <p className="gs-label tabular-nums text-paper/60" aria-live="polite">
          <span className="text-paper">{String(currentIndex + 1).padStart(2, "0")}</span>
          <span className="mx-1.5">/</span>
          {String(items.length).padStart(2, "0")}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup preview"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/15 text-paper transition-colors hover:border-paper/40 hover:bg-paper/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* Stage — click on empty space closes */}
      <div className="relative flex min-h-0 flex-1 cursor-pointer items-center justify-center px-4 py-4 md:px-24" onClick={onClose}>
        {multiple && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Karya sebelumnya"
              className="absolute left-6 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 text-paper transition-colors hover:bg-paper hover:text-ink md:flex"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Karya berikutnya"
              className="absolute right-6 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 text-paper transition-colors hover:bg-paper hover:text-ink md:flex"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -offset }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            drag={multiple && !isCanva(item) ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => (draggedRef.current = true)}
            onDragEnd={onDragEnd}
            onClick={(e) => {
              e.stopPropagation();
              // Only the image/embed itself keeps the viewer open; empty space around it closes.
              if (!draggedRef.current && e.target === e.currentTarget) onClose();
            }}
            className={`relative flex h-full items-center justify-center ${isCanva(item) ? "w-full max-w-6xl cursor-default" : "max-w-full"} ${multiple && !isCanva(item) ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            {isCanva(item) ? (
              <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-ink-800">
                <iframe src={item.linkUrl} title={item.title} allowFullScreen className="h-full w-full border-0" />
              </div>
            ) : src && status !== "error" ? (
              <>
                {status === "loading" && <Loader2 size={32} className="absolute animate-spin text-paper/40" aria-label="Memuat gambar" />}
                <img
                  src={src}
                  alt={item.imgAlt || `${item.title} — ${category} oleh Gous Studio`}
                  draggable={false}
                  onLoad={() => setStatus("loaded")}
                  onError={() => setStatus("error")}
                  className={`max-h-full max-w-full select-none rounded-2xl object-contain transition-opacity duration-300 ${
                    status === "loaded" ? "opacity-100" : "opacity-0"
                  }`}
                />
              </>
            ) : (
              <div className="flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-paper/10 p-8 text-center">
                <p className="gs-display text-3xl font-bold text-paper/40">{item.title}</p>
                <p className="mt-3 text-sm text-paper/50">Gambar sedang tidak bisa dimuat.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption + CTA */}
      <div className="border-t border-paper/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="min-w-0">
            <p className="gs-label text-violet-300">{category}</p>
            <h2 className="mt-1.5 text-lg font-semibold leading-snug md:text-xl">{item.title}</h2>
            {item.description && <p className="mt-1 line-clamp-2 max-w-[70ch] text-sm text-paper/60">{item.description}</p>}
            {item.tags && item.tags.length > 0 && (
              <ul className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
                {item.tags.slice(0, 5).map((tag) => (
                  <li key={tag} className="rounded-full border border-paper/15 px-2.5 py-1 text-xs text-paper/70">
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {multiple && (
              <div className="flex gap-2 md:hidden">
                <button type="button" onClick={() => go(-1)} aria-label="Karya sebelumnya" className="flex h-12 w-12 items-center justify-center rounded-full bg-paper/10">
                  <ChevronLeft size={20} />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Karya berikutnya" className="flex h-12 w-12 items-center justify-center rounded-full bg-paper/10">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
            <WaButton
              context="lightbox"
              variant="light"
              message={`Halo Gous Studio, saya lihat karya "${item.title}" dan mau desain seperti ini.`}
              className="flex-1 md:flex-none"
            >
              Mau desain seperti ini
            </WaButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Lightbox;
