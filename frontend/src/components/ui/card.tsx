import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-md border border-soft-border bg-white text-charcoal shadow-card transition-shadow",
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
      className={cn("flex flex-col space-y-1.5 p-6 border-b border-soft-border/60", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-heading text-lg font-semibold leading-none tracking-tight text-charcoal", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs text-slate-gray font-body", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0 border-t border-soft-border/60 mt-4", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

/**
 * Panel is an unbordered or lightly bordered container for grouping related tools or sub-sections.
 */
export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "plain" | "bordered" | "highlighted";
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = "bordered", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md p-5",
          variant === "bordered" && "border border-soft-border bg-white shadow-subtle",
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
