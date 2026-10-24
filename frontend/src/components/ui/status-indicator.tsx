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
    badge: "bg-[#EAF4EE] text-[#26734D] border-[#B2DEC4]/60",
    dot: "bg-[#26734D]",
    defaultLabel: "Confirmed",
    icon: CheckCircle2,
  },
  pending: {
    badge: "bg-[#FDF6E7] text-[#996515] border-[#F1DCAC]/70",
    dot: "bg-[#996515]",
    defaultLabel: "Pending",
    icon: Clock,
  },
  conflict: {
    badge: "bg-[#FDF0F0] text-[#B93838] border-[#F5C2C2]/70",
    dot: "bg-[#B93838]",
    defaultLabel: "Conflict",
    icon: AlertTriangle,
  },
  cancelled: {
    badge: "bg-[#EFEFEA] text-[#626A70] border-[#E4E3DD]",
    dot: "bg-[#626A70]",
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
        "inline-flex items-center font-medium font-body rounded-full border transition-colors",
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
