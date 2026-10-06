import React, { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Check, ChevronRight, Clock, FileCheck2, MessageSquare, Plus, RefreshCw, Star, Zap } from "lucide-react";
import Lightbox from "../ui/Lightbox";
import { useAppStore } from "../store/useAppStore";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import FinalCta from "../components/landing/FinalCta";
import StickyCta from "../components/landing/StickyCta";
import { Container, EASE, Eyebrow, Reveal, SectionHeader, Skeleton, WaButton, WorkImage } from "../components/landing/primitives";
import { CustomProjectBanner, discountPercent, PackageCard, parsePackageName, TRUST_POINTS } from "../components/landing/PackageCard";
import { formatRupiah, PackageItem, usePackageDetail, usePackages, usePortfolio, WorkItem, workGroup } from "../components/landing/useLandingData";
import { ORDER_STEPS, waLink } from "../components/landing/content";
import { EditorialState } from "../components/landing/clientPage";

const packageFaqs = (pkg: PackageItem) => [
  {
    q: "Berapa lama proses pengerjaannya?",
    a: `Paket ini dikerjakan dalam ${pkg.duration || "beberapa"} hari kerja setelah brief lengkap dan DP diterima.`,
  },
  {
    q: "Berapa kali revisi yang saya dapat?",
    a: pkg.isRevisionUnlimited
      ? "Paket ini sudah termasuk revisi unlimited sampai desainnya pas."
      : `Paket ini mencakup ${pkg.totalRevision}× revisi. Revisi tambahan bisa didiskusikan dengan biaya terpisah.`,
  },
  {
    q: "Bagaimana sistem pembayarannya?",
    a: "DP 50% di awal untuk masuk antrean, pelunasan sebelum file final dikirim. Bisa via QRIS, transfer bank, atau e-wallet.",
  },
  {
    q: "Apakah desainnya orisinal?",
    a: "Ya. Setiap desain dibuat dari nol sesuai karakter brand-mu, bukan template jadi.",
  },
];

const GUARANTEES = [
  { icon: Zap, title: "Original Design" },
  { icon: Clock, title: "On-Time" },
  { icon: Star, title: "High Quality" },
  { icon: MessageSquare, title: "Expert Support" },
];

const GuaranteeCard: React.FC = () => (
  <section aria-labelledby="guarantee-title" className="rounded-[24px] border border-violet-200 bg-violet-50 p-6 md:p-7">
    <div className="flex items-center gap-3">
      <img src="/img/guarantee-icon.png" alt="" className="h-10 w-10 shrink-0 object-contain" />
      <div>
        <h2 id="guarantee-title" className="gs-label text-violet-800">Gous Guarantee</h2>
        <p className="mt-1 text-sm text-ink/70">Jaminan desain orisinal & layanan kualitas premium.</p>
      </div>
    </div>
    <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-violet-200 pt-5 xl:grid-cols-4">
      {GUARANTEES.map(({ icon: Icon, title }) => (
        <li key={title} className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <Icon size={16} className="shrink-0 text-violet-600" />
          {title}
        </li>
      ))}
    </ul>
  </section>
);

const OrderCard: React.FC<{ pkg: PackageItem; name: string }> = ({ pkg, name }) => {
  const { openOrderModal } = useAppStore();
  const discount = discountPercent(pkg);

  return (
    <div className="rounded-[28px] border border-ink/10 bg-[#fff] p-7 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <p className="gs-label text-muted">Harga paket</p>
        {discount > 0 && (
          <span className="gs-label rotate-[3deg] rounded-full bg-spark px-3 py-1.5 text-ink">Hemat {discount}%</span>
        )}
      </div>
      {discount > 0 && <p className="mt-3 text-sm text-muted line-through">{formatRupiah(pkg.retailPrice)}</p>}
      <p className="gs-display mt-1 text-[clamp(2.5rem,4vw,3.25rem)] font-extrabold tabular-nums text-ink">
        {formatRupiah(pkg.finalPrice)}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-ink/10">
        <div className="bg-paper p-4">
          <dt className="gs-label flex items-center gap-1.5 text-muted">
            <Clock size={13} /> Durasi
          </dt>
          <dd className="mt-1.5 font-semibold text-ink">{pkg.duration > 0 ? `${pkg.duration} hari kerja` : "Sesuai brief"}</dd>
        </div>
        <div className="bg-paper p-4">
          <dt className="gs-label flex items-center gap-1.5 text-muted">
            <RefreshCw size={13} /> Revisi
          </dt>
          <dd className="mt-1.5 font-semibold text-ink">{pkg.isRevisionUnlimited ? "Unlimited" : `${pkg.totalRevision}× revisi`}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2">
        <WaButton
          context={`detail-${pkg.slug}`}
          message={`Halo Gous Studio, saya mau order paket ${name} (${formatRupiah(pkg.finalPrice)}).`}
          size="lg"
          className="w-full"
        >
          Pesan via WhatsApp
        </WaButton>
        <button
          type="button"
          onClick={() => openOrderModal(pkg)}
          className="h-12 rounded-full border border-ink/15 font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-ink/[0.03]"
        >
          Isi form order
        </button>
      </div>
      <p className="mt-3 text-center text-sm text-muted">Dibalas &lt; 24 jam · Konsultasi gratis</p>

      <ul className="mt-6 space-y-2 border-t border-ink/10 pt-6 text-sm text-ink/80">
        {TRUST_POINTS.map((t) => (
          <li key={t} className="flex gap-2">
            <Check size={16} className="mt-0.5 shrink-0 text-violet-600" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
};

const PricelistDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const reduce = useReducedMotion();
  const { data, isLoading, isError, refetch } = usePackageDetail(slug);
  const { data: allPackages = [] } = usePackages();
  const { data: allWorks = [] } = usePortfolio(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const pkg = data?.pkg ?? null;
  const parsed = pkg ? parsePackageName(pkg.serviceName) : null;

  // Linked works first; otherwise fall back to works from other packages of the same service.
  const { works, isSimilar } = useMemo((): { works: WorkItem[]; isSimilar: boolean } => {
    if (!pkg) return { works: [], isSimilar: false };
    if (data && data.works.length > 0) return { works: data.works, isSimilar: false };
    if (!pkg.service) return { works: [], isSimilar: true };
    const serviceId = pkg.service.id;
    return { works: allWorks.filter((w) => w.service_id === serviceId).slice(0, 8), isSimilar: true };
  }, [pkg, data, allWorks]);

  const [failedWorkIds, setFailedWorkIds] = useState<Set<string | number>>(() => new Set());

  const handleWorkError = useCallback((id: string | number) => {
    setFailedWorkIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const visibleWorks = useMemo(() => {
    return works.filter((w) => Boolean(w.src) && !failedWorkIds.has(w.id || w.title));
  }, [works, failedWorkIds]);

  // Other public packages of the same service (or of "Lainnya")
  const related = useMemo(
    () => (pkg ? allPackages.filter((p) => p.categorySlug === pkg.categorySlug && p.slug !== pkg.slug).slice(0, 3) : []),
    [allPackages, pkg],
  );

  const shell = (children: React.ReactNode) => (
    <motion.div className="gs min-h-[100dvh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <LandingNavbar />
      <div id="main" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <LandingFooter />
      <StickyCta />
    </motion.div>
  );

  if (isLoading) {
    return shell(
      <Container className="grid gap-10 pb-20 pt-24 md:pt-32 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-[520px] lg:col-span-5" />
      </Container>,
    );
  }

  if (!isError && (!pkg || !parsed)) {
    return shell(
      <Container className="pb-24 pt-24 md:pt-32">
        <EditorialState
          code="404"
          eyebrow="Pricelist"
          title="Paket tidak ditemukan."
          action={{ to: "/pricelist", label: "Lihat semua paket" }}
        >
          Paket ini mungkin sudah tidak tersedia atau link-nya berubah. Lihat daftar paket terbaru di pricelist.
        </EditorialState>
      </Container>,
    );
  }

  if (isError || !pkg || !parsed) {
    return shell(
      <section id="top" className="pb-24 pt-24 md:pt-32">
        <Container>
          <Eyebrow className="text-muted">Pricelist</Eyebrow>
          <h1 className="gs-display mt-5 max-w-[16ch] text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold text-ink">
            {isError ? "Paket gagal dimuat." : "Paket tidak ditemukan."}
          </h1>
          <p className="mt-5 max-w-[48ch] text-muted">
            {isError
              ? "Koneksi ke server sedang bermasalah. Coba lagi, atau tanyakan paketnya langsung lewat WhatsApp."
              : "Paket ini mungkin sudah tidak tersedia atau link-nya berubah. Lihat daftar paket terbaru di pricelist."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {isError ? (
              <button type="button" onClick={() => refetch()} className="h-12 rounded-full bg-ink px-6 font-semibold text-paper">
                Coba lagi
              </button>
            ) : (
              <Link to="/pricelist" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper">
                <ArrowLeft size={18} /> Lihat semua paket
              </Link>
            )}
            <WaButton context="detail-not-found" variant="outline" message="Halo Gous Studio, saya mau tanya soal paket desain.">
              Tanya via WhatsApp
            </WaButton>
          </div>
        </Container>
      </section>,
    );
  }

  const title = `${parsed.name} — ${formatRupiah(pkg.finalPrice)} | Gous Studio`;
  const description =
    pkg.description ||
    `Paket ${parsed.name} dari Gous Studio: ${pkg.deliverables.slice(0, 3).join(", ")}. Konsultasi gratis via WhatsApp.`;
  const faqs = packageFaqs(pkg);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: parsed.name,
    description,
    category: pkg.category,
    provider: { "@type": "Organization", name: "Gous Studio", url: "https://gousstudio.com" },
    areaServed: "Indonesia",
    offers: {
      "@type": "Offer",
      price: pkg.finalPrice,
      priceCurrency: "IDR",
      url: `https://gousstudio.com/pricelist/${pkg.slug}`,
    },
  };

  return shell(
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <link rel="canonical" href={`https://gousstudio.com/pricelist/${pkg.slug}`} />
        <meta name="theme-color" content="#f7f6f2" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Header + order card (compact header spacing — DESIGN.md §2.4) */}
      <section id="top" aria-labelledby="pkg-title" className="gs-grain relative pb-16 pt-24 md:pb-24 md:pt-32">
        <Container>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <li>
                <Link to="/pricelist" className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-ink">
                  <ArrowLeft size={16} /> Pricelist
                </Link>
              </li>
              <li aria-hidden><ChevronRight size={14} /></li>
              <li>
                <Link to={`/pricelist?cat=${encodeURIComponent(pkg.categorySlug)}`} className="transition-colors hover:text-ink">
                  {pkg.category}
                </Link>
              </li>
              <li aria-hidden><ChevronRight size={14} /></li>
              <li aria-current="page" className="truncate text-ink">{parsed.name}</li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-10">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <Eyebrow className="text-violet-600">{pkg.category}</Eyebrow>
                {parsed.isBestValue && (
                  <span className="gs-label rounded-full bg-violet-600 px-3 py-1.5 text-[#fff]">Best Value</span>
                )}
              </div>
              <h1 id="pkg-title" className="gs-display mt-5 text-[clamp(2.5rem,6.5vw,5rem)] font-extrabold text-ink">
                <span className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
                  >
                    {parsed.name}
                  </motion.span>
                </span>
              </h1>
              {pkg.description && <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">{pkg.description}</p>}

              <div className="mt-10 border-t border-ink/10 pt-8">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
                  <FileCheck2 size={20} className="text-violet-600" /> Yang kamu dapat
                </h2>
                <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {pkg.deliverables.map((d) => (
                    <li key={d} className="flex gap-3 border-b border-ink/5 pb-3 text-[15px] text-ink/85">
                      <Check size={18} className="mt-0.5 shrink-0 text-violet-600" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Desktop: right column spanning both rows. Mobile DOM order: details → order card → guarantee. */}
            <aside aria-label="Order paket" className="lg:col-span-5 lg:row-span-2 lg:self-stretch">
              <div className="lg:sticky lg:top-28">
                <OrderCard pkg={pkg} name={parsed.name} />
                <p className="mt-4 text-center text-sm text-muted">
                  Butuh penyesuaian?{" "}
                  <a
                    href={waLink(`Halo Gous Studio, saya tertarik paket ${parsed.name} tapi butuh penyesuaian.`, `detail-custom-${pkg.slug}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink underline underline-offset-4"
                  >
                    Minta versi custom
                  </a>
                </p>
              </div>
            </aside>

            <div className="lg:col-span-7 lg:-mt-2">
              <GuaranteeCard />
            </div>
          </div>
        </Container>
      </section>

      {/* Work examples */}
      {visibleWorks.length > 0 && (
        <section aria-labelledby="works-title" className="border-t border-ink/10 py-20 md:py-28">
          <Container>
            <SectionHeader
              id="works-title"
              index="01"
              eyebrow={isSimilar ? "Karya serupa" : "Contoh hasil"}
              title={isSimilar ? "Contoh karya untuk layanan sejenis." : "Hasil nyata dari paket ini."}
              action={
                <Link
                  to={pkg.service ? `/portfolio?cat=${pkg.service.slug}` : "/portfolio"}
                  className="group inline-flex items-center gap-1.5 font-semibold text-ink underline-offset-4 hover:underline"
                >
                  Lihat portfolio lengkap
                  <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              }
            />
            <ul className={`mt-12 grid grid-cols-2 gap-x-5 gap-y-8 ${visibleWorks.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {visibleWorks.map((w, i) => (
                <Reveal as="li" key={w.id || i} delay={(i % 4) * 0.05}>
                  <button type="button" onClick={() => setLightboxIndex(i)} className="group block w-full text-left" aria-label={`Lihat ${w.title}`}>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-paper-200">
                      <WorkImage
                        src={w.src}
                        alt={w.imgAlt || `${w.title} oleh Gous Studio`}
                        fallbackLabel={w.title}
                        onError={() => handleWorkError(w.id || w.title)}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                        placeholderClassName="absolute inset-0"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{w.title}</p>
                      <span className="gs-label hidden shrink-0 text-muted sm:inline">{workGroup(w).title}</span>
                    </div>
                  </button>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* How to order */}
      <section aria-labelledby="order-title" className="gs-dark gs-grain relative overflow-hidden bg-ink py-20 text-paper md:py-28">
        <Container>
          <SectionHeader
            id="order-title"
            dark
            index={visibleWorks.length > 0 ? "02" : "01"}
            eyebrow="Cara order"
            title={
              <>
                Lima langkah, <span className="text-violet-400">tanpa ribet.</span>
              </>
            }
          />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[24px] bg-paper/10 sm:grid-cols-2 lg:grid-cols-5">
            {ORDER_STEPS.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.05} className="bg-ink p-6 md:p-7">
                <span className="gs-label text-violet-400">Step {String(i + 1).padStart(2, "0")}</span>
                <h3 className="gs-display mt-4 text-2xl font-bold">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-paper/65">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Related packages */}
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="py-20 md:py-28">
          <Container>
            <SectionHeader
              id="related-title"
              index={works.length > 0 ? "03" : "02"}
              eyebrow="Bandingkan"
              title={`Paket ${pkg.category} lainnya.`}
              action={
                <Link
                  to={`/pricelist?cat=${encodeURIComponent(pkg.categorySlug)}`}
                  className="group inline-flex items-center gap-1.5 font-semibold text-ink underline-offset-4 hover:underline"
                >
                  Lihat semua paket
                  <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              }
            />
            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={i * 0.06}>
                  <PackageCard pkg={p} showDetailLink />
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Package FAQ */}
      <section aria-labelledby="pkg-faq-title" className="border-t border-ink/10 py-20 md:py-28">
        <Container className="grid gap-12 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-4">
            <Eyebrow className="text-muted">FAQ paket</Eyebrow>
            <h2 id="pkg-faq-title" className="gs-display mt-5 text-[clamp(2rem,4vw,3rem)] font-extrabold text-ink">
              Sebelum kamu order.
            </h2>
          </Reveal>
          <div className="md:col-span-8">
            {faqs.map((f, i) => (
              <details key={f.q} className="group border-b border-ink/10 [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6">
                  <span className="text-lg font-semibold text-ink">{f.q}</span>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-transform duration-300 group-open:rotate-45 group-open:border-violet-600 group-open:bg-violet-600 group-open:text-[#fff]">
                    <Plus size={16} />
                  </span>
                </summary>
                <p className="-mt-2 max-w-[60ch] pb-7 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container>
          <Reveal>
            <CustomProjectBanner />
          </Reveal>
        </Container>
      </section>

      <FinalCta />

      {lightboxIndex !== null && (
        <Lightbox
          items={visibleWorks}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(dir) => setLightboxIndex((p) => (p === null ? 0 : (p + dir + visibleWorks.length) % visibleWorks.length))}
        />
      )}
    </>,
  );
};

export default PricelistDetailPage;
