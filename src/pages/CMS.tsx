import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";
import CMSContent from "../components/CMS/CMSContent";
import CMSLogin from "../components/CMS/CMSLogin";

const CMS: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/cms/auth?action=logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setIsAuthenticated(false);
  };

  // Light background + delayed top bar while the session is checked (no dark flash, no spinner)
  if (isChecking) {
    return (
      <div className="cms-root min-h-screen bg-paper" role="status" aria-label="Memeriksa sesi">
        <div className="gs-page-loader" aria-hidden="true">
          <div className="gs-page-loader__bar" />
        </div>
      </div>
    );
  }

  return (
    <div className="cms-root min-h-screen bg-paper text-ink selection:bg-violet-200">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CMSLogin onSuccess={() => setIsAuthenticated(true)} />
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
              {/* Local boundary: lazy CMS tabs load inside the layout, not via the app-wide PageLoader */}
              <Suspense fallback={null}>
                <Outlet />
              </Suspense>
            </CMSContent>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CMS;
