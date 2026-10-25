import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-body font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-electric-lime text-deep-black hover:bg-[#c9f228] active:translate-x-[1px] active:translate-y-[1px] border border-deep-black/30 shadow-[2px_2px_0px_#101010]",
        pink:
          "bg-hot-pink text-white hover:bg-[#e43496] active:translate-x-[1px] active:translate-y-[1px] border border-deep-black/20 shadow-[2px_2px_0px_#101010]",
        secondary:
          "bg-near-black text-white hover:bg-deep-black active:bg-black border border-deep-black shadow-[2px_2px_0px_#101010]",
        outline:
          "border border-deep-black/80 bg-white text-deep-black hover:bg-[#F2EFE9] active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_#101010]",
        destructive:
          "bg-error-red text-white hover:bg-[#e85353] active:translate-x-[1px] active:translate-y-[1px] border border-deep-black/20 shadow-[2px_2px_0px_#101010]",
        ghost:
          "text-deep-black hover:bg-black/5 active:bg-black/10",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-xs tracking-wide uppercase gap-2",
        lg: "h-12 px-6 text-sm tracking-wide uppercase gap-2.5",
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
