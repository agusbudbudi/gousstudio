import React, { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { Check } from "lucide-react";
import { supabase } from "../utils/supabase";

// Tailwind needs static class names for JIT. CMS stores `color` as a string,
// so we map it to explicit Tailwind classes here to keep UI consistent.
const COLOR_STYLES = {
  brand: {
    gradientFrom: "from-purple-500/[0.03]",
    gradientFromHover: "hover:from-purple-500/[0.06]",
    iconText: "text-purple-400",
    categoryText: "text-purple-500/80",
    categoryHoverText: "group-hover:text-purple-400",
    checkText: "text-purple-500",
  },
  orange: {
    gradientFrom: "from-orange-500/[0.03]",
    gradientFromHover: "hover:from-orange-500/[0.06]",
    iconText: "text-orange-400",
    categoryText: "text-orange-500/80",
    categoryHoverText: "group-hover:text-orange-400",
    checkText: "text-orange-500",
  },
  pink: {
    gradientFrom: "from-pink-500/[0.03]",
    gradientFromHover: "hover:from-pink-500/[0.06]",
    iconText: "text-pink-400",
    categoryText: "text-pink-500/80",
    categoryHoverText: "group-hover:text-pink-400",
    checkText: "text-pink-500",
  },
  blue: {
    gradientFrom: "from-blue-500/[0.03]",
    gradientFromHover: "hover:from-blue-500/[0.06]",
    iconText: "text-blue-400",
    categoryText: "text-blue-500/80",
    categoryHoverText: "group-hover:text-blue-400",
    checkText: "text-blue-500",
  },
  green: {
    gradientFrom: "from-green-500/[0.03]",
    gradientFromHover: "hover:from-green-500/[0.06]",
    iconText: "text-green-400",
    categoryText: "text-green-500/80",
    categoryHoverText: "group-hover:text-green-400",
    checkText: "text-green-500",
  },
  red: {
    gradientFrom: "from-red-500/[0.03]",
    gradientFromHover: "hover:from-red-500/[0.06]",
    iconText: "text-red-400",
    categoryText: "text-red-500/80",
    categoryHoverText: "group-hover:text-red-400",
    checkText: "text-red-500",
  },
  yellow: {
    gradientFrom: "from-yellow-500/[0.03]",
    gradientFromHover: "hover:from-yellow-500/[0.06]",
    iconText: "text-yellow-400",
    categoryText: "text-yellow-500/80",
    categoryHoverText: "group-hover:text-yellow-400",
    checkText: "text-yellow-500",
  },
  teal: {
    gradientFrom: "from-teal-500/[0.03]",
    gradientFromHover: "hover:from-teal-500/[0.06]",
    iconText: "text-teal-400",
    categoryText: "text-teal-500/80",
    categoryHoverText: "group-hover:text-teal-400",
    checkText: "text-teal-500",
  },
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from("services")
          .select("*")
          .order("order_index", { ascending: true });
        if (fetchError) throw fetchError;

        const mapped = (data || []).map((row) => ({
          id: row.slug || row.id,
          category: row.category,
          title: row.title,
          description: row.description,
          icon: row.icon,
          color: row.color,
          included: row.included || [],
        }));

        if (!cancelled) setServices(mapped);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load services");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchServices();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section id="service" className="py-10 px-3 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto md:px-6">
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Memuat layanan...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="service" className="py-10 px-3 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto md:px-6">
          <div className="py-16 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-red-400 font-bold">Gagal memuat layanan</p>
            <p className="text-slate-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="service" className="py-10 px-3 scroll-mt-24">
      <div className="max-w-[1400px] mx-auto md:px-6">
        <div className="text-center mb-12 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 title-bracketed">
            What We Offer
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Kami menyediakan layanan desain yang memadukan kreativitas,
            strategi, dan sentuhan personal untuk setiap klien & project.
          </p>
        </div>

        <div
          id="services-container"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => {
            const styles =
              COLOR_STYLES[service.color] || COLOR_STYLES.brand;
            const Icon = LucideIcons[service.icon] || LucideIcons.HelpCircle;

            return (
              <div
                key={service.id || index}
                className={`service-item group p-6 rounded-3xl transition-all duration-500 flex flex-col gap-6 reveal glass !border-none bg-gradient-to-br ${styles.gradientFrom} to-transparent ${styles.gradientFromHover}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <div className="w-16 h-16 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10">
                    {React.createElement(Icon, {
                      className: `text-3xl ${styles.iconText} font-normal`,
                      size: 40,
                    })}
                  </div>
                </div>

                <div className="space-y-4 relative z-10 text-left">
                  <div className="space-y-1">
                    <p
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ${styles.categoryText} ${styles.categoryHoverText} transition-colors`}
                    >
                      {service.category}
                    </p>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {service.title}
                    </h3>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
                    {service.description}
                  </p>

                  <ul className="space-y-2 pt-2">
                    {(service.included || []).map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-[11px] text-slate-500"
                      >
                        <Check size={14} className={styles.checkText} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
