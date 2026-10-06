import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { PROCESS_STEPS } from "./content";
import { Container, Reveal, SectionHeader } from "./primitives";

const ProcessSection: React.FC = () => {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });

  return (
    <section id="proses" aria-labelledby="proses-title" className="border-t border-ink/10 py-20 md:py-32">
      <Container>
        <SectionHeader
          id="proses-title"
          index="05"
          eyebrow="Cara Kerja"
          title="Dari brief sampai file final, tanpa drama."
          description="Empat tahap yang jelas, jadi kamu selalu tahu project sedang di mana."
        />

        <ol ref={ref} className="relative mt-14 grid gap-10 pl-8 md:grid-cols-4 md:gap-6 md:pl-0 md:pt-10">
          {/* progress line: vertical on mobile, horizontal on desktop */}
          <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-ink/10 md:bottom-auto md:left-0 md:right-0 md:top-0 md:h-px md:w-auto" />
          <motion.span
            aria-hidden
            style={{ scaleY: reduce ? 1 : scrollYProgress }}
            className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-violet-600 md:hidden"
          />
          <motion.span
            aria-hidden
            style={{ scaleX: reduce ? 1 : scrollYProgress }}
            className="absolute left-0 right-0 top-0 hidden h-[2px] origin-left bg-violet-600 md:block"
          />

          {PROCESS_STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.08} className="relative">
              <span aria-hidden className="absolute -left-8 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-paper bg-violet-600 md:-top-[46px] md:left-0" />
              <span className="gs-label text-violet-600">Step {String(i + 1).padStart(2, "0")}</span>
              <h3 className="gs-display mt-3 text-3xl font-bold text-ink">{step.title}</h3>
              <p className="mt-3 max-w-[36ch] leading-relaxed text-muted">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
};

export default ProcessSection;
