import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface CMSEmptyStateProps {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  containerClassName?: string;
  iconClassName?: string;
}

const CMSEmptyState: React.FC<CMSEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  containerClassName = "py-32",
  iconClassName = "w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 ${containerClassName}`}
    >
      <div
        className={`flex items-center justify-center mb-5 ${iconClassName}`}
      >
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <p className="text-slate-700 font-bold mb-1.5 text-base">{title}</p>
      {description && (
        <p className="text-slate-500 text-sm max-w-[300px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default CMSEmptyState;
