import React from "react";
import { ArrowUpRight, Star, ThumbsUp } from "lucide-react";
import { CONFIG } from "../../config/constants";
import { Container, Reveal, Skeleton } from "./primitives";
import { useFastwork } from "./useLandingData";

const FastworkStrip: React.FC = () => {
  const { data: items = [], isLoading, isError } = useFastwork();
  const ratings = items.map((i) => Number(i.rating)).filter((r) => r > 0);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const href = items[0]?.url || CONFIG.FASTWORK_URL;

  return (
    <section aria-label="Order via Fastwork" className="pb-20 md:pb-28">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 rounded-[24px] border border-ink/10 bg-[#fff] p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <img src="/img/fastwork-logo.png" alt="Fastwork" className="h-10 w-auto shrink-0 object-contain md:h-12" loading="lazy" />
              <div>
                <p className="text-lg font-semibold text-ink">Lebih nyaman order lewat platform?</p>
                <p className="mt-1 text-muted">
                  Gous Studio juga ada di Fastwork — lengkap dengan rating klien dan pembayaran aman.
                  {avg && (
                    <span className="ml-2 inline-flex items-center gap-1 font-semibold text-ink">
                      <Star size={14} className="fill-spark text-spark" />
                      {avg.toFixed(1)} rata-rata rating
                    </span>
                  )}
                </p>
              </div>
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-ink/15 px-6 font-semibold text-ink transition-colors hover:border-ink/40"
            >
              Order via Fastwork
              <ArrowUpRight size={18} />
            </a>
          </div>
        </Reveal>

        {!isError && (isLoading || items.length > 0) && (
          <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <li key={i}>
                    <Skeleton className="aspect-video w-full" />
                    <Skeleton className="mt-4 h-5 w-3/4" />
                  </li>
                ))
              : items.map((item, i) => (
                  <Reveal as="li" key={item.id || item.url} delay={(i % 4) * 0.06}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full flex-col"
                    >
                      <div className="relative isolate aspect-video w-full overflow-hidden rounded-[20px] bg-paper-200 [transform:translateZ(0)]">
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:scale] [backface-visibility:hidden] group-hover:scale-[1.03]"
                        />
                        <span className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-paper text-ink opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <ArrowUpRight size={20} />
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 font-semibold text-ink">
                          <Star size={14} className="fill-spark text-spark" />
                          {Number(item.rating || 5).toFixed(1)}
                        </span>
                        {item.installment && (
                          <span className="rounded-full bg-[#ffda7a] px-2.5 py-0.5 text-xs font-semibold text-[#7a6a1a]">
                            Bayar Bertahap
                          </span>
                        )}
                        {item.rehire && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-ink/10 px-2.5 py-0.5 text-xs font-semibold text-muted">
                            <ThumbsUp size={12} />
                            Banyak rehire
                          </span>
                        )}
                      </div>
                      <h3
                        className="mt-2 line-clamp-2 font-semibold leading-snug text-ink transition-transform duration-300 group-hover:translate-x-1"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                    </a>
                  </Reveal>
                ))}
          </ul>
        )}
      </Container>
    </section>
  );
};

export default FastworkStrip;
