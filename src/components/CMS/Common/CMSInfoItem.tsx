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
      <h3 className="text-[10px] font-bold text-slate-500 block px-1 uppercase tracking-wider">{label}</h3>
      <div className="flex items-center gap-3 p-2 bg-slate-50/50 border border-slate-100/80 rounded-lg group transition-all hover:border-brand-200">
        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100 text-slate-500 group-hover:text-brand-500 transition-colors">
          <Icon size={12} />
        </div>
        <div className="text-sm font-bold text-slate-800 truncate">
          {value || "—"}
        </div>
      </div>
    </div>
  );
};

export default CMSInfoItem;
