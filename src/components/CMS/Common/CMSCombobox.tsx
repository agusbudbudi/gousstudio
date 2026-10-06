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
        <div 
          className="absolute top-[calc(100%+8px)] z-50 w-full border max-h-[210px] overflow-y-auto custom-scrollbar cms-pop-in overflow-hidden rounded-[14px] bg-white border-ink/10 shadow-[0_16px_32px_-16px_rgb(11_10_18/0.2)]"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-xs font-medium text-muted">
                {notFoundText}
              </p>
              {onCreateNew && createNewText && value && (
                <button
                  type="button"
                  onClick={() => {
                    onCreateNew(value);
                    setIsOpen(false);
                  }}
                  className="mt-3 text-xs font-bold text-violet-600 cursor-pointer py-2 px-4 border border-violet-600/30 rounded-[14px] hover:bg-violet-600/10 transition-colors"
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
                className="w-full text-left px-5 py-4 transition-all flex items-center justify-between group border-b last:border-0 cursor-pointer border-ink/[0.04] hover:bg-violet-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold transition-colors text-ink group-hover:text-violet-700">
                      {opt.label}
                    </span>
                    {opt.rightElement}
                  </div>
                  {opt.description && (
                    <p className="text-[11px] font-medium mt-0.5 text-muted">
                      {opt.description}
                    </p>
                  )}
                </div>
                <ChevronRight
                  size={14}
                  className="transition-all group-hover:translate-x-0.5 text-ink/20 group-hover:text-violet-400"
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
