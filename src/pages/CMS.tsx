import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  AlertCircle,
} from "lucide-react";
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
        const res = await fetch('/api/cms/auth?action=check');
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
      const res = await fetch('/api/cms/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
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
      await fetch('/api/cms/auth?action=logout', { method: 'POST' });
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
            className="flex flex-col items-center justify-center min-h-screen p-4"
          >
            <div className="w-full max-w-sm p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 bg-brand-500 shadow-lg shadow-brand-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Portfolio CMS Login
                </h1>
                <p className="text-slate-400 text-[11px] mt-2 text-center font-medium leading-relaxed max-w-[240px]">
                  Silakan masukkan password untuk mengelola portfolio Anda.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                    CMS Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-slate-300 text-sm font-medium"
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-red-500 text-[11px] bg-red-50 px-3 py-2 rounded-lg border border-red-100 font-medium"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-brand-500/10 active:scale-[0.98]"
                >
                  Buka Dashboard
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
