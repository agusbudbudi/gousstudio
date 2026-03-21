import React, { useState, useEffect } from "react";
import { Briefcase, MessageSquare, ChevronDown, Send } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const Hero = () => {
  const { openOrderModal } = useAppStore();
  const [typingText, setTypingText] = useState("");
  const words = [
    "Brand Identity",
    "Logo Design",
    "Social Media",
    "Poster Design",
    "Visual Branding",
  ];
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let speed = isDeleting ? 60 : 100;
    const currentWord = words[wordIndex];

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          setTypingText(currentWord.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);

          if (charIndex === currentWord.length) {
            setIsDeleting(true);
            setCharIndex(currentWord.length);
          }
        } else {
          setTypingText(currentWord.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);

          if (charIndex === 0) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting && charIndex === currentWord.length
        ? 1800
        : isDeleting && charIndex === 0
          ? 400
          : speed,
    );

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex]);

  return (
    <section
      id="home"
      className="hero-grid-bg relative min-h-screen flex flex-col items-center justify-center px-3 text-center overflow-hidden pt-24"
    >
      <div className="blob w-96 h-96 bg-brand-500 top-1/4 -left-20"></div>
      <div
        className="blob w-80 h-80 bg-neon-pink top-1/3 -right-20"
        style={{ animationDelay: "-6s" }}
      ></div>
      <div
        className="blob w-64 h-64 bg-neon-cyan bottom-1/4 left-1/4"
        style={{ animationDelay: "-3s", opacity: 0.1 }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto reveal visible">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass neon-border text-xs text-brand-400 font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Available for new project
        </div>
        <h1 className="text-7xl sm:text-8xl md:text-7xl font-black tracking-tight leading-tight mb-6">
          <span className="text-white">Creative</span>
          <br />
          <span className="text-gradient">
            {typingText}
            <span className="cursor"></span>
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Kreativitas modern untuk membuat brand kamu lebih{" "}
          <span className="text-white font-medium">standout</span> &{" "}
          <span className="text-white font-medium">berkesan</span>. 5+ tahun
          membantu bisnis tumbuh dengan desain yang berbicara.
        </p>

        <div className="flex items-center justify-center gap-8 mb-10 text-center">
          <div>
            <p className="text-3xl font-black text-gradient">100+</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
              Clients
            </p>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div>
            <p className="text-3xl font-black text-gradient">7+</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
              Years Exp
            </p>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div>
            <p className="text-3xl font-black text-gradient">200+</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
              Projects
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/portfolio"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-base transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] neon-glow hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98]"
          >
            <Briefcase
              size={20}
              className="group-hover:rotate-12 transition-transform duration-[600ms]"
            />{" "}
            Lihat Portfolio
          </a>
          <button
            onClick={openOrderModal}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass neon-border text-white font-semibold text-base transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
          >
            <Send
              size={20}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-[600ms]"
            />{" "}
            Order Sekarang
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs animate-bounce">
        <span>Scroll</span>
        <ChevronDown size={24} />
      </div>
    </section>
  );
};

export default Hero;
