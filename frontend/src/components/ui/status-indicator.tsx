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
    defaultLabel: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  }
> = {
  confirmed: {
    badge: "bg-[#70D6A0]/20 text-[#145a33] border-[#70D6A0]/60",
    dot: "bg-[#70D6A0]",
    defaultLabel: "Confirmed",
    icon: CheckCircle2,
  },
  pending: {
    badge: "bg-[#FFC857]/25 text-[#734b00] border-[#FFC857]/60",
    dot: "bg-[#FFC857]",
    defaultLabel: "Pending",
    icon: Clock,
  },
  conflict: {
    badge: "bg-[#FF6262]/20 text-[#b51c1c] border-[#FF6262]/60",
    dot: "bg-[#FF6262]",
    defaultLabel: "Conflict",
    icon: AlertTriangle,
  },
  cancelled: {
    badge: "bg-[#B8B8B8]/25 text-[#333333] border-[#B8B8B8]/60",
    dot: "bg-[#B8B8B8]",
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
        "inline-flex items-center font-mono rounded-full border transition-colors",
        size === "sm" ? "text-[11px] px-2.5 py-0.5 gap-1.5" : "text-xs px-3 py-1 gap-1.5",
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
