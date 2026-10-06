import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Container, EASE, WaButton } from "./primitives";
import { usePortfolio, WorkItem, workGroup } from "./useLandingData";

// Two lines on md+ (each line kept on one row); wraps naturally on small screens.
const LINES = [
  <>
    Bikin brand kamu <span className="text-violet-600">diingat,</span>
  </>,
  <>bukan cuma dilihat.</>,
];

const MARQUEE_COUNT = 12;

// Titled items first, then interleave categories so the strip mixes logos, posters, feeds…
const pickMarqueeWorks = (all: WorkItem[]) => {
  const ordered = [...all.filter((i) => i.hasTitle), ...all.filter((i) => !i.hasTitle)];
  const buckets = new Map<string, WorkItem[]>();
  ordered.forEach((w) => {
    const key = workGroup(w).slug;
    buckets.set(key, [...(buckets.get(key) || []), w]);
  });
  const picked: WorkItem[] = [];
  while (picked.length < MARQUEE_COUNT && Array.from(buckets.values()).some((b) => b.length)) {
    buckets.forEach((b) => {
      const next = b.shift();
      if (next && picked.length < MARQUEE_COUNT) picked.push(next);
    });
  }
  return picked;
};

// Shown when portfolio data is unavailable, so the hero never renders empty boxes.
const FALLBACK_TILES = [
  { word: "Logo.", label: "Brand Identity", className: "bg-violet-600 text-[#fff]" },
  { word: "Feed.", label: "Social Media", className: "bg-ink text-paper" },
  { word: "Poster.", label: "Event & Promo", className: "border border-ink/10 bg-paper-200 text-ink" },
  { word: "Brand.", label: "Identity System", className: "bg-spark text-ink" },
  { word: "Ads.", label: "Digital Marketing", className: "bg-violet-950 text-paper" },
  { word: "Menu.", label: "Print & Digital", className: "border border-ink/10 bg-[#fff] text-ink" },
];

// One marquee item: fixed height, width follows the image's native ratio. Failed images are dropped.
const MarqueeWork: React.FC<{ work: WorkItem; eager: boolean; hidden: boolean }> = ({ work, eager, hidden }) => {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  if (state === "error") return null;
  return (
    <li aria-hidden={hidden || undefined} className={`mr-4 h-full shrink-0 md:mr-5 ${state === "loading" ? "aspect-[4/5]" : ""}`}>
      <figure className="relative h-full overflow-hidden rounded-[20px] bg-paper-200">
        <img
          src={work.src}
          alt={hidden ? "" : work.imgAlt || `${work.title} — karya Gous Studio`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={`h-full w-auto max-w-none object-contain transition-opacity duration-500 ${state === "loaded" ? "opacity-100" : "opacity-0"}`}
        />
      </figure>
    </li>
  );
};


// Availability pill above the headline; set to false to hide it.
const SHOW_AVAILABILITY = true;

const HeroSection: React.FC = () => {
  const reduce = useReducedMotion();
  const { data: works = [], isLoading } = usePortfolio();
  const marqueeWorks = useMemo(() => pickMarqueeWorks(works), [works]);

  return (
    <section id="top" aria-labelledby="hero-title" className="gs-grain relative overflow-hidden pb-16 pt-20 md:pb-24 md:pt-24">
      {/* Work marquee — top of hero, full-bleed, native ratios, bottom fades into the headline (DESIGN.md §5 Hero) */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
        className="gs-marquee-wrap gs-fade-xb relative overflow-hidden"
        aria-label="Cuplikan karya Gous Studio"
        role="region"
      >
        <ul
          className="gs-marquee flex h-[150px] w-max md:h-[210px]"
          style={{ ["--gs-marquee-duration" as string]: `${Math.max((marqueeWorks.length || 6) * 6, 45)}s` }}
        >
          {[0, 1].map((copy) =>
            isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li key={`${copy}-sk-${i}`} aria-hidden className={`mr-4 h-full shrink-0 animate-pulse rounded-[20px] md:mr-5 bg-paper-300/60 ${i % 3 === 1 ? "aspect-[16/10]" : "aspect-[4/5]"}`} />
                ))
              : marqueeWorks.length
                ? marqueeWorks.map((work, i) => (
                    <MarqueeWork key={`${copy}-${work.id || i}`} work={work} eager={copy === 0 && i < 4} hidden={copy === 1} />
                  ))
                : FALLBACK_TILES.map((t) => (
                    <li
                      key={`${copy}-${t.word}`}
                      aria-hidden={copy === 1 || undefined}
                      className={`gs-grain mr-4 flex aspect-[4/5] h-full shrink-0 flex-col md:mr-5 justify-between overflow-hidden rounded-[20px] p-5 ${t.className}`}
                    >
                      <span className="gs-label opacity-70">{t.label}</span>
                      <span className="gs-display text-[clamp(2.25rem,4vw,3.5rem)] font-extrabold">{t.word}</span>
                    </li>
                  )),
          )}
        </ul>
      </motion.div>

      <Container className="relative z-10 -mt-4 flex flex-col items-center text-center md:-mt-8">
        {SHOW_AVAILABILITY && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="gs-label inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-ink/10 bg-paper/85 px-3.5 py-2 text-ink/80 shadow-[0_8px_24px_-12px_rgba(11,10,18,0.25)] backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Slot project tersedia
          </motion.p>
        )}

        <h1
          id="hero-title"
          className="gs-display mx-auto mt-7 text-[clamp(2.625rem,6.4vw,6rem)] font-extrabold text-ink md:mt-9"
        >
          {LINES.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em] md:whitespace-nowrap">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.08 + i * 0.09 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-8 flex w-full flex-col items-center md:mt-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <p className="mx-auto max-w-[56ch] text-[17px] leading-relaxed text-muted md:text-lg">
              Jasa desain grafis untuk UMKM &amp; personal brand — logo, branding, social
              media, dan poster yang dirancang dengan strategi.{" "}
              <span className="font-semibold text-ink">7+ tahun, 200+ project.</span>
            </p>

            <div className="mt-8 flex w-full flex-col items-center gap-1 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3">
              <WaButton context="hero" size="lg">
                Konsultasi Gratis via WhatsApp
              </WaButton>
              <a
                href="#karya"
                className="group inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 font-semibold text-ink underline-offset-4 hover:underline"
              >
                Lihat Karya Kami
                <ArrowDown size={18} className="transition-transform group-hover:translate-y-0.5" />
              </a>
            </div>
            <p className="mt-3 text-sm text-muted">Dibalas &lt; 24 jam · Tanpa komitmen</p>

          </motion.div>

        </div>
      </Container>

    </section>
  );
};

export default HeroSection;
