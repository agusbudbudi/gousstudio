import React, { useEffect, useState } from "react";
import { Quote, Loader2 } from "lucide-react";
import { supabase } from "../utils/supabase";
import { TestimonialItem } from "../types";

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackTestimonials: TestimonialItem[] = [
    {
      rating: 5,
      testimony: '"Gous Studio sangat profesional. Logo yang dihasilkan benar-benar merepresentasikan brand kami dengan sempurna. Prosesnya cepat dan komunikatif!"',
      name: "Budi Santoso",
      title: "Owner, Katzenesia",
      avatar_url: "/img/clients/testi-1.png",
      is_show: true,
    },
    {
      rating: 5,
      testimony: '"Desain feed Instagram kami jauh lebih rapi dan engagement naik signifikan sejak dikelola Gous Studio. Highly recommended!"',
      name: "Sari Putri",
      title: "Marketing, SpeakGuru",
      avatar_url: "/img/clients/testi-2.png",
      is_show: true,
    },
    {
      rating: 5,
      testimony: '"Penanganan project poster untuk event kami sangat luar biasa. Artistik dan tetap fungsional informasinya. Klien sangat puas!"',
      name: "Andi Wijaya",
      title: "Event Manager, Lakuna",
      avatar_url: "/img/clients/testi-3.png",
      is_show: true,
    },
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_show", true)
          .order("order_index", { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const getAvatar = (testi: TestimonialItem) => {
    if (testi.avatar_url && testi.avatar_url.trim() !== "") return testi.avatar_url;
    // Guess gender or use generic (using generic for now as gender field removed)
    return "/img/avatar-male.webp";
  };

  if (loading) {
    return (
      <section id="testimonials" className="py-20 flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading testimonials...</p>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-10 px-3">
      <div className="max-w-[1400px] mx-auto md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 reveal gap-6">
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 title-bracketed">
              Apa Kata Klien Kami
            </h2>
          </div>
          <p className="text-slate-400 max-w-sm text-sm italic border-l-2 border-brand-500 pl-4 py-1">
            "Kepercayaan klien adalah motivasi terbesar kami untuk terus
            berkarya dan memberikan hasil terbaik."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {testimonials.map((testi, index) => (
            <div
              key={testi.id || index}
              className="p-7 rounded-2xl reveal group relative shadow-lg shadow-black/3"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-5 right-6 text-white/5 group-hover:text-brand-500/10 transition-colors duration-700">
                <Quote size={48} className="rotate-12" />
              </div>
              <div className="flex gap-1 text-orange-400 mb-4 text-[16px]">
                <span>{"★".repeat(testi.rating || 5)}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-4 relative z-10">
                {testi.testimony}
              </p>
              <div className="flex items-center gap-3 relative z-10 pt-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-slate-500/10">
                  <img
                    src={getAvatar(testi)}
                    alt={testi.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white font-bold tracking-tight">
                    {testi.name}
                  </p>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                    {testi.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
