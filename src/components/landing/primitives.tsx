import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { waLink, WA_DEFAULT_MESSAGE } from "./content";

export const EASE = [0.16, 1, 0.3, 1] as const;

export const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <div className={`mx-auto w-full max-w-[1320px] px-5 md:px-8 xl:px-12 ${className}`}>
    {children}
  </div>
);

export const Reveal: React.FC<
  React.PropsWithChildren<{ className?: string; delay?: number; as?: "div" | "li" }>
> = ({ children, className, delay = 0, as = "div" }) => {
  const reduce = useReducedMotion();
  const Comp = as === "li" ? motion.li : motion.div;
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
};

const LOGO_SIZES = {
  sm: { mark: "h-7 w-7", text: "text-[20px]" },
  md: { mark: "h-8 w-8", text: "text-[22px]" },
  lg: { mark: "h-9 w-9", text: "text-2xl" },
};

/**
 * Gous Studio logo: G mark + "GousStudio" wordmark. `onDark` switches to the light-violet mark and
 * paper text for ink backgrounds (DESIGN.md §2.2). Assets live in /public/brand (generated from
 * /public/gous-studio-logo.png, recolored to the brand violet).
 */
export const BrandLogo: React.FC<{
  onDark?: boolean;
  size?: keyof typeof LOGO_SIZES;
  wordmark?: boolean;
  className?: string;
}> = ({ onDark = false, size = "md", wordmark = true, className = "" }) => (
  <span className={`inline-flex items-center ${className}`}>
    <img
      src={onDark ? "/brand/logo-mark-light.png" : "/brand/logo-mark.png"}
      alt={wordmark ? "" : "Gous Studio"}
      width={64}
      height={64}
      className={`${LOGO_SIZES[size].mark} shrink-0 object-contain`}
    />
    {wordmark && (
      <span className={`gs-display font-extrabold tracking-tight ${LOGO_SIZES[size].text} ${onDark ? "text-paper" : "text-ink"}`}>
        Gous<span className={onDark ? "text-violet-400" : "text-violet-600"}>Studio</span>
      </span>
    )}
  </span>
);

export const Eyebrow: React.FC<{ index?: string; children: React.ReactNode; className?: string }> = ({
  index,
  children,
  className = "",
}) => (
  <p className={`gs-label flex items-center gap-3 ${className}`}>
    {index && <span className="text-violet-600">{index}</span>}
    {index && <span aria-hidden className="h-px w-6 bg-current opacity-30" />}
    <span>{children}</span>
  </p>
);

export const SectionHeader: React.FC<{
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  dark?: boolean;
  id?: string;
}> = ({ index, eyebrow, title, description, action, dark = false, id }) => (
  <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-8">
    <Reveal className="md:col-span-8">
      <Eyebrow index={index} className={dark ? "text-paper/60" : "text-muted"}>
        {eyebrow}
      </Eyebrow>
      <h2
        id={id}
        className={`gs-display mt-5 text-[clamp(2.25rem,5.5vw,4.25rem)] font-extrabold ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        {title}
      </h2>
    </Reveal>
    {(description || action) && (
      <Reveal className="flex flex-col gap-4 md:col-span-4 md:items-start" delay={0.1}>
        {description && (
          <p className={`max-w-[42ch] text-base leading-relaxed ${dark ? "text-paper/70" : "text-muted"}`}>
            {description}
          </p>
        )}
        {action}
      </Reveal>
    )}
  </div>
);

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.44-9.43a9.38 9.38 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.65l6.05-1.59a11.33 11.33 0 0 0 5.4 1.38h.01c6.26 0 11.35-5.1 11.35-11.36 0-3.03-1.18-5.88-3.33-8.03" />
  </svg>
);

type WaButtonProps = {
  message?: string;
  context: string;
  children: React.ReactNode;
  variant?: "primary" | "light" | "outline" | "outline-light";
  size?: "md" | "lg";
  className?: string;
  icon?: "wa" | "arrow" | "none";
};

const VARIANTS: Record<NonNullable<WaButtonProps["variant"]>, string> = {
  primary: "bg-violet-600 text-[#fff] hover:bg-violet-700",
  light: "bg-paper text-ink hover:bg-violet-100",
  outline: "border border-ink/15 text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
  "outline-light": "border border-paper/20 text-paper hover:border-paper/50 hover:bg-paper/[0.06]",
};

export const buttonClass = (
  variant: NonNullable<WaButtonProps["variant"]> = "primary",
  size: NonNullable<WaButtonProps["size"]> = "md",
) =>
  `group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-semibold transition-[background-color,border-color,transform] duration-200 active:scale-[0.98] ${
    size === "lg" ? "h-14 px-7 text-base" : "h-12 px-6 text-[15px]"
  } ${VARIANTS[variant]}`;

export const WaButton: React.FC<WaButtonProps> = ({
  message = WA_DEFAULT_MESSAGE,
  context,
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon = "wa",
}) => (
  <a
    href={waLink(message, context)}
    target="_blank"
    rel="noopener noreferrer"
    data-wa-context={context}
    className={`${buttonClass(variant, size)} ${className}`}
  >
    {icon === "wa" && <WhatsAppIcon className="h-5 w-5 shrink-0" />}
    <span>{children}</span>
    {icon === "arrow" && (
      <ArrowUpRight
        size={18}
        className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    )}
  </a>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-2xl bg-paper-300/60 ${className}`} />
);

// Portfolio image with a sized placeholder (no collapse / layout shift), fade-in, and error fallback.
export const WorkImage: React.FC<{
  src: string;
  alt: string;
  fallbackLabel?: string;
  className?: string;
  placeholderClassName?: string;
  eager?: boolean;
  onError?: () => void;
}> = ({ src, alt, fallbackLabel, className = "", placeholderClassName = "aspect-[4/5]", eager = false, onError }) => {
  const [state, setState] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");

  useEffect(() => {
    if (!src) {
      onError?.();
    }
  }, [src, onError]);

  const handleError = () => {
    setState("error");
    onError?.();
  };

  if (state === "error") {
    if (onError) return null;
    return (
      <div className={`flex h-full w-full items-center justify-center bg-paper-200 p-6 ${placeholderClassName}`}>
        <span className="gs-display text-center text-2xl font-bold text-ink/25">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <>
      {state === "loading" && <div aria-hidden className={`w-full animate-pulse bg-paper-300/60 ${placeholderClassName}`} />}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        onLoad={() => setState("loaded")}
        onError={handleError}
        className={`${className} transition-opacity duration-500 ${state === "loaded" ? "opacity-100" : "absolute opacity-0"}`}
      />
    </>
  );
};
