import React from "react";
import { LucideIcon } from "lucide-react";

interface CMSStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "brand" | "neutral";
  className?: string;
}

const CMSStatCard: React.FC<CMSStatCardProps> = ({
  label,
  value,
  icon: Icon,
  variant = "brand",
  className = "",
}) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 transition-colors ${className}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center  shrink-0 border ${
        variant === "brand" 
          ? "bg-brand-50 border-brand-100 text-brand-500" 
          : "bg-slate-50 border-slate-100 text-slate-400"
      }`}>
        <Icon size={18} />
      </div>
      <div>
        <p className={`text-[10px] font-bold   ${
          variant === "brand" ? "text-brand-600" : "text-slate-400"
        }`}>
          {label}
        </p>
        <p className="text-lg font-bold text-slate-800 leading-none mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
};

export default CMSStatCard;
