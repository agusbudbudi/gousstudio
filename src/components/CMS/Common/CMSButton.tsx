import React from "react";
import { Loader2, LucideIcon } from "lucide-react";

interface CMSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline-brand";
  loading?: boolean;
  icon?: LucideIcon;
  iconSize?: number;
  fullWidth?: boolean;
}

const CMSButton: React.FC<CMSButtonProps> = ({
  children,
  variant = "primary",
  loading = false,
  icon: Icon,
  iconSize = 16,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "flex items-center justify-center gap-2 transition-colors font-bold text-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variantStyles = {
    primary:
      "px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg  border border-brand-500",
    secondary:
      "px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg  font-bold",
    ghost:
      "p-2 text-slate-300 hover:text-brand-500 hover:bg-brand-50 rounded-lg",
    danger:
      "p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg",
    "outline-brand":
      "px-3 py-1.5 border border-brand-500 text-brand-600 bg-white hover:bg-brand-50 rounded-lg  ",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={iconSize} />
      ) : Icon ? (
        <Icon size={iconSize} className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default CMSButton;
