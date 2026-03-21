import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MessageCircle,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 py-12 px-3">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 w-fit">
              <img
                src="/img/gous-logo.png"
                alt="Gous Studio Icon"
                className="h-8 md:h-8 w-auto"
              />
              <span className="font-['Neue_Machina',_sans-serif] font-black text-xl text-white tracking-tight pt-1">
                GousStudio
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Design that Inspires. Branding that Lasts. Kreativitas modern
              untuk brand yang standout.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook Profile"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-500 transition-all"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="Instagram Profile"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-500 transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                aria-label="Twitter Profile"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-500 transition-all"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn Profile"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-500 transition-all"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="/#service"
                  className="hover:text-brand-500 transition-colors"
                >
                  Brand Identity Design
                </a>
              </li>
              <li>
                <a
                  href="/#service"
                  className="hover:text-brand-500 transition-colors"
                >
                  Social Media Design
                </a>
              </li>
              <li>
                <a
                  href="/#service"
                  className="hover:text-brand-500 transition-colors"
                >
                  Logo Design
                </a>
              </li>
              <li>
                <a
                  href="/#service"
                  className="hover:text-brand-500 transition-colors"
                >
                  Poster Design
                </a>
              </li>
              <li>
                <a
                  href="/#service"
                  className="hover:text-brand-500 transition-colors"
                >
                  Digital Marketing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-brand-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="/#service"
                  className="hover:text-brand-500 transition-colors"
                >
                  Service
                </a>
              </li>
              <li>
                <Link
                  to="/portfolio"
                  className="hover:text-brand-500 transition-colors"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <a
                  href="/#about"
                  className="hover:text-brand-500 transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/#contact"
                  className="hover:text-brand-500 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-white mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Mail size={16} /> agdesign.official@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={16} /> +62 855-5949-6968
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} /> Jakarta, Indonesia
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>© 2025 Gous Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
