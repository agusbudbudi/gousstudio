import React from "react";
import { Loader2, LucideIcon } from "lucide-react";

interface CMSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "destructive" | "outline-brand";
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
    "flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer";

  // Text buttons get horizontal padding; icon-only ghost/danger stay square
  const hasLabel = children !== undefined && children !== null && children !== false;

  const variantStyles = {
    primary:
      "px-4 py-2 bg-violet-600 hover:bg-violet-700 !text-white border border-violet-600 hover:border-violet-700",
    secondary:
      "px-4 py-2 bg-white border border-ink/15 text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
    ghost: `${hasLabel ? "px-4 py-2" : "p-2"} text-ink/45 hover:text-ink hover:bg-ink/[0.05]`,
    danger: `${hasLabel ? "px-4 py-2" : "p-2"} text-ink/35 hover:text-rose-600 hover:bg-rose-50`,
    // Filled red for confirming irreversible actions (e.g. delete)
    destructive:
      "px-4 py-2 bg-rose-600 hover:bg-rose-700 !text-white border border-rose-600 hover:border-rose-700",
    "outline-brand":
      "px-3 py-1.5 border border-violet-600 text-violet-700 bg-white hover:bg-violet-50",
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
        <Loader2 className="motion-safe:animate-spin shrink-0" size={iconSize} />
      ) : Icon ? (
        <Icon size={iconSize} className="shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default CMSButton;
