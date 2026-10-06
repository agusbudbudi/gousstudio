import React, { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { STATS, WHY_POINTS } from "./content";
import { Container, Reveal, SectionHeader } from "./primitives";

const CountUp: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({
  value,
  prefix = "",
  suffix = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} aria-label={`${prefix}${value}${suffix}`}>
      <span aria-hidden>
        {prefix}
        {display}
        {suffix}
      </span>
    </span>
  );
};

const WhyGous: React.FC = () => (
  <section aria-labelledby="why-title" className="gs-dark gs-grain relative overflow-hidden bg-ink py-20 text-paper md:py-32">
    <Container>
      <SectionHeader
        id="why-title"
        dark
        index="03"
        eyebrow="Kenapa Gous"
        title={
          <>
            Kualitas agency, <span className="text-violet-400">kedekatan freelancer.</span>
          </>
        }
      />

      <dl className="mt-14 grid grid-cols-2 border-t border-paper/10 md:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.06}
            className={`py-8 pr-4 ${i % 2 === 1 ? "pl-5 md:pl-0" : ""} ${i < 2 ? "border-b border-paper/10 md:border-b-0" : ""} md:pr-6 ${i > 0 ? "md:border-l md:border-paper/10 md:pl-6" : ""}`}
          >
            <dt className="gs-label text-paper/50">{s.label}</dt>
            <dd className="gs-display mt-3 text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold tabular-nums">
              <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </dd>
          </Reveal>
        ))}
      </dl>

      <ol className="mt-6 grid gap-px overflow-hidden rounded-[24px] bg-paper/10 md:grid-cols-2">
        {WHY_POINTS.map((p, i) => (
          <Reveal as="li" key={p.title} delay={(i % 2) * 0.08} className="flex gap-5 bg-ink p-6 md:p-10">
            <span className="gs-label pt-1.5 text-violet-400">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-xl font-semibold text-paper md:text-2xl">{p.title}</h3>
              <p className="mt-2 max-w-[44ch] leading-relaxed text-paper/65">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Container>
  </section>
);

export default WhyGous;
