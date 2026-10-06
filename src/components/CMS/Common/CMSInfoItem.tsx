import React from "react";
import { LucideIcon } from "lucide-react";

interface CMSInfoItemProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  className?: string;
}

const CMSInfoItem: React.FC<CMSInfoItemProps> = ({
  label,
  value,
  icon: Icon,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="gs-label text-[10px] text-muted block px-1">{label}</h3>
      <div className="flex items-center gap-3 p-2 bg-paper border border-ink/10 rounded-[10px] group transition-colors hover:border-ink/25">
        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0 border border-ink/10 text-ink/45 group-hover:text-violet-600 transition-colors">
          <Icon size={12} />
        </div>
        <div className="text-sm font-semibold text-ink truncate">
          {value || "—"}
        </div>
      </div>
    </div>
  );
};

export default CMSInfoItem;
