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
    <div className={`bg-white border border-ink/10 rounded-[16px] p-4 flex items-center gap-3 transition-colors ${className}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
        variant === "brand"
          ? "bg-violet-50 border-violet-100 text-violet-600"
          : "bg-paper border-ink/10 text-ink/40"
      }`}>
        <Icon size={18} />
      </div>
      <div>
        <p className={`gs-label text-[10px] ${
          variant === "brand" ? "text-violet-700" : "text-muted"
        }`}>
          {label}
        </p>
        <p className="gs-display text-[22px] font-extrabold text-ink mt-1">
          {value}
        </p>
      </div>
    </div>
  );
};

export default CMSStatCard;
