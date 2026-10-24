import * as React from "react";
import { cn } from "@/lib/utils";

export const PageTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h1
    className={cn(
      "font-heading text-2xl sm:text-3xl font-bold tracking-tight text-charcoal leading-tight",
      className
    )}
    {...props}
  >
    {children}
  </h1>
);

export const SectionHeading: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h2
    className={cn(
      "font-heading text-xl sm:text-2xl font-semibold tracking-tight text-charcoal leading-snug",
      className
    )}
    {...props}
  >
    {children}
  </h2>
);

export const SubsectionHeading: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={cn(
      "font-heading text-base sm:text-lg font-semibold text-charcoal leading-snug",
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const BodyText: React.FC<
  React.HTMLAttributes<HTMLParagraphElement> & { size?: "base" | "sm" | "xs" }
> = ({ className, size = "base", children, ...props }) => {
  const sizeClasses = {
    base: "text-sm sm:text-base leading-relaxed text-charcoal font-body",
    sm: "text-xs sm:text-sm leading-normal text-charcoal font-body",
    xs: "text-xs leading-tight text-charcoal font-body",
  };

  return (
    <p className={cn(sizeClasses[size], className)} {...props}>
      {children}
    </p>
  );
};

export const SecondaryText: React.FC<
  React.HTMLAttributes<HTMLParagraphElement> & { size?: "base" | "sm" | "xs" }
> = ({ className, size = "sm", children, ...props }) => {
  const sizeClasses = {
    base: "text-sm sm:text-base leading-relaxed text-slate-gray font-body",
    sm: "text-xs sm:text-sm leading-normal text-slate-gray font-body",
    xs: "text-xs leading-tight text-slate-gray font-body",
  };

  return (
    <p className={cn(sizeClasses[size], className)} {...props}>
      {children}
    </p>
  );
};

export const FieldLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  children,
  ...props
}) => (
  <label
    className={cn(
      "block text-xs font-semibold tracking-wider uppercase text-charcoal font-heading",
      className
    )}
    {...props}
  >
    {children}
  </label>
);

export const MonoBadge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className,
  children,
  ...props
}) => (
  <span
    className={cn(
      "font-mono text-xs px-2 py-0.5 rounded bg-[#ECEAE4] text-charcoal border border-soft-border inline-flex items-center",
      className
    )}
    {...props}
  >
    {children}
  </span>
);
