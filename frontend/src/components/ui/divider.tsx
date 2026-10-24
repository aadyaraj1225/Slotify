import * as React from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  orientation?: "horizontal" | "vertical";
}

export const Divider: React.FC<DividerProps> = ({
  className,
  label,
  orientation = "horizontal",
  ...props
}) => {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("w-px bg-soft-border self-stretch", className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={cn("flex items-center my-6 text-xs text-slate-gray font-body", className)}
        {...props}
      >
        <div className="flex-grow border-t border-soft-border" />
        <span className="px-3 uppercase tracking-wider font-heading text-[11px] text-slate-gray">
          {label}
        </span>
        <div className="flex-grow border-t border-soft-border" />
      </div>
    );
  }

  return (
    <hr
      className={cn("my-6 border-0 border-t border-soft-border", className)}
      {...props}
    />
  );
};
