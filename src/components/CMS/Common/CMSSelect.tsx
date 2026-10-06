import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────── */

interface OptionMeta {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Recursively collect text content from any ReactNode (handles arrays + expressions). */
function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const p = node.props as { children?: React.ReactNode };
    return extractText(p.children);
  }
  return "";
}

/** Walk <option> children (possibly wrapped in <optgroup>) and collect metadata. */
function extractOptions(children: React.ReactNode): OptionMeta[] {
  const result: OptionMeta[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === "option") {
      const p = child.props as React.OptionHTMLAttributes<HTMLOptionElement> & {
        children?: React.ReactNode;
      };
      const textLabel = extractText(p.children).trim();
      result.push({
        value: String(p.value ?? ""),
        label: textLabel || String(p.value ?? ""),
        disabled: p.disabled,
      });
    } else if (child.type === "optgroup") {
      const p = child.props as { children?: React.ReactNode };
      result.push(...extractOptions(p.children));
    }
  });
  return result;
}

/* ──────────────────────────────────────────────────────────────
 * CMSSelect — custom dropdown compatible with react-hook-form
 * ────────────────────────────────────────────────────────────── */

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
      id: idProp,
      children,
      value,
      defaultValue,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;
    const listId = `${id}-list`;

    // ── Controlled / uncontrolled value ────────────────────────
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      String(defaultValue ?? ""),
    );
    const currentValue = isControlled ? String(value ?? "") : internalValue;

    // ── Parse options from <option> children ────────────────────
    const options = extractOptions(children);

    // ── Open state ──────────────────────────────────────────────
    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLUListElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Hidden native <select> for react-hook-form ref
    const nativeRef = useRef<HTMLSelectElement | null>(null);
    const mergedRef = useCallback(
      (el: HTMLSelectElement | null) => {
        nativeRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref)
          (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el;
      },
      [ref],
    );

    // Uncontrolled: react-hook-form writes `el.value` directly (register + reset/setValue)
    // without firing an event, so mirror those writes into internal state.
    useEffect(() => {
      const el = nativeRef.current;
      if (!el || isControlled) return;
      const desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
      if (!desc?.get || !desc.set) return;
      const { get, set } = desc;
      Object.defineProperty(el, "value", {
        configurable: true,
        get: () => get.call(el),
        set: (v: unknown) => {
          set.call(el, v);
          setInternalValue(String(v ?? ""));
        },
      });
      setInternalValue(get.call(el));
      return () => {
        delete (el as { value?: string }).value;
      };
    }, [isControlled]);

    // Keep the native value in step once its <option> exists (options may load after reset)
    useEffect(() => {
      const el = nativeRef.current;
      if (!el || isControlled || el.value === internalValue) return;
      el.value = internalValue;
    });

    // Sync activeIdx when opening
    useEffect(() => {
      if (open) {
        const idx = options.findIndex((o) => o.value === currentValue);
        setActiveIdx(idx >= 0 ? idx : 0);
      }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Scroll active option into view
    useEffect(() => {
      if (!open) return;
      panelRef.current
        ?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }, [activeIdx, open]);

    // Close on outside click
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Derived display label
    const displayLabel = options.find((o) => o.value === currentValue)?.label ?? "";

    // Select a value and fire RHF-compatible synthetic event
    const choose = useCallback(
      (opt: OptionMeta) => {
        if (opt.disabled) return;
        if (!isControlled) setInternalValue(opt.value);

        if (nativeRef.current && onChange) {
          nativeRef.current.value = opt.value;
          const native = nativeRef.current;
          onChange({
            target: native,
            currentTarget: native,
            bubbles: true,
            cancelBubble: false,
            cancelable: false,
            composed: false,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: true,
            preventDefault: () => {},
            stopPropagation: () => {},
            stopImmediatePropagation: () => {},
            timeStamp: Date.now(),
            type: "change",
            nativeEvent: new Event("change"),
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            persist: () => {},
          } as React.ChangeEvent<HTMLSelectElement>);
        }

        setOpen(false);
        triggerRef.current?.focus();
      },
      [isControlled, onChange],
    );

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!open) {
        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIdx((i) => {
            let next = i + 1;
            while (next < options.length && options[next]?.disabled) next++;
            return next < options.length ? next : i;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIdx((i) => {
            let prev = i - 1;
            while (prev >= 0 && options[prev]?.disabled) prev--;
            return prev >= 0 ? prev : i;
          });
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (options[activeIdx]) choose(options[activeIdx]);
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
          break;
        case "Tab":
          setOpen(false);
          break;
        default: {
          const char = e.key.toLowerCase();
          if (char.length === 1) {
            const enabledIdx = options.findIndex(
              (o) => !o.disabled && o.label.toLowerCase().startsWith(char),
            );
            if (enabledIdx >= 0) setActiveIdx(enabledIdx);
          }
        }
      }
    };

    return (
      <div
        className={`space-y-1.5 ${containerClassName || "w-full"}`}
        ref={containerRef}
      >
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-ink/70 block ml-1"
          >
            {label}
          </label>
        )}

        {/* ── Trigger ── */}
        <div className="relative group">
          {Icon && (
            <Icon
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 group-focus-within:text-violet-600 transition-colors pointer-events-none z-[1]"
            />
          )}

          <button
            ref={triggerRef}
            id={id}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onClick={() => !disabled && setOpen((o) => !o)}
            className={`
              w-full bg-white border rounded-[14px] text-sm font-semibold text-left
              focus:outline-none focus:ring-4 focus:ring-violet-600/15 focus:border-violet-600
              transition-[border-color,box-shadow] duration-200 cursor-pointer
              flex items-center justify-between gap-2 py-2
              ${Icon ? "pl-8" : "pl-4"} pr-3
              ${
                error
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                  : "border-ink/15 hover:border-ink/30"
              }
              ${disabled ? "opacity-50 !cursor-not-allowed bg-ink/5" : ""}
              ${className}
            `}
          >
            <span
              className={`flex-1 truncate min-w-0 ${
                !displayLabel ? "text-ink/35" : "text-ink"
              }`}
            >
              {displayLabel || "Pilih..."}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-ink/40 transition-transform duration-200 ${
                open ? "rotate-180 text-violet-600" : ""
              }`}
            />
          </button>
        </div>

        {/* ── Dropdown panel ── */}
        {open && !disabled && (
          <div className="relative z-50">
            <ul
              ref={panelRef}
              id={listId}
              role="listbox"
              aria-label={label}
              onKeyDown={handleKeyDown}
              className="absolute left-0 right-0 top-1 max-h-[220px] overflow-y-auto
                         custom-scrollbar rounded-[14px] border border-ink/10 bg-white py-1.5
                         shadow-[0_16px_40px_-12px_rgb(11_10_18/0.22)] cms-pop-in"
            >
              {options.length === 0 && (
                <li className="px-4 py-4 text-center text-xs text-muted">
                  Tidak ada opsi
                </li>
              )}
              {options.map((opt, i) => {
                const isSelected = opt.value === currentValue;
                const isActive = i === activeIdx;
                return (
                  <li
                    key={`${opt.value}-${i}`}
                    id={`${listId}-opt-${i}`}
                    data-idx={i}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(opt)}
                    onMouseEnter={() => !opt.disabled && setActiveIdx(i)}
                    className={`
                      mx-1.5 flex cursor-pointer items-center justify-between gap-3
                      rounded-[10px] px-3 py-2.5 transition-colors duration-100
                      ${isActive && !opt.disabled ? "bg-violet-50" : ""}
                      ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                  >
                    <span
                      className={`text-sm truncate ${
                        isSelected
                          ? "font-bold text-violet-700"
                          : "font-medium text-ink"
                      }`}
                    >
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check size={14} className="shrink-0 text-violet-600" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Hidden native <select> for react-hook-form ref + form submission */}
        <select
          ref={mergedRef}
          id={`${id}-native`}
          aria-hidden="true"
          tabIndex={-1}
          {...(isControlled
            ? { value: currentValue, onChange: () => {} }
            : { defaultValue: internalValue })}
          disabled={disabled}
          className="sr-only"
          {...props}
        >
          {children}
        </select>

        {error && (
          <p role="alert" className="text-rose-600 text-xs mt-1 ml-1 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  },
);

CMSSelect.displayName = "CMSSelect";

export default CMSSelect;
