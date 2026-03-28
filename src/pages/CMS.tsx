import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, AlertCircle } from "lucide-react";
import { Outlet } from "react-router-dom";
import CMSContent from "../components/CMS/CMSContent";

const CMS: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/cms/auth?action=check");
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/cms/auth?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setError("");
      } else {
        setError(data.message || "Password tidak valid. Silakan coba lagi.");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan koneksi server.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/cms/auth?action=logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setIsAuthenticated(false);
    setPassword("");
  };

  if (isChecking) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-brand-500/10">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden"
          >
            {/* Ambient Background Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-[380px] p-6 sm:p-8 rounded-2xl border border-white bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 relative z-10 transition-all duration-300">
              <div className="flex flex-col items-center mb-8">
                <div className="w-auto h-20 flex items-center justify-center mb-5 relative">
                  <img
                    src="/img/logo.png"
                    alt="Gous Studio Logo"
                    className="w-full h-10 object-contain relative z-10"
                  />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-slate-500 text-sm mt-2 text-center font-medium leading-relaxed max-w-[240px]">
                  Sign in to manage your portfolio and view incoming orders.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
                    Secure Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm font-medium focus:bg-white focus:shadow-sm"
                      autoFocus
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -5 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -5 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 text-red-600 text-[11px] bg-red-50/80 px-4 py-3 rounded-xl font-medium backdrop-blur-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98] group relative overflow-hidden flex items-center justify-center mt-2 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 tracking-wide">
                    Access Dashboard
                  </span>
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-screen overflow-hidden"
          >
            {/* CMS Sidebar & Content will be handled by CMSContent */}
            <CMSContent onLogout={handleLogout}>
              <Outlet />
            </CMSContent>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CMS;
