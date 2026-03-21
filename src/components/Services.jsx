import React from "react";
import servicesData from "../data/services.json";
import * as LucideIcons from "lucide-react";
import { Check } from "lucide-react";

const Services = () => {
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
          {servicesData.map((service, index) => (
            <div
              key={service.id}
              className={`service-item group p-6 rounded-3xl transition-all duration-500 flex flex-col gap-6 reveal glass !border-none bg-gradient-to-br from-${service.color}-500/[0.03] to-transparent hover:from-${service.color}-500/[0.06]`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <div
                  className={`w-16 h-16 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 relative z-10`}
                >
                  {React.createElement(
                    LucideIcons[service.icon] || LucideIcons.HelpCircle,
                    {
                      className: `text-3xl text-${service.color}-400 font-normal`,
                      size: 40,
                    },
                  )}
                </div>
              </div>

              <div className="space-y-4 relative z-10 text-left">
                <div className="space-y-1">
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] text-${service.color}-500/80 group-hover:text-${service.color}-400 transition-colors`}
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
                      <Check
                        size={14}
                        className={`text-${service.color}-500`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>


              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
