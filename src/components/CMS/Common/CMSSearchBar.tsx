import React from "react";
import { Search } from "lucide-react";

interface CMSSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CMSSearchBar: React.FC<CMSSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative group ${className || "w-64"}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 w-full transition-all placeholder:text-slate-300"
      />
    </div>
  );
};

export default CMSSearchBar;
