import React from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { useCMSNav } from "./CMSContent";

interface CMSHeaderProps {
  title: React.ReactNode;
  countText?: string;
  children?: React.ReactNode;
  onBack?: () => void;
}

// Fixed page header aligned with the sidebar wordmark row (58px). Paper/80 + blur like the landing navbar.
const CMSHeader: React.FC<CMSHeaderProps> = ({
  title,
  countText,
  children,
  onBack,
}) => {
  const nav = useCMSNav();
  return (
    <header
      className="fixed top-0 right-0 z-40 flex h-[58px] items-center justify-between gap-3 border-b border-ink/10 bg-paper/80 px-4 backdrop-blur-md lg:gap-4 lg:px-6 transition-[left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ left: "var(--sidebar-width, 13.5rem)" }}
    >
      <div className="flex min-w-0 items-center gap-3">
        {nav && (
          <button
            onClick={nav.openNav}
            aria-label="Buka menu"
            aria-controls="cms-sidebar"
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/[0.05] hover:text-ink lg:hidden"
          >
            <Menu size={18} />
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Kembali"
            title="Kembali"
            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-white text-ink/60 transition-colors duration-200 hover:border-ink/30 hover:text-ink"
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>
        )}
        <h1 className="gs-display truncate text-[22px] font-extrabold leading-none text-ink">{title}</h1>
        {countText && (
          <span className="gs-label hidden shrink-0 rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[10px] text-muted sm:inline">
            {countText}
          </span>
        )}
      </div>

      {children && (
        <div className="hide-scrollbar -mr-4 flex min-w-0 shrink items-center gap-2 overflow-x-auto pr-4 lg:mr-0 lg:shrink-0 lg:overflow-visible lg:pr-0">
          {children}
        </div>
      )}
    </header>
  );
};

export default CMSHeader;
