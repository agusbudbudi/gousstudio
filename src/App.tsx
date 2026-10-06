import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import OrderModal from './ui/OrderModal';
import ToastContainer from './components/Common/ToastContainer';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const PricelistPage = lazy(() => import('./pages/PricelistPage'));
const CMS = lazy(() => import('./pages/CMS'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const PricelistDetailPage = lazy(() => import('./pages/PricelistDetailPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const NotFound = lazy(() => import('./pages/NotFound'));

// CMS Components
const OrderCMS = lazy(() => import('./components/CMS/OrderCMS'));
const ClientCMS = lazy(() => import('./components/CMS/ClientCMS'));
const PortfolioCMS = lazy(() => import('./components/CMS/PortfolioCMS'));
const PricelistCMS = lazy(() => import('./components/CMS/PricelistCMS'));
const ServicesCMS = lazy(() => import('./components/CMS/ServicesCMS'));
const FastworkCMS = lazy(() => import('./components/CMS/FastworkCMS'));
const TestimonialCMS = lazy(() => import('./components/CMS/TestimonialCMS'));
const VoucherCMS = lazy(() => import('./components/CMS/VoucherCMS'));

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

// Route-level fallback: a thin top progress bar instead of a full-screen spinner.
// It fades in after a short delay so fast chunk loads show nothing at all (see .gs-page-loader in index.css).
const PageLoader = () => (
  <div className="min-h-screen" role="status" aria-label="Memuat halaman">
    <div className="gs-page-loader" aria-hidden="true">
      <div className="gs-page-loader__bar" />
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      {/* All /cms/* routes share one key so switching CMS tabs doesn't remount the CMS layout */}
      <Routes location={location} key={location.pathname.startsWith('/cms') ? '/cms' : location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/pricelist" element={<PricelistPage />} />
        <Route path="/pricelist/:slug" element={<PricelistDetailPage />} />
        <Route path="/portal/:token" element={<ClientPortal />} />
        <Route path="/cms" element={<CMS />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrderCMS />} />
          <Route path="orders/:orderNumber" element={<OrderCMS />} />
          <Route path="clients" element={<ClientCMS />} />
          <Route path="clients/:clientNo" element={<ClientCMS />} />
          <Route path="portfolio" element={<PortfolioCMS />} />
          <Route path="pricelist" element={<PricelistCMS />} />
          <Route path="services" element={<ServicesCMS />} />
          <Route path="testimonials" element={<TestimonialCMS />} />
          <Route path="vouchers" element={<VoucherCMS />} />
          <Route path="fastwork" element={<FastworkCMS />} />
          {/* Unknown CMS section: back to the default page instead of an empty layout */}
          <Route path="*" element={<Navigate to="orders" replace />} />
        </Route>
        <Route path="/order/:orderNumber" element={<OrderDetail />} />
        <Route path="/order/:orderNumber/payment" element={<PaymentPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function AppContent() {
  const location = useLocation();
  const isCMS = location.pathname.startsWith('/cms');
  // Every non-CMS page (landing, portfolio, pricelist, client pages, 404) is on the brand shell
  // and ships its own navbar and footer (src/components/landing).
  const isLanding = !isCMS;

  // Lets global styles (e.g. the page scrollbar) switch to the brand-shell palette.
  useEffect(() => {
    document.documentElement.toggleAttribute('data-gs-shell', isLanding);
    document.documentElement.toggleAttribute('data-cms-shell', isCMS);
  }, [isLanding, isCMS]);

  // Brand-shell pages sit on paper; the CMS uses its lighter paper (see .cms-root in index.css)
  const shellBg = isCMS ? 'bg-[#fbfbf9]' : 'bg-paper';
  return (
    <div className={`min-h-screen antialiased ${shellBg}`}>
      <main>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </main>

      {!isCMS && <OrderModal />}
      <ToastContainer />
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
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;
