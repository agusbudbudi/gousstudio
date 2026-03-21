import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FloatingWhatsApp = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Delay appearance so it doesn't pop in immediately on load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getWhatsAppMessage = () => {
    if (location.pathname === '/pricelist') {
      return 'Halo Gous Studio, saya mau tanya soal paket harga desain...';
    } 
    if (location.pathname === '/portfolio') {
      return 'Halo Gous Studio, saya melihat portfolio Anda dan tertarik untuk diskusi project...';
    } 
    if (location.hash === '#service') {
      return 'Halo Gous Studio, saya tertarik dengan layanan desain Anda...';
    }
    return 'Halo Gous Studio, saya ingin konsultasi mengenai kebutuhan desain saya...';
  };

  const whatsappNumber = '6285559496968'; 
  const message = encodeURIComponent(getWhatsAppMessage());
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  if (!isVisible) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90] group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] hover:bg-[#20bd5c] text-white shadow-[0_8px_30px_rgba(37,211,102,0.4)] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 hover:-translate-y-2 active:scale-95 animate-scaleIn"
    >
      {/* Ping Ring Effect */}
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none"></div>
      
      <img src="img/WhatsApp-logo.webp" alt="WhatsApp Icon" className="relative z-10 w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-sm" />
      
      {/* Hover Tooltip */}
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2.5 glass neon-border text-white text-xs font-bold rounded-2xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 pointer-events-none shadow-xl hidden sm:block whitespace-nowrap">
        Chat with us!
      </span>
    </a>
  );
};

export default FloatingWhatsApp;
