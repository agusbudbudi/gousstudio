import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, MessageSquare, Menu, X } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const Navbar = () => {
  const { theme, toggleTheme, openOrderModal } = useAppStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/#service" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Pricelist", href: "/pricelist" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <nav
        id="navbar"
        className={`fixed z-50 py-3 transition-all duration-500 ${
          isScrolled 
            ? "bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border-adaptive)] px-0 scrolled" 
            : "glass neon-border px-3 rounded-2xl"
        }`}
      >
        <div
          className={`flex items-center gap-4 transition-all duration-500 ${
            isScrolled ? "max-w-[1400px] mx-auto px-6" : "w-full"
          }`}
        >
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/img/gous-logo.png"
              alt="Gous Studio Icon"
              className="h-8 md:h-8 w-auto"
            />
            <span className="font-['Neue_Machina',_sans-serif] font-black text-xl text-white tracking-tight pt-1">
              GousStudio
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? location.pathname === "/" && location.hash === ""
                  : link.href.startsWith("/#")
                    ? location.pathname === "/" && location.hash === link.href.substring(1)
                    : location.pathname === link.href;

              return (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={`nav-link px-3 py-1.5 rounded-lg text-sm transition-all ${
                      isActive
                        ? "text-white bg-white/5 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="hidden md:flex w-9 h-9 rounded-xl glass items-center justify-center text-brand-400 hover:scale-110 transition-all cursor-pointer ml-auto"
          >
            {theme === "light" ? (
              <Sun className="w-5 h-5 theme-icon" />
            ) : (
              <Moon className="w-5 h-5 theme-icon" />
            )}
          </button>

          <button
            onClick={openOrderModal}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all duration-300 neon-glow hover:scale-105 whitespace-nowrap cursor-pointer"
          >
            <MessageSquare size={16} /> Let's Talk
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all ml-auto"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Dropdown */}
      <div
        id="mobile-nav"
        className={`glass neon-border fixed top-16 left-4 right-4 z-40 rounded-2xl p-4 flex-col gap-2 md:hidden ${isMobileMenuOpen ? "open flex" : "hidden"}`}
      >
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? location.pathname === "/" && location.hash === ""
              : link.href.startsWith("/#")
                ? location.pathname === "/" && location.hash === link.href.substring(1)
                : location.pathname === link.href;

          return (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl transition-all text-sm ${
                isActive
                  ? "text-white bg-white/10 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
        <div className="flex items-center justify-between gap-4 mt-2 border-t border-white/5 pt-4 px-2">
          <button
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-brand-400 hover:scale-110 transition-all cursor-pointer"
          >
            {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openOrderModal();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold whitespace-nowrap cursor-pointer"
          >
            <MessageSquare size={18} /> Let's Talk
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
