import React from "react";
import { ArrowLeft } from "lucide-react";

interface CMSHeaderProps {
  title: React.ReactNode;
  countText?: string;
  children?: React.ReactNode;
  onBack?: () => void;
}

const CMSHeader: React.FC<CMSHeaderProps> = ({
  title,
  countText,
  children,
  onBack,
}) => {
  return (
    <header 
      className="fixed top-0 right-0 h-[58px] bg-white/80 backdrop-blur-md z-40 flex items-center justify-between border-b border-slate-200 px-8 gap-4 transition-all duration-300"
      style={{ left: "var(--sidebar-width, 12rem)" }}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-brand-500 hover:border-brand-200 hover:bg-brand-50 transition-all cursor-pointer group shrink-0"
            title="Kembali"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>
        )}
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {countText && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60 transition-all">
            {countText}
          </span>
        )}
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
};

export default CMSHeader;
