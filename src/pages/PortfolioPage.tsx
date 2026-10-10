import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Search, X } from 'lucide-react';
import Lightbox from '../ui/Lightbox';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import FinalCta from '../components/landing/FinalCta';
import StickyCta from '../components/landing/StickyCta';
import { Container, EASE, Eyebrow, Skeleton, WaButton, WorkImage } from '../components/landing/primitives';
import { Masonry } from '../components/landing/Masonry';
import {
  LEGACY_WORK_CATEGORY_TO_SERVICE,
  usePortfolio,
  WorkItem,
  workGroup,
  workGroups,
} from '../components/landing/useLandingData';

const PAGE_SIZE = 24;
const TITLE = 'Portfolio Desain Logo, Poster & Social Media | Gous Studio';
const DESCRIPTION =
  'Koleksi karya Gous Studio: desain logo, brand identity, poster, feed Instagram, dan materi iklan untuk UMKM dan personal brand di Indonesia.';


const isCanva = (item: WorkItem) => Boolean(item.linkUrl?.includes('canva.com/design/'));

const WorkCard: React.FC<{ item: WorkItem; onOpen: () => void; onError?: () => void }> = ({ item, onOpen, onError }) => (
  <button type="button" onClick={onOpen} className="group block w-full text-left" aria-label={`Lihat ${item.title}`}>
    <div className="relative isolate overflow-hidden rounded-[12px] md:rounded-[16px] bg-paper-200 [transform:translateZ(0)]">
      {item.src ? (
        <WorkImage
          src={item.src}
          alt={item.imgAlt || `${item.title} — ${workGroup(item).title} oleh Gous Studio`}
          fallbackLabel={item.title}
          onError={onError}
          className="block w-full group-hover:scale-[1.03]"
        />
      ) : isCanva(item) ? (
        <div className="pointer-events-none relative aspect-video w-full">
          <iframe src={item.linkUrl} title={item.title} loading="lazy" className="absolute inset-0 h-full w-full border-0" />
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center p-6">
          <span className="gs-display text-center text-3xl font-bold text-ink/30">{item.title}</span>
        </div>
      )}
      <span className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-paper text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight size={20} />
      </span>
    </div>
    <div className="mt-3">
      <h2 className="text-sm font-semibold leading-snug text-ink transition-transform md:text-base duration-300 group-hover:translate-x-1">
        {item.title}
      </h2>
      <span className="gs-label mt-1 hidden text-muted sm:block">{workGroup(item).title}</span>
    </div>
    {item.tags && item.tags.length > 0 && (
      <p className="mt-1 hidden truncate text-sm text-muted sm:block">{item.tags.slice(0, 3).join(' · ')}</p>
    )}
  </button>
);

const PortfolioPage = () => {
  const location = useLocation();
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const { data: works = [], isLoading, isError, refetch } = usePortfolio(false);

  // Legacy links pass { activeTab } via router state; new links use ?cat=
  const legacyTab = (location.state as { activeTab?: string } | null)?.activeTab;
  const rawCategory = params.get('cat') || legacyTab || 'all';
  // ?cat= holds a service slug; old portfolio category ids are mapped to their service
  const category = LEGACY_WORK_CATEGORY_TO_SERVICE[rawCategory] ?? rawCategory;
  const tag = params.get('tag') || 'all';
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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

  const setFilter = (key: 'cat' | 'tag', value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    if (key === 'cat') next.delete('tag');
    setParams(next, { replace: true });
  };

  useEffect(() => setVisibleCount(PAGE_SIZE), [category, tag, query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    works.forEach((w) => {
      const key = workGroup(w).slug;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [works]);

  // One filter per service that has works, in CMS service order
  const categories = useMemo(() => workGroups(works).map((g) => ({ id: g.slug, label: g.title })), [works]);

  const inCategory = useMemo(
    () => (category === 'all' ? works : works.filter((w) => workGroup(w).slug === category)),
    [works, category],
  );

  const tags = useMemo(
    () => (category === 'all' ? [] : Array.from(new Set(inCategory.flatMap((w) => w.tags || []))).slice(0, 12)),
    [inCategory, category],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inCategory.filter((w) => {
      if (failedIds.has(w.id || w.title)) return false;
      if (tag !== 'all' && !w.tags?.includes(tag)) return false;
      if (!q) return true;
      return [w.title, w.description, ...(w.tags || [])].some((v) => v?.toLowerCase().includes(q));
    });
  }, [inCategory, tag, query, failedIds]);

  const shown = filtered.slice(0, visibleCount);

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Portfolio Gous Studio',
      numberOfItems: works.length,
      itemListElement: works.slice(0, 50).map((w, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'CreativeWork', name: w.title, genre: workGroup(w).title, creator: { '@type': 'Organization', name: 'Gous Studio' } },
      })),
    }),
    [works],
  );

  return (
    <motion.div
      className="gs min-h-[100dvh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <link rel="canonical" href="https://gousstudio.com/portfolio" />
        <meta name="theme-color" content="#f7f6f2" />
        {works.length > 0 && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
      </Helmet>

      <LandingNavbar />

      <div id="main" tabIndex={-1} className="outline-none">
        {/* Header */}
        <section id="top" aria-labelledby="portfolio-title" className="gs-grain relative pb-10 pt-24 md:pb-12 md:pt-32">
          <Container>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink">
              <ArrowLeft size={16} /> Beranda
            </Link>
            <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-8">
                <Eyebrow className="text-muted">Portfolio</Eyebrow>
                <h1
                  id="portfolio-title"
                  className="gs-display mt-5 text-[clamp(2.75rem,8vw,6.25rem)] font-extrabold text-ink"
                >
                  {['Karya yang', 'bicara sendiri.'].map((line, i) => (
                    <span key={line} className="block overflow-hidden pb-[0.06em]">
                      <motion.span
                        className="block"
                        initial={reduce ? false : { y: '105%' }}
                        animate={{ y: '0%' }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.05 + i * 0.09 }}
                      >
                        {i === 1 ? <><span className="text-violet-600">bicara</span> sendiri.</> : line}
                      </motion.span>
                    </span>
                  ))}
                </h1>
              </div>
              <div className="md:col-span-4">
                <p className="max-w-[40ch] text-[17px] leading-relaxed text-muted">
                  Logo, poster, feed Instagram, sampai materi iklan — dikerjakan untuk UMKM, personal brand,
                  dan event organizer di seluruh Indonesia.
                </p>
                <p className="mt-4 text-sm text-ink">
                  {isLoading ? '…' : <><span className="font-semibold">{works.length}</span> karya · <span className="font-semibold">{categories.length}</span> layanan</>}
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Sticky filter bar */}
        <div className="gs-subnav sticky z-40 border-y border-ink/10 bg-paper/90 backdrop-blur-xl">
          <Container className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
            <LayoutGroup>
              <div role="tablist" aria-label="Layanan" className="-mx-5 flex gap-1.5 overflow-x-auto px-5 scrollbar-hide md:mx-0 md:px-0">
                {[{ id: 'all', label: 'Semua' }, ...categories].map((c) => {
                  const active = category === c.id;
                  const count = c.id === 'all' ? works.length : counts[c.id];
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter('cat', c.id)}
                      className={`relative h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${active ? 'text-paper' : 'text-ink/70 hover:text-ink'}`}
                    >
                      {active && (
                        <motion.span layoutId="gs-portfolio-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
                      )}
                      <span className="relative">
                        {c.label}
                        {!isLoading && <span className={`ml-1.5 tabular-nums ${active ? 'text-paper/60' : 'text-muted'}`}>{count}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            <label className="relative block md:w-72">
              <span className="sr-only">Cari karya</span>
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari karya, klien, tag…"
                className="h-10 w-full rounded-full border border-ink/15 bg-[#fff] pl-10 pr-10 text-sm text-ink placeholder:text-muted focus:border-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-600/10"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Hapus pencarian" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                  <X size={16} />
                </button>
              )}
            </label>
          </Container>

          {tags.length > 1 && (
            <Container className="-mt-1 pb-3">
              <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 scrollbar-hide md:mx-0 md:px-0" aria-label="Filter tag">
                {['all', ...tags].map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tag === t}
                    onClick={() => setFilter('tag', t)}
                    className={`h-8 shrink-0 rounded-full px-3 text-[13px] font-medium transition-colors ${
                      tag === t ? 'bg-violet-100 text-violet-800' : 'text-ink/60 hover:bg-ink/[0.05] hover:text-ink'
                    }`}
                  >
                    {t === 'all' ? 'Semua tag' : t}
                  </button>
                ))}
              </div>
            </Container>
          )}
        </div>

        {/* Grid */}
        <section aria-label="Daftar karya" className="py-12 md:py-16">
          <Container>
            {isLoading ? (
              <div className="columns-2 gap-3 sm:gap-5 md:columns-3 lg:columns-4">
                {['h-[340px]', 'h-[260px]', 'h-[420px]', 'h-[300px]', 'h-[380px]', 'h-[280px]'].map((h) => (
                  <Skeleton key={h} className={`mb-6 w-full break-inside-avoid sm:mb-8 ${h}`} />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-start gap-4 rounded-[24px] border border-dashed border-ink/20 p-8 md:flex-row md:items-center md:justify-between md:p-10">
                <p className="max-w-[52ch] text-muted">
                  Galeri karya sedang tidak bisa dimuat. Coba lagi, atau minta contoh karya langsung lewat WhatsApp.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => refetch()} className="h-12 rounded-full border border-ink/15 px-6 font-semibold text-ink hover:border-ink/40">
                    Coba lagi
                  </button>
                  <WaButton context="portfolio-error" message="Halo Gous Studio, boleh minta contoh portfolio?">
                    Minta contoh karya
                  </WaButton>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-ink/20 p-10 text-center">
                <p className="gs-display text-3xl font-bold text-ink">Belum ketemu.</p>
                <p className="mx-auto mt-2 max-w-[44ch] text-muted">
                  Tidak ada karya yang cocok dengan filter ini. Coba kata kunci lain, atau reset filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setParams(new URLSearchParams(), { replace: true });
                  }}
                  className="mt-6 h-11 rounded-full bg-ink px-6 font-semibold text-paper"
                >
                  Reset filter
                </button>
              </div>
            ) : (
              <>
                <Masonry
                  items={shown}
                  renderItem={(item, i) => (
                      <motion.li
                        key={item.id || `${item.title}-${i}`}
                        layout={reduce ? false : "position"}
                        initial={reduce ? false : { opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE, delay: Math.min(i % PAGE_SIZE, 8) * 0.04 }}
                        className="mb-6 break-inside-avoid sm:mb-8"
                      >
                        <WorkCard
                          item={item}
                          onOpen={() => setLightboxIndex(i)}
                          onError={() => handleImageError(item.id || item.title)}
                        />
                      </motion.li>
                  )}
                />

                <div className="mt-6 flex flex-col items-center gap-4">
                  <p className="text-sm text-muted">
                    Menampilkan <span className="font-semibold text-ink">{shown.length}</span> dari {filtered.length} karya
                  </p>
                  {shown.length < filtered.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                      className="h-12 rounded-full border border-ink/15 px-7 font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-ink/[0.03]"
                    >
                      Muat lebih banyak
                    </button>
                  )}
                </div>
              </>
            )}
          </Container>
        </section>

        <FinalCta />
      </div>

      <LandingFooter />
      <StickyCta />

      {lightboxIndex !== null && (
        <Lightbox
          items={shown}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(dir) => setLightboxIndex((p) => (p === null ? 0 : (p + dir + shown.length) % shown.length))}
        />
      )}
    </motion.div>
  );
};

export default PortfolioPage;
