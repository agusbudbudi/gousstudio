import React from "react";

const Clients = () => {
  const clients = [
    { name: "Babygear", src: "/img/clients/client-babygear.png" },
    { name: "Katzenesia", src: "/img/clients/client-katzenesia.png" },
    { name: "My Indo Kitchen", src: "/img/clients/client-myindo.png" },
    { name: "HD Travel", src: "/img/clients/client-hdtravel.png" },
    { name: "Speakgurus", src: "/img/clients/client-speakguru.png" },
    { name: "Gajatech", src: "/img/clients/client-gajatech.png" },
    { name: "Republik Cikicow", src: "/img/clients/client-cikicow.png" },
    { name: "LB Glow", src: "/img/clients/client-lbglow.png" },
    { name: "Lakuna Korean", src: "/img/clients/client-lakuna.png" },
    { name: "Bekasi Cat House", src: "/img/clients/client-bch.png" },
    { name: "Annise Herbal", src: "/img/clients/client-anniseherbal.png" },
  ];

  return (
    <section id="client" className="py-16 px-3 overflow-hidden">
      <div className="max-w-[1400px] mx-auto md:px-6">
        <div className="reveal section-header-left border-l-2 border-brand-500/20 pl-6 py-2 mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 title-gradient-line">
            Brand yang Mempercayai Kami
          </h2>
          <p className="text-slate-400 max-w-xl">
            Berbagai brand dan bisnis telah mempercayakan kebutuhan desain
            mereka.
          </p>
        </div>

        <div className="relative overflow-hidden py-4">
          <div className="client-track flex w-max animate-[scroll-left_30s_linear_infinite] hover:[animation-play-state:paused] gap-8 md:gap-12">
            {[...clients, ...clients].map((client, index) => (
              <img
                key={`${client.name}-${index}`}
                src={client.src}
                alt={client.name}
                className="h-14 md:h-20 w-auto object-contain px-2 hover:scale-105 transition-transform"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;
