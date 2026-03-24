import React from "react";

interface CMSHeaderProps {
  title: string;
  countText?: string;
  children?: React.ReactNode;
}

const CMSHeader: React.FC<CMSHeaderProps> = ({
  title,
  countText,
  children,
}) => {
  return (
    <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-30 flex flex-col md:flex-row md:items-center justify-between py-3 mb-4 gap-4 border-b border-slate-100 -mx-4 px-4 md:-mx-8 md:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        {countText && (
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60 transition-all">
            {countText}
          </span>
        )}
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
};

export default CMSHeader;
