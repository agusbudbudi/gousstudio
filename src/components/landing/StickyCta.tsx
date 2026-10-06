import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { waLink, WA_DEFAULT_MESSAGE } from "./content";
import { EASE, WaButton, WhatsAppIcon } from "./primitives";

// Mobile: bottom bar after the hero, hidden near the final CTA/footer.
// Desktop: compact floating pill.
const StickyCta: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const end = document.getElementById("kontak");
    let heroOut = false;
    let endIn = false;
    const update = () => setVisible(heroOut && !endIn);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === hero) heroOut = !e.isIntersecting;
        if (e.target === end) endIn = e.isIntersecting || e.boundingClientRect.top < 0;
      });
      update();
    });
    if (hero) observer.observe(hero);
    if (end) observer.observe(end);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="mobile"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-[80] flex items-center justify-between gap-3 border-t border-ink/10 bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden"
          >
            <p className="flex items-center gap-2 text-sm text-muted">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Respon &lt; 24 jam
            </p>
            <WaButton context="sticky-mobile" className="!h-11">
              Chat WhatsApp
            </WaButton>
          </motion.div>
          <motion.a
            key="desktop"
            href={waLink(WA_DEFAULT_MESSAGE, "floating")}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed bottom-8 right-8 z-[80] hidden h-14 items-center gap-2.5 rounded-full bg-ink pl-5 pr-6 font-semibold text-paper shadow-[0_12px_40px_-12px_rgba(11,10,18,0.6)] transition-colors hover:bg-violet-700 md:inline-flex"
          >
            <WhatsAppIcon className="h-5 w-5 text-green-400" />
            Chat with us
          </motion.a>
        </>
      )}
    </AnimatePresence>
  );
};

export default StickyCta;
