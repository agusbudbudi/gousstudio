import React from "react";
import { Link } from "react-router-dom";
import { CONFIG } from "../../config/constants";
import { NAV_ITEMS, SERVICES, waLink, WA_DEFAULT_MESSAGE } from "./content";
import { Container, BrandLogo } from "./primitives";

const LandingFooter: React.FC = () => (
  <footer className="gs-dark overflow-hidden border-t border-paper/10 bg-ink pb-28 pt-16 text-paper md:pb-10">
    <Container>
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <BrandLogo onDark size="lg" />
          <p className="mt-4 max-w-[40ch] leading-relaxed text-paper/60">
            Creative design studio di Jakarta untuk brand identity, logo, social media, dan poster design.
            Membantu UMKM dan personal brand tampil profesional sejak 2019.
          </p>
        </div>

        <nav aria-label="Layanan" className="md:col-span-3">
          <p className="gs-label text-paper/40">Layanan</p>
          <ul className="mt-4 space-y-2.5">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <Link to="/#layanan" className="text-paper/75 transition-colors hover:text-paper">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Navigasi footer" className="md:col-span-2">
          <p className="gs-label text-paper/40">Navigasi</p>
          <ul className="mt-4 space-y-2.5">
            {NAV_ITEMS.map((n) => (
              <li key={n.href}>
                <Link to={n.href} className="text-paper/75 transition-colors hover:text-paper">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/portfolio" className="text-paper/75 transition-colors hover:text-paper">
                Portfolio lengkap
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className="gs-label text-paper/40">Kontak</p>
          <ul className="mt-4 space-y-2.5 break-words">
            <li>
              <a href={`mailto:${CONFIG.PUBLIC_EMAIL}`} className="text-paper/75 transition-colors hover:text-paper">
                {CONFIG.PUBLIC_EMAIL}
              </a>
            </li>
            <li>
              <a href={waLink(WA_DEFAULT_MESSAGE, "footer")} target="_blank" rel="noopener noreferrer" className="text-paper/75 transition-colors hover:text-paper">
                {CONFIG.PUBLIC_WA_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`https://www.instagram.com/${CONFIG.INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer" className="text-paper/75 transition-colors hover:text-paper">
                @{CONFIG.INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p
        aria-hidden
        className="gs-display mt-16 select-none whitespace-nowrap text-center text-[clamp(4rem,17vw,15rem)] font-extrabold leading-[0.8] text-paper/[0.06]"
      >
        GousStudio
      </p>

      <div className="mt-8 flex flex-col gap-2 border-t border-paper/10 pt-6 text-sm text-paper/50 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Gous Studio. All rights reserved.</p>
        <p>Made with care in Jakarta</p>
      </div>
    </Container>
  </footer>
);

export default LandingFooter;
