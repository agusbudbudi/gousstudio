import React from "react";
import { useClientLogos } from "./useLandingData";

const ClientMarquee: React.FC = () => {
  const { data: clients = [] } = useClientLogos();
  if (clients.length === 0) return null;

  const duration = `${Math.max(clients.length * 3.5, 30)}s`;

  return (
    <section aria-label="Klien Gous Studio" className="border-y border-ink/10 py-10 md:py-12">
      <p className="gs-label mb-8 text-center text-muted">Brand yang sudah tumbuh bersama Gous</p>
      <div className="gs-marquee-wrap gs-fade-x overflow-hidden">
        <ul
          className="gs-marquee flex w-max items-center"
          style={{ ["--gs-marquee-duration" as string]: duration }}
        >
          {[0, 1].map((copy) =>
            clients.map((client) => (
              <li
                key={`${copy}-${client.name}`}
                aria-hidden={copy === 1 || undefined}
                className="mx-6 flex h-10 w-[120px] shrink-0 items-center justify-center md:mx-10 md:h-14 md:w-[160px]"
              >
                <img
                  src={client.src}
                  alt={copy === 0 ? client.name : ""}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
};

export default ClientMarquee;
