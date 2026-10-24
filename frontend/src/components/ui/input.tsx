import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", id, label, helperText, error, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = Boolean(error);
    const ariaDescribedBy = hasError
      ? errorId
      : helperText
      ? helperId
      : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-xs font-medium tracking-wide uppercase font-heading",
              disabled ? "text-slate-gray/60" : "text-charcoal"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={ariaDescribedBy}
            className={cn(
              "flex h-10 w-full rounded border bg-white px-3 py-2 text-sm text-charcoal font-body placeholder:text-slate-gray/70 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-warm-ivory",
              hasError
                ? "border-error-red focus-visible:ring-error-red text-charcoal"
                : "border-soft-border focus-visible:border-muted-cobalt focus-visible:ring-muted-cobalt",
              disabled && "cursor-not-allowed bg-[#ECEAE4]/60 text-slate-gray border-soft-border/70 opacity-70",
              className
            )}
            {...props}
          />
        </div>
        {hasError ? (
          <p id={errorId} className="text-xs text-error-red font-body font-medium flex items-center gap-1" role="alert">
            <span aria-hidden="true">•</span>
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-gray font-body">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
