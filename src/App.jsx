import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OrderModal from './ui/OrderModal';
import FloatingWhatsApp from './ui/FloatingWhatsApp';
import { useAppStore } from './store/useAppStore';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const PricelistPage = lazy(() => import('./pages/PricelistPage'));
const CMS = lazy(() => import('./pages/CMS'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  
  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      let attempts = 0;
      
      const tryScroll = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      };

      if (!tryScroll()) {
        const interval = setInterval(() => {
          attempts++;
          if (tryScroll() || attempts >= 15) {
            clearInterval(interval);
          }
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const ScrollReveal = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const revealCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    };

    const observer = new IntersectionObserver(revealCallback, {
      threshold: 0.1,
    });

    const observeElements = () => {
      const revealElements = document.querySelectorAll(".reveal:not(.visible)");
      revealElements.forEach((el) => observer.observe(el));
    };

    // Initial observation
    observeElements();

    // Observe future elements (e.g., after Suspense loads)
    const mutationObserver = new MutationObserver((mutations) => {
      let newNodesAdded = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          newNodesAdded = true;
          break;
        }
      }
      if (newNodesAdded) {
        observeElements();
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-transparent">
    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/pricelist" element={<PricelistPage />} />
        <Route path="/cms" element={<CMS />} />
        <Route path="/order/:orderNumber" element={<OrderDetail />} />
      </Routes>
    </AnimatePresence>
  );
};

function AppContent() {
  const { theme } = useAppStore();
  const location = useLocation();
  const isCMS = location.pathname.startsWith('/cms');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      const scrollBar = document.getElementById('scroll-progress');
      if (scrollBar) scrollBar.style.width = scrolled + '%';
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`mesh-gradient min-h-screen antialiased ${isCMS ? 'bg-black' : ''}`}>
      {!isCMS && (
        <div id="scroll-progress" className="fixed top-0 left-0 h-[3px] z-[200] transition-all duration-100" style={{ background: 'linear-gradient(to right, var(--color-brand), var(--color-neon-pink), var(--color-neon-orange))', width: '0%' }}></div>
      )}
      
      {!isCMS && <Navbar />}
      
      <main>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </main>

      {!isCMS && <Footer />}

      {!isCMS && <OrderModal />}
      {!isCMS && <FloatingWhatsApp />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Helmet>
          <title>Gous Studio | Creative Design & Visual Branding</title>
          <meta name="description" content="Gous Studio - Jasa desain grafis profesional, logo, poster, dan manajemen media sosial untuk brand yang ingin tampil beda." />
          <meta name="keywords" content="desain grafis, logo design, poster design, branding, gous studio, jakarta, bali, indonesia" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://gousstudio.com/" />
          <meta property="og:title" content="Gous Studio | Creative Design & Visual Branding" />
          <meta property="og:description" content="Kreativitas modern untuk membuat brand kamu lebih standout & berkesan." />
          <meta property="og:image" content="https://gousstudio.com/og-image.jpg" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://gousstudio.com/" />
          <meta property="twitter:title" content="Gous Studio | Creative Design & Visual Branding" />
          <meta property="twitter:description" content="Kreativitas modern untuk membuat brand kamu lebih standout & berkesan." />
          <meta property="twitter:image" content="https://gousstudio.com/og-image.jpg" />
        </Helmet>

        <ScrollToTop />
        <ScrollReveal />
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;
