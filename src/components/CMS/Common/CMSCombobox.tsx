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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        onChange={(e) => {
          onChange(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
        }}
      />

      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+4px)] z-50 w-full bg-white border border-slate-200 rounded-lg max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 shadow-lg">
          {filteredOptions.length === 0 ? (
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-slate-400 font-medium">
                {notFoundText}
              </p>
              {onCreateNew && createNewText && value && (
                <button
                  type="button"
                  onClick={() => {
                    onCreateNew(value);
                    setIsOpen(false);
                  }}
                  className="mt-2 text-xs font-bold text-brand-500 cursor-pointer py-1 px-2 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
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
                className="w-full text-left px-5 py-3 hover:bg-brand-50 transition-all flex items-center justify-between group border-b border-slate-50 last:border-0 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-brand-600 transition-colors">
                      {opt.label}
                    </span>
                    {opt.rightElement}
                  </div>
                  {opt.description && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      {opt.description}
                    </p>
                  )}
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-200 group-hover:text-brand-400 transition-all group-hover:translate-x-0.5"
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
