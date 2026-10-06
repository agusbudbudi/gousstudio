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
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40 transition-colors group-focus-within:text-violet-600" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
        className="w-full rounded-full border border-ink/15 bg-white py-2 pl-10 pr-4 text-sm font-medium text-ink placeholder:text-ink/35 transition-[border-color,box-shadow] duration-200 hover:border-ink/30 focus:border-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-600/15"
      />
    </div>
  );
};

export default CMSSearchBar;
