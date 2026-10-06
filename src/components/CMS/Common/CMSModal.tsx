import React, { useEffect, useId } from "react";
import { X } from "lucide-react";

interface CMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

const CMSModal: React.FC<CMSModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-2xl",
}) => {
  const titleId = useId();

  // Close on Escape (same as clicking the backdrop)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-5">
      {/* Backdrop */}
      <div
        className="cms-modal-backdrop absolute inset-0 cursor-pointer bg-ink/45"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`cms-modal-panel relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[20px] border border-ink/10 bg-white ${maxWidth}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink/10 bg-white px-6 py-4">
          <h2 id={titleId} className="gs-display text-[20px] font-extrabold leading-tight text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/45 transition-colors duration-200 hover:bg-ink/[0.05] hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-ink/10 bg-paper px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSModal;
