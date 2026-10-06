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
  iconClassName = "w-16 h-16 bg-white border border-ink/10 text-ink/35 rounded-[20px]",
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
      <p className="gs-display mb-2 text-[22px] font-extrabold text-ink">{title}</p>
      {description && (
        <p className="text-muted text-sm max-w-[320px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default CMSEmptyState;
