import React from "react";
import { LucideIcon } from "lucide-react";

interface CMSViewItemProps {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

const CMSViewItem: React.FC<CMSViewItemProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  className = "",
}) => {
  return (
    <div
      className={`flex justify-between py-2.5 px-1 border-b border-slate-50 last:border-0 ${className}`}
    >
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="flex flex-col items-end gap-1 text-right">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-slate-500" />}
          <span className="text-sm font-bold text-slate-800 whitespace-normal">
            {value || "—"}
          </span>
        </div>
        {subValue && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-300">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSViewItem;
