import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-warm-ivory disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-muted-cobalt text-white hover:bg-muted-cobalt-hover active:bg-muted-cobalt-active shadow-subtle",
        secondary:
          "bg-[#ECEAE4] text-charcoal hover:bg-[#E3E1DB] active:bg-[#DAD8D1]",
        outline:
          "border border-soft-border bg-white text-charcoal hover:bg-warm-ivory active:bg-[#ECEAE4]",
        destructive:
          "bg-error-red text-white hover:bg-[#A32E2E] active:bg-[#8D2525] shadow-subtle",
        ghost:
          "text-charcoal hover:bg-[#ECEAE4] active:bg-[#E3E1DB]",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-11 px-5 text-base gap-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// oxlint-disable-next-line react/only-export-components
export { Button, buttonVariants };
