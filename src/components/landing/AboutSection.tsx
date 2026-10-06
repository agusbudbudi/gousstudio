import React, { useState } from "react";
import { Container, Eyebrow, Reveal, WaButton } from "./primitives";

// TODO(owner): add a real portrait at /public/img/founder.jpg (4:5, ≥1000px wide).
const FOUNDER_PHOTO = "/img/founder.jpg";

const FACTS = ["Est. 2019", "Jakarta, Indonesia", "Adobe CC · Figma · Canva Pro", "Logo · Branding · UI/UX · Illustration"];

const AboutSection: React.FC = () => {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section id="tentang" aria-labelledby="tentang-title" className="scroll-mt-20 py-20 md:py-32">
      <Container className="grid gap-12 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-violet-600">
            {!photoFailed ? (
              <img
                src={FOUNDER_PHOTO}
                alt="Agus Budiman, founder dan creative director Gous Studio"
                loading="lazy"
                onError={() => setPhotoFailed(true)}
                className="h-full w-full object-cover grayscale transition duration-700 hover:grayscale-0"
              />
            ) : (
              <div className="gs-grain flex h-full flex-col justify-between p-8 text-[#fff]">
                <span className="gs-label text-violet-200">Founder & Creative Director</span>
                <span aria-hidden className="gs-display text-[clamp(7rem,18vw,13rem)] font-extrabold leading-none">
                  AB
                </span>
                <span className="text-lg font-semibold">Agus Budiman</span>
              </div>
            )}
            <span className="gs-label absolute bottom-5 right-5 rotate-[-4deg] rounded-full bg-spark px-3 py-1.5 text-ink">
              7+ years design
            </span>
          </div>
        </Reveal>

        <div className="md:col-span-7 md:pl-6">
          <Reveal>
            <Eyebrow index="07" className="text-muted">Tentang</Eyebrow>
            <h2 id="tentang-title" className="gs-display mt-5 text-[clamp(2.25rem,5.5vw,4.25rem)] font-extrabold text-ink">
              Studio kecil, <span className="text-violet-600">standar besar.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="mt-8 max-w-[60ch] space-y-5 text-[17px] leading-relaxed text-ink/80">
            <p>
              Gous Studio didirikan oleh <strong className="font-semibold text-ink">Agus Budiman</strong> pada
              2019, setelah bertahun-tahun mendesain untuk brand dari berbagai industri. Kami percaya desain
              yang baik bukan sekadar enak dilihat — ia harus bekerja: membuat brand mudah dikenali,
              dipercaya, dan dipilih.
            </p>
            <p>
              Karena itu setiap project dikerjakan dengan perhatian penuh, dari riset sampai file terakhir.
              Studio sengaja dijaga tetap ramping agar kamu selalu berbicara langsung dengan desainernya —
              tanpa perantara, tanpa salah tangkap brief.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {FACTS.map((f) => (
                <li key={f} className="rounded-full border border-ink/10 px-3.5 py-2 text-sm text-ink/80">
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-6 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted">
                <span className="block font-semibold text-ink">— Agus Budiman</span>
                Founder & Creative Director
              </p>
              <WaButton context="about" variant="outline" message="Halo Mas Agus, saya mau kenalan dan diskusi soal brand saya.">
                Kenalan via WhatsApp
              </WaButton>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};

export default AboutSection;
