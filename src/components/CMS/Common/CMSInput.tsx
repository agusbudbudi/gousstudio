import React, { forwardRef } from "react";

interface CMSInputProps extends React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  label?: string;
  labelRight?: React.ReactNode;
  error?: string;
  isTextArea?: boolean;
  rows?: number;
  leftIcon?: React.ReactNode;
  isBold?: boolean;
}

const CMSInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  CMSInputProps
>(
  (
    {
      label,
      labelRight,
      error,
      isTextArea = false,
      leftIcon,
      isBold = false,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useEffect(() => {
      if (isTextArea && internalRef.current) {
        internalRef.current.style.height = "auto";
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    }, [isTextArea, props.value]);

    const inputStyles = `
      w-full ${leftIcon ? "pl-10 pr-4" : "px-4"} ${isTextArea ? "py-2.5" : "h-[42px] py-0"} bg-slate-50 border rounded-lg text-sm ${isBold ? "font-bold" : "font-medium"} 
      focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 
      transition-all placeholder:text-slate-400
      ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200"}
      ${className}
    `;

    return (
      <div className="space-y-1.5 w-full">
        {(label || labelRight) && (
          <div className="flex items-center justify-between px-1">
            {label && (
              <label
                htmlFor={id}
                className="text-sm font-medium text-slate-600 block"
              >
                {label}
              </label>
            )}
            {labelRight && (
              <div className="flex items-center">{labelRight}</div>
            )}
          </div>
        )}
        <div className="relative group">
          {leftIcon && (
            <div
              className={`absolute left-3.5 ${isTextArea ? "top-3.5" : "top-1/2 -translate-y-1/2"} flex items-center justify-center text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none`}
            >
              {leftIcon}
            </div>
          )}
          {isTextArea ? (
            <textarea
              id={id}
              ref={(node) => {
                internalRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) (ref as React.MutableRefObject<any>).current = node;
                if (node) {
                  // Delay slightly to ensure content is fully rendered
                  setTimeout(() => {
                    node.style.height = "auto";
                    node.style.height = `${node.scrollHeight}px`;
                  }, 0);
                }
              }}
              className={`${inputStyles} resize-none leading-relaxed overflow-hidden`}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              onInput={(e) => {
                const target = e.currentTarget;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
                if (props.onInput) props.onInput(e);
              }}
            />
          ) : (
            <input
              id={id}
              ref={ref as React.Ref<HTMLInputElement>}
              className={inputStyles}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
        </div>
        {error && (
          <p className="text-rose-400 text-xs mt-1 ml-1 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

CMSInput.displayName = "CMSInput";

export default CMSInput;
