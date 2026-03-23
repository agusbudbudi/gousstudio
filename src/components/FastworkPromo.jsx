import React from "react";
import { supabase } from "../utils/supabase";
import { ArrowRight, Star, StarHalf, ThumbsUp } from "lucide-react";
import LazyImage from "../ui/LazyImage";

const FastworkPromo = () => {
  const [fastworkData, setFastworkData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchFastwork = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("fastwork_items")
          .select("*")
          .order("id");

        if (fetchError) throw fetchError;
        setFastworkData(data || []);
      } catch (err) {
        console.error("Error fetching fastwork items:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFastwork();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const remainder = rating - fullStars;

    let finalFullCount = fullStars;
    let hasHalf = false;

    if (remainder >= 0.6) {
      finalFullCount += 1;
    } else if (remainder >= 0.5) {
      hasHalf = true;
    }

    for (let i = 1; i <= 5; i++) {
      if (i <= finalFullCount) {
        stars.push(
          <Star
            key={i}
            size={12}
            strokeWidth={2.4}
            className="fill-yellow-400 text-yellow-400"
          />,
        );
      } else if (hasHalf) {
        stars.push(
          <div key={i} className="relative inline-flex">
            <Star
              size={12}
              strokeWidth={2.4}
              className="text-yellow-400 fill-transparent"
            />
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <Star
                size={12}
                strokeWidth={2.4}
                className="fill-yellow-400 text-yellow-400"
              />
            </div>
          </div>,
        );
        hasHalf = false;
      } else {
        stars.push(
          <Star
            key={i}
            size={12}
            strokeWidth={2.4}
            className="text-yellow-400/20"
          />,
        );
      }
    }
    return stars;
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-brand-gradient">
      <div className="max-w-[1400px] mx-auto md:px-6">
        <div className="flex flex-col items-center text-center mb-10 reveal">
          <div className="mb-6 h-16 flex items-center justify-center">
            <img
              src="/img/fastwork-logo.png"
              alt="Fastwork"
              className="h-full w-auto object-contain"
            />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 title-gradient-line">
            Hire Us on Fastwork!
          </h2>
          <p className="text-slate-400 max-w-2xl mt-2">
            Pesan desain dengan mudah lewat platform freelancer terbaik. Lihat
            detail portfolio tiap service dan rating murni dari klien
            sebelumnya.
          </p>
        </div>

        {error && (
          <div className="text-center py-10 bg-red-500/10 border border-red-500/20 rounded-2xl mb-12">
            <p className="text-red-400 font-bold">Gagal memuat promo Fastwork</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        )}

        <div
          id="fastwork-container"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[350px] rounded-xl glass border border-white/5 animate-pulse bg-white/5"
                />
              ))
            : fastworkData.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass neon-border rounded-xl overflow-hidden flex flex-col reveal"
              style={{ animationDelay: item.delay }}
            >
              <div className="overflow-hidden relative bg-slate-100 dark:bg-slate-800/50">
                <LazyImage
                  src={item.image}
                  alt={item.title}
                  className="w-full relative z-10 group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
                />
              </div>
              <div className="p-5 flex flex-col flex-1 gap-3 bg-gradient-to-b from-transparent to-brand-500/5">
                <div className="flex flex-col gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {renderStars(item.rating || 5.0)}
                    </div>
                    <span className="text-slate-400 text-[10px] ml-1 font-bold">
                      {item.rating ? item.rating.toFixed(1) : "5.0"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {item.installment && (
                      <span className="bg-[#ffda7a] text-[#7a6a1a] font-bold text-[9px] px-2.5 py-1 rounded-full whitespace-nowrap">
                        Bayar Bertahap
                      </span>
                    )}

                    {item.rehire && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f2f2] w-fit">
                        <div className="relative">
                          <ThumbsUp
                            size={12}
                            className="text-[#0056d2] fill-[#0056d2]"
                          />
                          <div className="absolute -top-1 -right-1">
                            <Star
                              size={6}
                              className="text-yellow-500 fill-yellow-500 stroke-[2]"
                            />
                          </div>
                        </div>
                        <span className="text-[#7c8b9a] font-bold text-[9px] whitespace-nowrap">
                          Banyak rehire
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <h3
                  className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors mt-1"
                  title={item.title}
                >
                  {item.title}
                </h3>
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Order Now <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FastworkPromo;
