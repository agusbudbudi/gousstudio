import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, waLink, WA_DEFAULT_MESSAGE } from "./content";
import { Container, EASE, WaButton, WhatsAppIcon, BrandLogo } from "./primitives";

const LandingNavbar: React.FC = () => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 400 && y > prev && !open);
  });

  // Lets sticky sub-navs (e.g. portfolio filters) slide up when the header hides.
  useEffect(() => {
    const root = document.documentElement;
    if (hidden) root.setAttribute("data-gs-nav-hidden", "");
    else root.removeAttribute("data-gs-nav-hidden");
    return () => root.removeAttribute("data-gs-nav-hidden");
  }, [hidden]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[120] rounded-full bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Langsung ke konten
      </a>
      <motion.header
        initial={false}
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.35, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-[100] transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled || open
            ? "border-b border-ink/10 bg-paper/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <Container className="flex h-16 items-center justify-between md:h-20">
          <Link to="/" aria-label="Gous Studio — beranda">
            <BrandLogo />
          </Link>

          <nav aria-label="Navigasi utama" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="rounded-full px-4 py-2 text-[15px] font-medium text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <WaButton context="navbar" className="!h-11 max-sm:hidden">
              Chat WhatsApp
            </WaButton>
            <a
              href={waLink(WA_DEFAULT_MESSAGE, "navbar")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat WhatsApp"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 text-[#fff] sm:hidden"
            >
              <WhatsAppIcon />
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="gs-mobile-menu"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink lg:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </Container>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="gs-mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] flex flex-col bg-paper px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24 lg:hidden"
          >
            <nav aria-label="Navigasi mobile" className="flex-1">
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.45, ease: EASE }}
                    className="border-b border-ink/10"
                  >
                    <Link
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className="gs-display flex items-baseline justify-between py-4 text-4xl font-bold text-ink"
                    >
                      {item.label}
                      <span className="gs-label text-muted">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <WaButton context="mobile-menu" size="lg" className="w-full">
              Chat WhatsApp
            </WaButton>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
