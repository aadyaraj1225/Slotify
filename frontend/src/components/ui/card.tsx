import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-soft-border/90 bg-white text-charcoal shadow-[0_1px_3px_rgba(32,35,33,0.02)] transition-all",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 sm:p-7 border-b border-[#F0EFEB]", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-heading text-lg font-semibold leading-tight tracking-tight text-charcoal", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs text-slate-gray font-body leading-relaxed", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 sm:p-7", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 sm:p-7 pt-0 border-t border-[#F0EFEB] mt-4", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "plain" | "bordered" | "highlighted";
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = "bordered", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-6 sm:p-7",
          variant === "bordered" && "border border-soft-border/90 bg-white shadow-[0_1px_2px_rgba(32,35,33,0.02)]",
          variant === "plain" && "bg-white",
          variant === "highlighted" && "border border-pale-blue-border bg-pale-blue/30",
          className
        )}
        {...props}
      />
    );
  }
);
Panel.displayName = "Panel";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Panel };
