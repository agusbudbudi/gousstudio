import React from "react";
import { AlertCircle, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CMSButton from "./CMSButton";

interface CMSAlertBannerProps {
  isVisible: boolean;
  message?: string;
  onSave: () => void;
  isSaving?: boolean;
}

const CMSAlertBanner: React.FC<CMSAlertBannerProps> = ({
  isVisible,
  message = "Ada perubahan yang belum disimpan ke database.",
  onSave,
  isSaving = false,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0, y: -20 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="overflow-hidden"
        >
          <div className=" mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4 shadow-sm shadow-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 leading-none mb-1">
                  Unsaved Changes
                </p>
                <p className="text-xs text-amber-700/80 font-medium">
                  {message}
                </p>
              </div>
            </div>

            <CMSButton
              variant="primary"
              onClick={onSave}
              loading={isSaving}
              icon={Save}
              className="!bg-amber-600 hover:!bg-amber-700 !border-none !shadow-amber-600/20 font-bold shrink-0"
            >
              Simpan Sekarang
            </CMSButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CMSAlertBanner;
