import React, { forwardRef } from "react";

interface CMSInputProps extends Omit<React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
>, 'value'> {
  label?: string;
  labelRight?: React.ReactNode;
  error?: string;
  isTextArea?: boolean;
  rows?: number;
  leftIcon?: React.ReactNode;
  isBold?: boolean;
  value?: string | number | readonly string[] | null;
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

  
    // Only control the field when a `value` prop is actually passed (e.g. CMSCombobox).
    // react-hook-form's register() is uncontrolled and passes no value — forcing value=""
    // there made every registered field impossible to type in.
    const { value: rawValue, ...restProps } = props;
    const valueProps = "value" in props ? { value: rawValue ?? "" } : {};

    const inputStyles = `
      w-full ${leftIcon ? "pl-12 pr-4" : "px-4"} ${isTextArea ? "py-3" : "h-[48px] py-0"} rounded-[14px] text-sm ${isBold ? "font-bold" : "font-medium"} 
      focus:outline-none transition-[border-color,box-shadow,background-color] duration-200 border
      bg-white border-ink/15 hover:border-ink/30 text-ink placeholder:text-ink/30 focus:ring-4 focus:!border-violet-600 focus:ring-violet-600/15
      ${error ? "border-rose-500 focus:!border-rose-500 focus:ring-rose-500/10" : ""}
      ${className}
    `;

    return (
      <div className="space-y-1.5 w-full">
        {(label || labelRight) && (
          <div className="flex items-center justify-between px-1">
            {label && (
              <label
                htmlFor={id}
                className="text-sm font-medium text-ink/70 block"
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
              className={`absolute left-4 ${isTextArea ? "top-3.5" : "top-1/2 -translate-y-1/2"} flex items-center justify-center text-ink/35 group-focus-within:text-violet-600 transition-colors pointer-events-none`}
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
                else if (ref)
                  (ref as React.MutableRefObject<any>).current = node;
                if (node) {
                  // Delay slightly to ensure content is fully rendered
                  setTimeout(() => {
                    node.style.height = "auto";
                    node.style.height = `${node.scrollHeight}px`;
                  }, 0);
                }
              }}
              className={`${inputStyles} resize-none leading-relaxed overflow-hidden`}
              {...(restProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              {...valueProps}
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
              {...(restProps as React.InputHTMLAttributes<HTMLInputElement>)}
              {...valueProps}
            />
          )}
        </div>
        {error && (
          <p role="alert" className="text-rose-600 text-xs mt-1 ml-1 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

CMSInput.displayName = "CMSInput";

export default CMSInput;
