import * as React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlotStatus } from "@/config/tokens";

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: SlotStatus;
  showIcon?: boolean;
  size?: "sm" | "md";
  customLabel?: string;
}

const statusStyles: Record<
  SlotStatus,
  {
    badge: string;
    dot: string;
    text: string;
    defaultLabel: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  }
> = {
  confirmed: {
    badge: "bg-success-green/10 text-success-green border-success-green/30",
    dot: "bg-success-green",
    text: "text-success-green",
    defaultLabel: "Confirmed",
    icon: CheckCircle2,
  },
  pending: {
    badge: "bg-warning-amber/10 text-warning-amber border-warning-amber/30",
    dot: "bg-warning-amber",
    text: "text-warning-amber",
    defaultLabel: "Pending",
    icon: Clock,
  },
  conflict: {
    badge: "bg-error-red/10 text-error-red border-error-red/30",
    dot: "bg-error-red",
    text: "text-error-red",
    defaultLabel: "Conflict",
    icon: AlertTriangle,
  },
  cancelled: {
    badge: "bg-[#ECEAE4] text-slate-gray border-soft-border",
    dot: "bg-slate-gray",
    text: "text-slate-gray",
    defaultLabel: "Cancelled",
    icon: XCircle,
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showIcon = true,
  size = "md",
  customLabel,
  className,
  ...props
}) => {
  const config = statusStyles[status];
  const Icon = config.icon;
  const label = customLabel || config.defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium font-body rounded border",
        size === "sm" ? "text-xs px-2 py-0.5 gap-1.5" : "text-xs px-2.5 py-1 gap-1.5",
        config.badge,
        className
      )}
      role="status"
      aria-label={`Status: ${label}`}
      {...props}
    >
      {showIcon ? (
        <Icon className={size === "sm" ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} aria-hidden={true} />
      ) : (
        <span
          className={cn(
            "rounded-full shrink-0",
            size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
            config.dot
          )}
          aria-hidden={true}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
