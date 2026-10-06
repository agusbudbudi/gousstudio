import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CustomProjectBanner, PackageCard, TRUST_POINTS } from "./PackageCard";
import { Container, Reveal, SectionHeader, Skeleton, WaButton } from "./primitives";
import { usePackages } from "./useLandingData";

const PricingSection: React.FC = () => {
  const { data: packages = [], isLoading, isError } = usePackages();

  const cheapest = useMemo(
    () => [...packages].sort((a, b) => a.finalPrice - b.finalPrice).slice(0, 3),
    [packages],
  );

  return (
    <section id="harga" aria-labelledby="harga-title" className="scroll-mt-20 bg-paper-200/60 py-20 md:py-32">
      <Container>
        <SectionHeader
          id="harga-title"
          index="06"
          eyebrow="Paket Hemat"
          title="Mulai branding tanpa bikin kantong bolong."
          description="Paket ringkas dengan kualitas studio, dirancang untuk UMKM dan personal brand yang baru mulai."
          action={
            <Link to="/pricelist" className="group inline-flex items-center gap-1.5 font-semibold text-ink underline-offset-4 hover:underline">
              Lihat semua harga
              <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          }
        />

        {!isLoading && (isError || cheapest.length === 0) && (
          <div className="mt-14 flex flex-col items-start gap-4 rounded-[24px] border border-dashed border-ink/20 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <p className="max-w-[52ch] text-muted">
              Daftar paket sedang diperbarui. Tanyakan harga terbaru — kami kirim pricelist lengkap lewat WhatsApp.
            </p>
            <WaButton context="harga-error" message="Halo Gous Studio, boleh minta pricelist terbaru?">
              Minta pricelist
            </WaButton>
          </div>
        )}

        <div className="mt-14 grid gap-5 md:grid-cols-3 empty:hidden">
          {isLoading
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[520px]" />)
            : cheapest.map((pkg, i) => (
                <Reveal key={pkg.slug || pkg.serviceName} delay={i * 0.06} className={i === 1 ? "order-first md:order-none" : ""}>
                  <PackageCard pkg={pkg} highlighted={i === 1} />
                </Reveal>
              ))}
        </div>

        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {TRUST_POINTS.map((t) => (
            <span key={t}>✓ {t}</span>
          ))}
        </p>

        <Reveal className="mt-16">
          <CustomProjectBanner />
        </Reveal>
      </Container>
    </section>
  );
};

export default PricingSection;
