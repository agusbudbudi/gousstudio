import React from "react";
import { Instagram, MapPin, Clock } from "lucide-react";
import { CONFIG } from "../../config/constants";
import { useAppStore } from "../../store/useAppStore";
import { buttonClass, Container, Reveal, WaButton } from "./primitives";

const FinalCta: React.FC = () => {
  const { openOrderModal } = useAppStore();

  const info = [
    { icon: <MapPin size={18} />, label: "Lokasi", value: "Jakarta, Indonesia" },
    {
      icon: <Instagram size={18} />,
      label: "Instagram",
      value: `@${CONFIG.INSTAGRAM_HANDLE}`,
      href: `https://www.instagram.com/${CONFIG.INSTAGRAM_HANDLE}`,
    },
    { icon: <span className="block h-2 w-2 rounded-full bg-green-500" />, label: "Status", value: "Open project" },
    { icon: <Clock size={18} />, label: "Respon", value: "Kurang dari 24 jam" },
  ];

  return (
    <section id="kontak" aria-labelledby="cta-title" className="gs-dark gs-grain relative overflow-hidden bg-ink py-24 text-paper md:py-36">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px]" />
      <Container className="relative">
        <Reveal>
          <h2 id="cta-title" className="gs-display max-w-[14ch] text-[clamp(3rem,9vw,7.5rem)] font-extrabold">
            Siap bikin brand kamu <span className="text-violet-400">naik level?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
          <p className="max-w-[48ch] text-lg leading-relaxed text-paper/70 md:col-span-6">
            Ceritakan project-mu — kami bantu susun solusi desain yang pas dengan budget dan targetmu.
            Konsultasi gratis, tanpa komitmen.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-6 md:justify-end">
            <WaButton context="final-cta" size="lg" variant="light">
              Mulai Konsultasi via WhatsApp
            </WaButton>
            <button type="button" onClick={() => openOrderModal()} className={buttonClass("outline-light", "lg")}>
              Isi Form Order
            </button>
          </div>
        </Reveal>

        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] bg-paper/10 md:mt-24 md:grid-cols-4">
          {info.map((item) => (
            <div key={item.label} className="bg-ink p-5 md:p-6">
              <dt className="gs-label flex items-center gap-2 text-paper/50">
                <span className="text-violet-300">{item.icon}</span>
                {item.label}
              </dt>
              <dd className="mt-2 font-semibold">
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
};

export default FinalCta;
