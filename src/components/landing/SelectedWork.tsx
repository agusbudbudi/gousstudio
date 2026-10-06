import React, { useCallback, useMemo, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Lightbox from "../../ui/Lightbox";

import { Container, EASE, SectionHeader, Skeleton, WaButton, WorkImage } from "./primitives";
import { Masonry } from "./Masonry";
import { usePortfolio, workGroup, workGroups } from "./useLandingData";

// Masonry so every piece keeps its native aspect ratio, ordered left → right.
const LIMIT = 12;
const SKELETON_HEIGHTS = ["h-[380px]", "h-[280px]", "h-[340px]", "h-[260px]", "h-[300px]", "h-[360px]", "h-[270px]", "h-[330px]"];

const SelectedWork: React.FC = () => {
  const { data: works = [], isLoading, isError } = usePortfolio();
  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedIds, setFailedIds] = useState<Set<string | number>>(() => new Set());

  const handleImageError = useCallback((id: string | number) => {
    setFailedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // One filter per service that has works, in CMS service order
  const filters = useMemo(
    () => [{ id: "all", label: "Semua" }, ...workGroups(works).map((g) => ({ id: g.slug, label: g.title }))],
    [works],
  );

  const visible = useMemo(() => {
    const list = filter === "all" ? works : works.filter((w) => workGroup(w).slug === filter);
    return list
      .filter((w) => Boolean(w.src) && !failedIds.has(w.id || w.title))
      .slice(0, LIMIT);
  }, [works, filter, failedIds]);

  return (
    <section id="karya" aria-labelledby="karya-title" className="py-20 md:py-32">
      <Container>
        <SectionHeader
          id="karya-title"
          index="01"
          eyebrow="Selected Work"
          title={
            <>
              Karya yang bicara lebih keras dari kata-kata.
            </>
          }
          description="Pilihan project terbaru — dari identitas brand sampai poster event."
          action={
            <Link
              to={filter === "all" ? "/portfolio" : `/portfolio?cat=${filter}`}
              className="group inline-flex items-center gap-1.5 font-semibold text-ink underline-offset-4 hover:underline"
            >
              Lihat semua karya
              <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <LayoutGroup>
          <div
            role="tablist"
            aria-label="Filter layanan"
            className="-mx-5 mt-12 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide md:mx-0 md:px-0"
          >
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={`relative h-11 shrink-0 rounded-full px-5 text-[15px] font-medium transition-colors ${
                    active ? "text-paper" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="gs-filter-pill"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  {!active && <span className="absolute inset-0 rounded-full border border-ink/15" />}
                  <span className="relative">{f.label}</span>
                </button>
              );
            })}
          </div>

          {isError ? (
            <div className="mt-8 flex flex-col items-start gap-4 rounded-[24px] border border-dashed border-ink/20 p-8 md:flex-row md:items-center md:justify-between md:p-10">
              <p className="max-w-[48ch] text-muted">
                Galeri karya sedang tidak bisa dimuat. Minta contoh karya sesuai kebutuhanmu langsung lewat WhatsApp.
              </p>
              <WaButton context="karya-error" message="Halo Gous Studio, boleh minta contoh portfolio?">
                Minta contoh karya
              </WaButton>
            </div>
          ) : isLoading ? (
            <ul className="mt-8 columns-2 gap-3 sm:gap-5 md:columns-3 lg:columns-4">
              {SKELETON_HEIGHTS.map((h) => (
                <li key={h} className="mb-6 break-inside-avoid sm:mb-8">
                  <Skeleton className={`w-full ${h}`} />
                </li>
              ))}
            </ul>
          ) : (
            <Masonry
              className="mt-8"
              items={visible}
              renderItem={(work, i) => (
                      <motion.li
                        key={`${filter}-${work.id || work.title}`}
                        layout="position"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
                        className="mb-6 break-inside-avoid sm:mb-8"
                      >
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(i)}
                          className="group block w-full text-left"
                          aria-label={`Lihat ${work.title}`}
                        >
                          <div className="relative isolate overflow-hidden rounded-[20px] bg-paper-200 [transform:translateZ(0)]">
                            <WorkImage
                              src={work.src}
                              alt={work.imgAlt || `${work.title} — ${workGroup(work).title} oleh Gous Studio`}
                              fallbackLabel={work.title}
                              onError={() => handleImageError(work.id || work.title)}
                              className="block h-auto w-full group-hover:scale-[1.03]"
                            />
                            <span className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-paper text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                              <ArrowUpRight size={20} />
                            </span>
                          </div>
                          <div className="mt-3">
                            <h3 className="text-base font-semibold leading-snug text-ink transition-transform duration-300 group-hover:translate-x-1">
                              {work.title}
                            </h3>
                            <span className="gs-label mt-1 hidden text-muted sm:block">
                              {workGroup(work).title}
                            </span>
                          </div>
                        </button>
                      </motion.li>
              )}
            />
          )}

          {!isLoading && !isError && visible.length === 0 && (
            <p className="mt-10 text-muted">Belum ada karya di layanan ini.</p>
          )}
        </LayoutGroup>
      </Container>

      {lightboxIndex !== null && (
        <Lightbox
          items={visible}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(dir) =>
            setLightboxIndex((p) => (p === null ? 0 : (p + dir + visible.length) % visible.length))
          }
        />
      )}
    </section>
  );
};

export default SelectedWork;
