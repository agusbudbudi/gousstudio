import React from "react";
import { Award, ArrowRight } from "lucide-react";

const About = () => {
  const expertise = ["Logo Design", "Branding", "UI/UX", "Illustration"];
  const tools = ["Adobe Creative Cloud", "Figma", "Canva Pro"];

  return (
    <section id="about" className="py-12 px-4 relative overflow-hidden">
      <div className="bg-text-large -top-10 -left-20">EST. 2019</div>

      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 reveal relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-500/20 via-pink-500/20 to-orange-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative rounded-[2rem] overflow-hidden glass neon-border p-2">
              <img
                src="/img/about.png"
                alt="Agus Budiman"
                className="w-full w-[500px] object-cover rounded-[1.5rem] grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute top-8 right-8 glass p-4 rounded-2xl neon-border flex items-center gap-3 backdrop-blur-xl transition-all duration-500 shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Experience
                  </div>
                  <div className="text-sm font-bold text-white leading-none">
                    7+ Years Design
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 reveal">
            <h2 className="text-4xl sm:text-5xl font-black mb-6 text-white title-gradient-line">
              Tentang Gous Studio
            </h2>

            <div className="space-y-6 text-slate-300">
              <p className="text-lg leading-relaxed">
                <strong className="text-white">Gous Studio</strong> bukan
                sekadar agensi desain biasa. Kami adalah partner strategis yang
                berfokus pada pembuatan identitas visual yang{" "}
                <span className="text-brand-400 font-bold">memorable</span> dan{" "}
                <span className="text-pink-400 font-bold">berdampak</span>.
              </p>
              <p className="leading-relaxed opacity-80 text-base">
                Mulai berkarya sejak tahun{" "}
                <strong className="text-white">2019</strong>, kami memahami
                bahwa desain yang baik adalah kombinasi antara estetika yang
                memukau dan strategi komunikasi yang efektif. Kami siap membantu
                Anda memenangkan pasar melalui visual yang premium.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-brand-500/30"></span> Core
                  Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1.5 rounded-xl glass border border-white/5 text-[11px] text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-pink-500/30"></span> Tools of
                  Choice
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tools.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1.5 rounded-xl glass border border-white/5 text-[11px] text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-[var(--color-brand)] hover:text-[var(--color-text-title)] transition-colors group"
              >
                <span className="font-bold tracking-tight">
                  Mulai perjalanan kreatif Anda
                </span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
