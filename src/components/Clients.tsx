import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

interface ClientLogo {
  name: string;
  src: string;
}

const Clients = () => {
  const [dynamicClients, setDynamicClients] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackClients = [
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

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Fetch from the public view 'client_logos'
        const { data, error } = await supabase
          .from("client_logos")
          .select("full_name, photo_url");

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map((item: any) => ({
            name: item.full_name,
            src: item.photo_url,
          }));
          setDynamicClients(mapped);
        }
      } catch (err) {
        console.error("Error fetching client logos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const displayClients = dynamicClients.length > 0 ? dynamicClients : fallbackClients;

  // Double the array for infinite scroll
  const scrollItems = [...displayClients, ...displayClients];

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
          <div 
            className="client-track flex w-max animate-[scroll-left_40s_linear_infinite] hover:[animation-play-state:paused] gap-8 md:gap-16 items-center"
            style={{ 
              animationDuration: `${displayClients.length * 3}s`,
              minWidth: "100%"
            }}
          >
            {scrollItems.map((client, index) => (
              <img
                key={`${client.name}-${index}`}
                src={client.src}
                alt={client.name}
                className="w-[124px] md:w-[178px] h-[56px] md:h-[80px] object-contain opacity-100 hover:scale-110 transition-all duration-500 grayscale hover:grayscale-0 contrast-[1.1]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;
