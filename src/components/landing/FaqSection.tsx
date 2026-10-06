import React, { useId, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus } from "lucide-react";
import { FAQS } from "./content";
import { Container, Eyebrow, Reveal, WaButton } from "./primitives";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/**
 * One FAQ row (controlled by FaqSection so only one is open at a time). Height animates with the grid-rows 0fr -> 1fr technique (no measuring), plus a fade.
 * The answer stays in the DOM when closed (search engines still read it) but is inert, so it is
 * neither focusable nor announced. Motion is disabled under prefers-reduced-motion.
 */
const FaqItem: React.FC<{ q: string; a: string; open: boolean; onToggle: () => void }> = ({ q, a, open, onToggle }) => {
  const id = useId();
  const buttonId = `${id}-q`;
  const panelId = `${id}-a`;

  return (
    <div className="border-b border-ink/10">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-6 py-6 text-left"
        >
          <span className="text-lg font-semibold text-ink md:text-xl">{q}</span>
          <span
            aria-hidden
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
              open ? "rotate-45 border-violet-600 bg-violet-600 text-[#fff]" : "border-ink/15 text-ink group-hover:border-ink/40"
            }`}
          >
            <Plus size={16} />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p
            className={`-mt-2 max-w-[60ch] pb-7 leading-relaxed text-muted transition-opacity duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
};

const FaqSection: React.FC<{ index?: string }> = ({ index = "08" }) => {
  // Single-open accordion: opening a question closes the previous one; clicking the open one closes it
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
  <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-ink/10 py-20 md:py-32">
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
    <Container className="grid gap-12 md:grid-cols-12 md:gap-10">
      <Reveal className="md:col-span-4">
        <div className="md:sticky md:top-28">
          <Eyebrow index={index} className="text-muted">FAQ</Eyebrow>
          <h2 id="faq-title" className="gs-display mt-5 text-[clamp(2.25rem,4.5vw,3.5rem)] font-extrabold text-ink">
            Pertanyaan yang sering muncul.
          </h2>
          <p className="mt-5 max-w-[34ch] text-muted">Nggak nemu jawabannya? Tanya langsung, kami balas kurang dari 24 jam.</p>
          <WaButton context="faq" variant="outline" className="mt-6" message="Halo Gous Studio, saya punya pertanyaan soal layanan desain.">
            Tanya via WhatsApp
          </WaButton>
        </div>
      </Reveal>

      <div className="md:col-span-8">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.04}>
            <FaqItem
              q={f.q}
              a={f.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex((current) => (current === i ? null : i))}
            />
          </Reveal>
        ))}
      </div>
    </Container>
  </section>
  );
};

export default FaqSection;
