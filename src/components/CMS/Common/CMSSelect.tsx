import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface CMSSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ElementType;
  containerClassName?: string;
}

const CMSSelect = forwardRef<HTMLSelectElement, CMSSelectProps>(
  (
    {
      label,
      error,
      icon: Icon,
      className = "",
      containerClassName = "",
      id,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={`space-y-1.5 ${containerClassName || "w-full"}`}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-600 block ml-1"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <Icon
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none"
            />
          )}
          <select
            id={id}
            ref={ref}
            className={`
              w-full bg-slate-50 border rounded-lg text-sm font-bold py-2
              focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 
              transition-all appearance-none cursor-pointer
              ${Icon ? "pl-8" : "pl-4"} pr-10
              ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200"}
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-brand-500 transition-colors">
            <ChevronDown size={14} />
          </div>
        </div>
        {error && (
          <p className="text-rose-400 text-xs mt-1 ml-1 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

CMSSelect.displayName = "CMSSelect";

export default CMSSelect;
