import React from "react";
import {
  MessageCircle,
  Mail,
  MapPin,
  Instagram,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const Contact = () => {
  const { openOrderModal } = useAppStore();
  const contactInfos = [
    {
      icon: MapPin,
      iconBg: "bg-cyan-500/10",
      iconText: "text-cyan-500",
      hoverText: "group-hover:text-cyan-500",
      label: "Location",
      value: "Jakarta, Indonesia",
    },
    {
      icon: Instagram,
      iconBg: "bg-pink-500/10",
      iconText: "text-pink-500",
      hoverText: "group-hover:text-pink-500",
      label: "Instagram",
      value: "@agdesign.official",
      link: "https://instagram.com/agdesign.official",
    },
    {
      icon: CheckCircle,
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-500",
      hoverText: "group-hover:text-emerald-500",
      label: "Status",
      value: "Open Project",
    },
    { 
      icon: Clock, 
      iconBg: "bg-amber-500/10",
      iconText: "text-amber-500",
      hoverText: "group-hover:text-amber-500",
      label: "Response", 
      value: "Under 24h" 
    },
  ];

  return (
    <section
      id="contact"
      className="py-16 px-4 relative overflow-hidden bg-brand-gradient scroll-mt-12"
    >
      {/* Background Blobs for Atmosphere */}
      <div className="blob w-96 h-96 bg-brand-500/10 -top-20 -left-20 opacity-30"></div>
      <div
        className="blob w-80 h-80 bg-neon-pink/10 -bottom-20 -right-20 opacity-20"
        style={{ animationDelay: "-4s" }}
      ></div>

      <div className="max-w-[1400px] mx-auto md:px-6 relative z-10 reveal flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-16">
        <div className="max-w-3xl text-center lg:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-[9px] text-brand-400 font-black uppercase tracking-widest mb-6 justify-center lg:justify-start">
            <CheckCircle size={10} /> Personalized Service
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-[1.1] mb-6">
            Bawa Brand Anda ke{" "}
            <span className="text-gradient">Level Selanjutnya</span> 🚀
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-10 max-w-xl">
            Siap mewujudkan ide kreatif Anda? Mari diskusikan project Anda dan
            ciptakan sesuatu yang luar biasa bersama — kami siap bikin penawaran
            yang sesuai budget & ekspektasimu.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <a
              href="https://wa.me/6285559496968?text=Halo%20Gous%20Studio,%20saya%20tertarik%20dengan%20jasa%20desain%20Anda."
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-brand-500 text-white font-black text-base transition-all duration-300 shadow-[0_0_20px_rgba(255,119,57,0.3)] hover:shadow-[0_0_40px_rgba(255,119,57,0.4)] hover:scale-105 active:scale-[0.98]"
            >
              <MessageCircle
                size={22}
                className="group-hover:rotate-12 transition-transform"
              />{" "}
              Konsultasi WhatsApp
            </a>
            <button
              onClick={openOrderModal}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl glass border-white/10 hover:bg-white/5 text-white font-black text-base transition-all duration-300 hover:scale-105 active:scale-[0.98] cursor-pointer"
            >
              <Send size={22} /> Order Sekarang
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto relative z-10">
          {contactInfos.map((info, idx) => {
            const content = (
              <>
                <div
                  className={`w-12 h-12 shrink-0 rounded-2xl ${info.iconBg} ${info.iconText} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <info.icon size={24} />
                </div>
                <div>
                  <p className="text-[12px] text-slate-500 mb-1">
                    {info.label}
                  </p>
                  <p
                    className={`text-white text-sm font-bold ${info.link ? `transition-colors ${info.hoverText}` : ""}`}
                  >
                    {info.value}
                  </p>
                </div>
              </>
            );

            return info.link ? (
              <a
                key={idx}
                href={info.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 p-5 rounded-[1.25rem] glass border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent group hover:border-brand-500/50 transition-all min-w-[240px]"
              >
                {content}
              </a>
            ) : (
              <div
                key={idx}
                className="flex items-center gap-5 p-5 rounded-[1.25rem] glass border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent min-w-[240px]"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Contact;
