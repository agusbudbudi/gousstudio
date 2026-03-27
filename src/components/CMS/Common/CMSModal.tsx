import React, { useEffect } from "react";
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative bg-white w-full ${maxWidth} rounded-xl  flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20`}
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div>
            <h2 className="text-md font-bold text-slate-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 group cursor-pointer"
          >
            <X
              size={18}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end gap-3 sticky bottom-0 z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSModal;
