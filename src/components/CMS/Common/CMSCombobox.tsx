import React, { useState, useRef, useEffect } from "react";
import CMSInput from "./CMSInput";
import { ChevronRight } from "lucide-react";

export interface ComboboxOption {
  label: string;
  value: string;
  description?: string;
  rightElement?: React.ReactNode;
}

interface CMSComboboxProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectOption?: (option: ComboboxOption) => void;
  options: ComboboxOption[];
  leftIcon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  onCreateNew?: (inputValue: string) => void;
  createNewText?: (inputValue: string) => string;
  notFoundText?: string;
  variant?: "cms" | "glass";
}

const CMSCombobox: React.FC<CMSComboboxProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSelectOption,
  options,
  leftIcon,
  error,
  disabled,
  onCreateNew,
  createNewText,
  notFoundText = "Tidak ditemukan",
  variant = "cms",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isGlass = variant === "glass";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <div className="relative" ref={containerRef}>
      <CMSInput
        label={label}
        leftIcon={leftIcon}
        error={error}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        variant={variant}
        onChange={(e) => {
          onChange(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
      />

      {isOpen && !disabled && (
        <div 
          className={`absolute top-[calc(100%+8px)] z-50 w-full border rounded-2xl max-h-[210px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 shadow-2xl overflow-hidden ${
            isGlass 
              ? "bg-[var(--color-card)] border-white/10 backdrop-blur-xl" 
              : "bg-white border-slate-200"
          }`}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className={`text-xs font-medium ${isGlass ? "text-[var(--color-text-muted)]" : "text-slate-500"}`}>
                {notFoundText}
              </p>
              {onCreateNew && createNewText && value && (
                <button
                  type="button"
                  onClick={() => {
                    onCreateNew(value);
                    setIsOpen(false);
                  }}
                  className="mt-3 text-xs font-bold text-brand-500 cursor-pointer py-2 px-4 border border-brand-500/30 rounded-xl hover:bg-brand-500/10 transition-colors"
                >
                  {createNewText(value)}
                </button>
              )}
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.label);
                  if (onSelectOption) onSelectOption(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-4 transition-all flex items-center justify-between group border-b last:border-0 cursor-pointer ${
                  isGlass
                    ? "border-white/5 hover:bg-white/5"
                    : "border-slate-50 hover:bg-brand-50"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold transition-colors ${
                      isGlass 
                        ? "text-[var(--color-text-title)] group-hover:text-brand-500" 
                        : "text-slate-700 group-hover:text-brand-600"
                    }`}>
                      {opt.label}
                    </span>
                    {opt.rightElement}
                  </div>
                  {opt.description && (
                    <p className={`text-[11px] font-medium mt-0.5 ${isGlass ? "text-[var(--color-text-muted)]" : "text-slate-500"}`}>
                      {opt.description}
                    </p>
                  )}
                </div>
                <ChevronRight
                  size={14}
                  className={`transition-all group-hover:translate-x-0.5 ${
                    isGlass ? "text-white/20 group-hover:text-brand-500" : "text-slate-200 group-hover:text-brand-400"
                  }`}
                />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CMSCombobox;
