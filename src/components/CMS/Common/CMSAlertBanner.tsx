import React from "react";
import { Save } from "lucide-react";
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
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div
            role="status"
            className="mt-4 flex items-center justify-between gap-4 rounded-[14px] border border-ink/10 bg-white py-2.5 pl-4 pr-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-spark" aria-hidden />
              <p className="truncate text-sm text-ink">
                <span className="font-semibold">Belum disimpan.</span>{" "}
                <span className="text-muted">{message}</span>
              </p>
            </div>

            <CMSButton
              variant="primary"
              onClick={onSave}
              loading={isSaving}
              icon={Save}
              className="shrink-0"
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
