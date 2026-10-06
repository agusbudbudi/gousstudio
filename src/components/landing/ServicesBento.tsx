import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SERVICES, ServiceCard, waLink } from "./content";
import { Container, Reveal, SectionHeader } from "./primitives";
import { formatRupiah, PackageItem, usePackages, usePortfolio, useServices, WorkItem } from "./useLandingData";

const cheapest = (packages: PackageItem[]) => {
  const prices = packages.map((p) => p.finalPrice).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : null;
};

// The featured tile skips the first work so it doesn't repeat the hero image.
const pickImage = (works: WorkItem[], featured: boolean) => (featured ? works[1] ?? works[0] : works[0]);

const NUMBER_WORDS = ["Nol", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"];

// Rows of three (span 4); a lone leftover tile is avoided by turning the last four into 2+2 (span 6).
const rowSizes = (n: number): number[] => {
  if (n <= 0) return [];
  if (n % 3 === 1 && n >= 4) return [...Array((n - 4) / 3).fill(3), 2, 2];
  if (n % 3 === 1) return [1];
  return [...Array(Math.floor(n / 3)).fill(3), ...(n % 3 ? [n % 3] : [])];
};
const ROW_SPAN: Record<number, string> = { 1: "md:col-span-12", 2: "md:col-span-6", 3: "md:col-span-4" };

/**
 * Bento spans for any number of services: one featured tile, two medium tiles, then even rows
 * for the rest plus the Pricelist CTA, so the grid never ends ragged.
 */
const layoutFor = (count: number): { tiles: string[]; cta: string } => {
  if (count === 1) return { tiles: ["md:col-span-7"], cta: "md:col-span-5" };
  if (count === 2) return { tiles: ["md:col-span-6", "md:col-span-6"], cta: "md:col-span-12" };
  const head = ["md:col-span-7 md:row-span-2", "md:col-span-5", "md:col-span-5"];
  const spans = rowSizes(count - 3 + 1).flatMap((size) => Array(size).fill(ROW_SPAN[size]) as string[]);
  return { tiles: [...head, ...spans.slice(0, -1)], cta: spans[spans.length - 1] };
};

const ServiceTile: React.FC<{
  service: ServiceCard;
  index: number;
  price: number | null;
  image?: WorkItem;
  featured?: boolean;
}> = ({ service, index, price, image, featured }) => {
  const preview = (
    <div
      className={`relative overflow-hidden rounded-2xl bg-paper-200 ${
        featured ? "mt-8 min-h-[220px] flex-1" : "h-full min-h-[136px]"
      }`}
    >
      {image ? (
        <img
          src={image.src}
          alt={`Contoh ${service.title} oleh Gous Studio`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <span aria-hidden className="gs-display absolute inset-0 flex items-center justify-center px-4 text-center text-[22px] font-extrabold text-ink/10">
          {service.title}
        </span>
      )}
    </div>
  );

  const priceBlock = (
    <div>
      <p className="text-[13px] text-muted">{price ? "Mulai dari" : "Harga"}</p>
      <p className="text-lg font-bold text-ink">{price ? formatRupiah(price) : "Sesuai kebutuhan"}</p>
    </div>
  );

  const cta = (
    <a
      href={waLink(`Halo Gous Studio, saya tertarik dengan layanan ${service.title}. Boleh minta info?`, `layanan-${service.id}`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Tanya layanan ${service.title} via WhatsApp`}
      className={`inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-ink/15 text-sm font-semibold text-ink transition-colors hover:border-violet-600 hover:bg-violet-600 hover:text-[#fff] ${
        featured ? "px-4" : "w-full px-3"
      }`}
    >
      {/* Compact tiles only have half a row for the button */}
      {featured ? "Tanya layanan ini" : "Tanya"}
      <ArrowUpRight size={16} className="shrink-0" />
    </a>
  );

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-ink/10 bg-[#fff] p-6 transition-colors duration-300 hover:border-violet-300 md:p-8 ${
        featured ? "md:min-h-[560px]" : ""
      }`}
    >
      <span className="gs-label text-violet-600">{String(index + 1).padStart(2, "0")}</span>

      <h3 className={`gs-display mt-3 font-bold text-ink ${featured ? "text-[clamp(1.875rem,3.4vw,2.75rem)]" : "text-2xl md:text-[28px]"}`}>
        {service.title}
      </h3>
      <p className="mt-3 max-w-[44ch] leading-relaxed text-muted">{service.description}</p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {service.deliverables.map((d) => (
          <li key={d} className="rounded-full bg-paper-200 px-3 py-1.5 text-[13px] font-medium text-ink/80">
            {d}
          </li>
        ))}
      </ul>

      {featured ? (
        <>
          {preview}
          <div className="flex flex-wrap items-end justify-between gap-4 pt-8">
            {priceBlock}
            {cta}
          </div>
        </>
      ) : (
        <>
          {/* Flexible spacer (min 2rem) pushes the bottom row down so it lines up across a grid row */}
          <div aria-hidden className="min-h-8 flex-1" />
          {/* Preview on the left, price + CTA on the right (preview matches their height). Two columns only
              when the tile is wide enough: full-width on phones, and from xl; stacked on tablet/small laptop
              (preview first, so the CTA stays at the bottom). */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
            {preview}
            <div className="flex min-w-0 flex-col justify-between gap-4">
              {priceBlock}
              {cta}
            </div>
          </div>
        </>
      )}
    </article>
  );
};

const ServicesBento: React.FC = () => {
  const { data: packages = [] } = usePackages();
  const { data: works = [] } = usePortfolio();
  const { data: servicesData } = useServices();

  const tiles = useMemo(() => {
    // CMS-managed services: price and thumbnail come from the packages linked to each service
    if (servicesData && servicesData.services.length > 0) {
      const { services } = servicesData;
      return services.map((svc, i) => {
        const service: ServiceCard = {
          id: svc.slug,
          title: svc.title,
          description: svc.description,
          deliverables: svc.deliverables,
        };
        const serviceWorks = works.filter((w) => w.service_id === svc.id);
        return {
          service,
          price: cheapest(packages.filter((p) => p.service?.id === svc.id)),
          image: pickImage(serviceWorks, i === 0),
        };
      });
    }
    // Static copy while services load (or if the request fails): text only, no price or image
    return SERVICES.map((service) => ({ service, price: null, image: undefined as WorkItem | undefined }));
  }, [servicesData, packages, works]);

  const layout = layoutFor(tiles.length);

  return (
    <section id="layanan" aria-labelledby="layanan-title" className="scroll-mt-20 bg-paper-200/60 py-20 md:py-32">
      <Container>
        <SectionHeader
          id="layanan-title"
          index="02"
          eyebrow="Services"
          title="Semua yang brand kamu butuhkan untuk tampil serius."
          description={`${NUMBER_WORDS[tiles.length] ?? tiles.length} layanan inti, satu standar kualitas. Pilih yang kamu butuhkan sekarang, kembangkan nanti.`}
        />

        <div className="mt-14 grid gap-4 md:grid-cols-12 md:gap-5">
          {tiles.map(({ service, price, image }, i) => (
            <Reveal key={service.id} className={layout.tiles[i]} delay={(i % 3) * 0.06}>
              <ServiceTile service={service} index={i} price={price} image={image} featured={i === 0} />
            </Reveal>
          ))}

          <Reveal className={layout.cta} delay={0.12}>
            <Link
              to="/pricelist"
              className="group flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-[24px] bg-violet-600 p-6 text-[#fff] transition-colors hover:bg-violet-700 md:p-8"
            >
              <span className="gs-label text-violet-200">Pricelist</span>
              <div>
                <p className="gs-display text-[28px] font-bold leading-tight">
                  Butuh rincian paket & harga lengkap?
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-semibold">
                  Lihat semua harga
                  <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};

export default ServicesBento;
