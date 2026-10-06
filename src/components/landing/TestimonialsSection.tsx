import React from "react";
import type { TestimonialItem } from "../../types";
import { Container, Reveal, SectionHeader } from "./primitives";
import { useLandingTestimonials } from "./useLandingData";

const Person: React.FC<{ item: TestimonialItem; large?: boolean }> = ({ item, large }) => (
  <figcaption className="flex items-center gap-3">
    {item.avatar_url ? (
      <img
        src={item.avatar_url}
        alt=""
        loading="lazy"
        className={`${large ? "h-14 w-14" : "h-11 w-11"} rounded-[14px] object-cover`}
      />
    ) : (
      <span
        aria-hidden
        className={`${large ? "h-14 w-14" : "h-11 w-11"} flex items-center justify-center rounded-[14px] bg-violet-100 font-bold text-violet-700`}
      >
        {item.name.charAt(0)}
      </span>
    )}
    <span>
      <span className="block font-semibold text-ink">{item.name}</span>
      <span className="block text-sm text-muted">{item.title}</span>
    </span>
  </figcaption>
);

const TestimonialsSection: React.FC = () => {
  const { data: items = [] } = useLandingTestimonials();
  if (items.length === 0) return null;
  const [featured, ...rest] = items;

  return (
    <section aria-labelledby="testi-title" className="py-20 md:py-32">
      <Container>
        <SectionHeader id="testi-title" index="04" eyebrow="Kata Klien" title="Mereka sudah merasakan bedanya." />

        <div className="-mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide md:mx-0 md:grid md:grid-cols-12 md:gap-5 md:overflow-visible md:px-0">
          <Reveal className="w-[88%] shrink-0 snap-start md:col-span-7 md:w-auto">
            <figure className="flex h-full flex-col justify-between gap-10 rounded-[24px] border border-violet-200 bg-violet-50 p-7 md:p-12">
              <span aria-hidden className="gs-display text-7xl leading-none text-violet-500">“</span>
              <blockquote className="gs-display -mt-6 text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
                {featured.testimony}
              </blockquote>
              <Person item={featured} large />
            </figure>
          </Reveal>

          <div className="contents md:col-span-5 md:flex md:flex-col md:gap-5">
            {rest.slice(0, 3).map((item, i) => (
              <Reveal key={item.id || item.name} delay={0.08 * (i + 1)} className="w-[88%] shrink-0 snap-start md:w-auto md:flex-1">
                <figure className="flex h-full flex-col justify-between gap-6 rounded-[24px] border border-ink/10 bg-[#fff] p-7">
                  <blockquote className="leading-relaxed text-ink/85">“{item.testimony}”</blockquote>
                  <Person item={item} />
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TestimonialsSection;
