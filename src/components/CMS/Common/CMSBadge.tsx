import React from "react";

interface CMSBadgeProps {
  children: React.ReactNode;
  variant?: "status" | "neutral" | "brand";
  status?: string;
  className?: string;
}

const CMSBadge: React.FC<CMSBadgeProps> = ({
  children,
  variant = "neutral",
  status,
  className = "",
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE":
        return "bg-green-50 text-green-700 border-green-200";
      case "IN PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "WAITING FOR PAYMENT":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "REVIEWED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "REVISION":
        return "bg-rose-50 text-rose-500 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const baseStyles =
    "text-xs font-bold px-2 py-0.5 rounded-md border whitespace-nowrap inline-flex items-center justify-center";

  const variantStyles = {
    status: status
      ? getStatusColor(status)
      : "bg-slate-50 text-slate-700 border-slate-200",
    neutral: "bg-slate-50 text-slate-600 border-slate-100",
    brand: "bg-brand-50 text-brand-600 border-brand-100",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default CMSBadge;
