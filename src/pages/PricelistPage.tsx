import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import FinalCta from "../components/landing/FinalCta";
import FaqSection from "../components/landing/FaqSection";
import StickyCta from "../components/landing/StickyCta";
import { Container, EASE, Eyebrow, Reveal, Skeleton, WaButton } from "../components/landing/primitives";
import { CustomProjectBanner, PackageCard, TRUST_POINTS } from "../components/landing/PackageCard";
import { formatRupiah, PackageItem, usePackages } from "../components/landing/useLandingData";

const TITLE = "Harga Jasa Desain Logo, Branding & Social Media | Gous Studio";
const DESCRIPTION =
  "Pricelist Gous Studio: paket desain logo, brand identity, social media, poster, dan materi digital. Harga transparan, revisi jelas, konsultasi gratis via WhatsApp.";

const GRID = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

// Links shared before packages were grouped by service used the old pricelist category names.
const LEGACY_CATEGORY_TO_SERVICE: Record<string, string> = {
  "Social Media": "social-media",
  "Print & Digital": "poster",
  "Brand Identity": "brand-identity",
  Management: "social-media-management",
  Other: "lainnya",
};

const CardGrid: React.FC<{ items: PackageItem[] }> = ({ items }) => (
  <ul className={GRID}>
    {items.map((pkg, i) => (
      <Reveal as="li" key={pkg.slug || pkg.serviceName} delay={(i % 3) * 0.06}>
        <PackageCard pkg={pkg} showDetailLink />
      </Reveal>
    ))}
  </ul>
);

const PricelistPage = () => {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const { data: packages = [], isLoading, isError, refetch } = usePackages();
  const [query, setQuery] = useState("");
  const rawCategory = params.get("cat") || "all";
  // ?cat= holds a service slug; old category names are mapped to their service
  const category = LEGACY_CATEGORY_TO_SERVICE[rawCategory] ?? rawCategory;

  const setCategory = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("cat");
    else next.set("cat", value);
    setParams(next, { replace: true });
  };

  // One tab per service that has public packages, in CMS service order (packages arrive pre-sorted).
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; label: string; count: number }>();
    packages.forEach((p) => {
      const entry = map.get(p.categorySlug) ?? { id: p.categorySlug, label: p.category, count: 0 };
      entry.count += 1;
      map.set(p.categorySlug, entry);
    });
    return Array.from(map.values());
  }, [packages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter((p) => {
      if (category !== "all" && p.categorySlug !== category) return false;
      if (!q) return true;
      return [p.serviceName, p.description, p.category, ...p.deliverables].some((v) => v?.toLowerCase().includes(q));
    });
  }, [packages, category, query]);

  const grouped = category === "all" && !query.trim();
  const paidPrices = packages.map((p) => p.finalPrice).filter((n) => n > 0);
  const lowest = paidPrices.length ? Math.min(...paidPrices) : 0;

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: "Pricelist Gous Studio",
      itemListElement: packages.map((p) => ({
        "@type": "Offer",
        name: p.serviceName,
        category: p.category,
        price: p.finalPrice,
        priceCurrency: "IDR",
        url: p.slug ? `https://gousstudio.com/pricelist/${p.slug}` : undefined,
        seller: { "@type": "Organization", name: "Gous Studio" },
      })),
    }),
    [packages],
  );

  const resetFilters = () => {
    setQuery("");
    setParams(new URLSearchParams(), { replace: true });
  };

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
        <link rel="canonical" href="https://gousstudio.com/pricelist" />
        <meta name="theme-color" content="#f7f6f2" />
        {packages.length > 0 && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
      </Helmet>

      <LandingNavbar />

      <div id="main" tabIndex={-1} className="outline-none">
        {/* Header (compact — see DESIGN.md §2.4) */}
        <section id="top" aria-labelledby="pricelist-title" className="gs-grain relative pb-10 pt-24 md:pb-12 md:pt-32">
          <Container>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink">
              <ArrowLeft size={16} /> Beranda
            </Link>
            <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-8">
                <Eyebrow index="01" className="text-muted">Pricelist</Eyebrow>
                <h1 id="pricelist-title" className="gs-display mt-5 text-[clamp(2.75rem,8vw,6.25rem)] font-extrabold text-ink">
                  {["Harga jelas,", "kualitas studio."].map((line, i) => (
                    <span key={line} className="block overflow-hidden pb-[0.06em]">
                      <motion.span
                        className="block"
                        initial={reduce ? false : { y: "105%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.05 + i * 0.09 }}
                      >
                        {i === 1 ? (
                          <>
                            kualitas <span className="text-violet-600">studio.</span>
                          </>
                        ) : (
                          line
                        )}
                      </motion.span>
                    </span>
                  ))}
                </h1>
              </div>
              <div className="md:col-span-4">
                <p className="max-w-[40ch] text-[17px] leading-relaxed text-muted">
                  Semua paket tercantum transparan — durasi, jumlah revisi, dan file yang kamu terima. Pilih
                  yang pas, atau minta penawaran custom.
                </p>
                <p className="mt-4 text-sm text-ink">
                  {isLoading ? (
                    "…"
                  ) : (
                    <>
                      <span className="font-semibold">{packages.length}</span> paket
                      {lowest > 0 && (
                        <>
                          {" "}· mulai <span className="font-semibold">{formatRupiah(lowest)}</span>
                        </>
                      )}
                    </>
                  )}
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
                {[{ id: "all", label: "Semua", count: packages.length }, ...categories].map((c) => {
                  const active = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setCategory(c.id)}
                      className={`relative h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${active ? "text-paper" : "text-ink/70 hover:text-ink"}`}
                    >
                      {active && (
                        <motion.span layoutId="gs-pricelist-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                      )}
                      <span className="relative">
                        {c.label}
                        {!isLoading && <span className={`ml-1.5 tabular-nums ${active ? "text-paper/60" : "text-muted"}`}>{c.count}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            <label className="relative block md:w-72">
              <span className="sr-only">Cari paket</span>
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari logo, feed, poster…"
                className="h-10 w-full rounded-full border border-ink/15 bg-[#fff] pl-10 pr-10 text-sm text-ink placeholder:text-muted focus:border-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-600/10"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                  <X size={16} />
                </button>
              )}
            </label>
          </Container>
        </div>

        {/* Packages */}
        <section aria-label="Daftar paket" className="py-12 md:py-16">
          <Container>
            {isLoading ? (
              <div className={GRID}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-[560px]" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-start gap-4 rounded-[24px] border border-dashed border-ink/20 p-8 md:flex-row md:items-center md:justify-between md:p-10">
                <p className="max-w-[52ch] text-muted">
                  Daftar paket sedang tidak bisa dimuat. Coba lagi, atau minta pricelist terbaru lewat WhatsApp.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => refetch()} className="h-12 rounded-full border border-ink/15 px-6 font-semibold text-ink hover:border-ink/40">
                    Coba lagi
                  </button>
                  <WaButton context="pricelist-error" message="Halo Gous Studio, boleh minta pricelist terbaru?">
                    Minta pricelist
                  </WaButton>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-ink/20 p-10 text-center">
                <p className="gs-display text-3xl font-bold text-ink">Paket belum ketemu.</p>
                <p className="mx-auto mt-2 max-w-[46ch] text-muted">
                  Tidak ada paket yang cocok dengan pencarianmu. Reset filter, atau ceritakan kebutuhanmu — kami
                  buatkan penawaran custom.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={resetFilters} className="h-12 rounded-full bg-ink px-6 font-semibold text-paper">
                    Reset filter
                  </button>
                  <WaButton context="pricelist-empty" variant="outline" message={`Halo Gous Studio, saya cari paket untuk: ${query}`}>
                    Tanya paket custom
                  </WaButton>
                </div>
              </div>
            ) : grouped ? (
              <div className="space-y-20 md:space-y-24">
                {categories.map((c, i) => (
                  <section key={c.id} aria-labelledby={`cat-${i}`}>
                    <Reveal className="mb-8 flex items-end justify-between gap-6 border-b border-ink/10 pb-5">
                      <h2 id={`cat-${i}`} className="gs-display text-[clamp(1.875rem,4vw,3rem)] font-extrabold text-ink">
                        {c.label}
                      </h2>
                      <span className="gs-label shrink-0 pb-2 text-muted">
                        {String(i + 1).padStart(2, "0")} · {c.count} paket
                      </span>
                    </Reveal>
                    <CardGrid items={filtered.filter((p) => p.categorySlug === c.id)} />
                  </section>
                ))}
              </div>
            ) : (
              <CardGrid items={filtered} />
            )}

            {!isLoading && !isError && (
              <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                {TRUST_POINTS.map((t) => (
                  <span key={t}>✓ {t}</span>
                ))}
              </p>
            )}

            <Reveal className="mt-16">
              <CustomProjectBanner />
            </Reveal>
          </Container>
        </section>

        <FaqSection index="02" />
        <FinalCta />
      </div>

      <LandingFooter />
      <StickyCta />
    </motion.div>
  );
};

export default PricelistPage;
