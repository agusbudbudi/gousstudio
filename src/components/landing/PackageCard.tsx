import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Clock, RefreshCw } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { WaButton } from "./primitives";
import { formatRupiah, PackageItem } from "./useLandingData";

export const discountPercent = (pkg: PackageItem) =>
  pkg.retailPrice > pkg.finalPrice
    ? Math.round(((pkg.retailPrice - pkg.finalPrice) / pkg.retailPrice) * 100)
    : 0;

// CMS names sometimes embed a marker like "⭐BEST VALUE" / "🔥 BEST VALUE"; render it as a badge instead.
const BEST_VALUE_RE = /\s*[\p{Extended_Pictographic}\uFE0F]*\s*best\s*value\s*[\p{Extended_Pictographic}\uFE0F]*/giu;

export const parsePackageName = (name: string) => ({
  name: name.replace(BEST_VALUE_RE, " ").replace(/\s{2,}/g, " ").trim(),
  isBestValue: /best\s*value/i.test(name),
});

export const PackageCard: React.FC<{
  pkg: PackageItem;
  highlighted?: boolean;
  // Link to /pricelist/:slug; also shows the full deliverables list instead of the first 5.
  showDetailLink?: boolean;
}> = ({ pkg, highlighted = false, showDetailLink = false }) => {
  const { openOrderModal } = useAppStore();
  const discount = discountPercent(pkg);
  const { name, isBestValue } = parsePackageName(pkg.serviceName);
  const deliverables = showDetailLink ? pkg.deliverables.slice(0, 6) : pkg.deliverables.slice(0, 5);
  const hiddenCount = pkg.deliverables.length - deliverables.length;

  return (
    <article
      className={`relative flex h-full flex-col rounded-[24px] p-7 md:p-8 ${
        highlighted
          ? "bg-ink text-paper"
          : isBestValue
            ? "border-2 border-violet-500 bg-[#fff] text-ink"
            : "border border-ink/10 bg-[#fff] text-ink"
      }`}
    >
      {highlighted ? (
        <span className="gs-label absolute -top-3 right-6 rotate-[3deg] rounded-full bg-spark px-3 py-1.5 text-ink">
          Rekomendasi
        </span>
      ) : isBestValue ? (
        <span className="gs-label absolute -top-3 right-6 rotate-[3deg] rounded-full bg-violet-600 px-3 py-1.5 text-[#fff]">
          Best Value{discount > 0 ? ` · Hemat ${discount}%` : ""}
        </span>
      ) : (
        discount > 0 && (
          <span className="gs-label absolute -top-3 right-6 rotate-[3deg] rounded-full bg-spark px-3 py-1.5 text-ink">
            Hemat {discount}%
          </span>
        )
      )}
      <p className={`gs-label ${highlighted ? "text-violet-300" : "text-violet-600"}`}>{pkg.category}</p>
      <h3 className="mt-3 min-h-[2.5em] text-2xl font-bold leading-tight">{name}</h3>
      {showDetailLink && pkg.description && (
        <p className={`mt-2 line-clamp-2 text-[15px] leading-relaxed ${highlighted ? "text-paper/70" : "text-muted"}`}>
          {pkg.description}
        </p>
      )}

      <div className="mt-6">
        {discount > 0 && (
          <p className={`text-sm line-through ${highlighted ? "text-paper/50" : "text-muted"}`}>
            {formatRupiah(pkg.retailPrice)}
          </p>
        )}
        <p className="gs-display text-[40px] font-extrabold tabular-nums">{formatRupiah(pkg.finalPrice)}</p>
      </div>

      <div className={`mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm ${highlighted ? "text-paper/75" : "text-muted"}`}>
        {pkg.duration > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} /> {pkg.duration} hari kerja
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <RefreshCw size={15} /> {pkg.isRevisionUnlimited ? "Revisi unlimited" : `${pkg.totalRevision}× revisi`}
        </span>
      </div>

      <ul className={`mt-6 space-y-2.5 border-t pt-6 ${highlighted ? "border-paper/10" : "border-ink/10"}`}>
        {deliverables.map((d) => (
          <li key={d} className="flex gap-2.5 text-[15px]">
            <Check size={18} className={`mt-0.5 shrink-0 ${highlighted ? "text-violet-300" : "text-violet-600"}`} />
            <span>{d}</span>
          </li>
        ))}
        {showDetailLink && hiddenCount > 0 && (
          <li className={`pl-7 text-sm ${highlighted ? "text-paper/60" : "text-muted"}`}>+{hiddenCount} lainnya</li>
        )}
      </ul>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <WaButton
          context={`paket-${pkg.slug || pkg.serviceName}`}
          message={`Halo Gous Studio, saya mau order paket ${name} (${formatRupiah(pkg.finalPrice)}).`}
          variant={highlighted ? "light" : "primary"}
          className="w-full"
        >
          Pilih paket ini
        </WaButton>
        <div className={`flex items-center justify-center gap-4 text-sm font-semibold ${highlighted ? "text-paper/80" : "text-ink/70"}`}>
          <button type="button" onClick={() => openOrderModal(pkg)} className="h-11 underline-offset-4 hover:underline">
            Isi form order
          </button>
          {showDetailLink && pkg.slug && (
            <>
              <span aria-hidden className="opacity-30">·</span>
              <Link
                to={`/pricelist/${pkg.slug}`}
                className="inline-flex h-11 items-center gap-1 underline-offset-4 hover:underline"
                aria-label={`Lihat detail paket ${name}`}
              >
                Detail <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export const CustomProjectBanner: React.FC = () => (
  <div className="gs-grain relative grid gap-8 overflow-hidden rounded-[28px] bg-violet-950 p-8 text-paper md:grid-cols-12 md:items-center md:p-14">
    <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/40 blur-3xl" />
    <div className="relative md:col-span-8">
      <p className="gs-label text-violet-300">Custom Project</p>
      <h3 className="gs-display mt-4 text-[clamp(2rem,4vw,3.25rem)] font-extrabold">Kebutuhanmu nggak ada di paket?</h3>
      <p className="mt-4 max-w-[52ch] leading-relaxed text-paper/75">
        Kami bisa susun penawaran khusus untuk project spesifik atau kerja sama jangka panjang — disesuaikan
        dengan budget dan target bisnismu.
      </p>
    </div>
    <div className="relative md:col-span-4 md:justify-self-end">
      <WaButton
        context="custom"
        message="Halo Gous Studio, saya punya kebutuhan desain custom yang mau didiskusikan."
        variant="light"
        size="lg"
        className="w-full md:w-auto"
      >
        Diskusi Paket Custom
      </WaButton>
      <p className="mt-3 text-center text-sm text-paper/60 md:text-left">Respon cepat via WhatsApp</p>
    </div>
  </div>
);

export const TRUST_POINTS = [
  "Pembayaran QRIS, transfer bank, e-wallet",
  "Revisi sesuai paket",
  "File final siap pakai",
];
