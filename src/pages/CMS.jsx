import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, LogOut, Lock, Globe, AlertCircle } from 'lucide-react';
import CMSContent from '../components/CMS/CMSContent';

const CMS = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  const envPassword = import.meta.env.VITE_CMS_PASSWORD;

  useEffect(() => {
    const savedPass = localStorage.getItem('cms_token');
    if (savedPass && savedPass === envPassword) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, [envPassword]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === envPassword) {
      localStorage.setItem('cms_token', password);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Password tidak valid. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cms_token');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isChecking) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-brand-500/10">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-4"
          >
            <div className="w-full max-w-md p-10 rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col items-center mb-10">
                <div className="w-20 h-20 bg-brand-500 shadow-xl shadow-brand-500/20 rounded-3xl flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Portfolio CMS Login
                </h1>
                <p className="text-slate-400 text-sm mt-3 text-center font-medium">
                  Selamat datang kembali! Silakan masukkan password untuk mengelola portfolio Anda.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">CMS Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-slate-200 text-lg font-medium"
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-red-500 text-sm bg-red-50 p-4 rounded-2xl border border-red-100 font-medium"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full py-5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all shadow-[0_10px_30px_rgba(255,119,57,0.3)] active:scale-[0.98] text-lg"
                >
                  Buka Dashboard
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-300 uppercase tracking-[0.2em] font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  SECURE ACCESS
                </div>
                <div className="opacity-60">PRODUCTION READY V1</div>
              </div>
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
            <CMSContent onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CMS;
