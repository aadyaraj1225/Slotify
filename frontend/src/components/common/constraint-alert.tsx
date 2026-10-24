import * as React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConstraintAlertProps {
  type?: "warning" | "error" | "info";
  title: string;
  description: string;
  constraintKey?: string;
  className?: string;
}

export const ConstraintAlert: React.FC<ConstraintAlertProps> = ({
  type = "warning",
  title,
  description,
  constraintKey,
  className,
}) => {
  const configs = {
    warning: {
      container: "bg-warning-amber/10 border-warning-amber/30 text-warning-amber",
      icon: AlertTriangle,
      iconColor: "text-warning-amber",
      badge: "bg-warning-amber/20 text-warning-amber",
    },
    error: {
      container: "bg-error-red/10 border-error-red/30 text-error-red",
      icon: AlertCircle,
      iconColor: "text-error-red",
      badge: "bg-error-red/20 text-error-red",
    },
    info: {
      container: "bg-pale-blue text-muted-cobalt border-pale-blue-border",
      icon: Info,
      iconColor: "text-muted-cobalt",
      badge: "bg-white text-muted-cobalt",
    },
  };

  const current = configs[type];
  const Icon = current.icon;

  return (
    <div
      role="alert"
      className={cn(
        "rounded border p-4 flex items-start gap-3 transition-colors",
        current.container,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", current.iconColor)} aria-hidden="true" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-heading font-semibold text-sm leading-tight text-charcoal">
            {title}
          </h4>
          {constraintKey && (
            <span
              className={cn(
                "font-mono text-[11px] px-1.5 py-0.5 rounded font-medium",
                current.badge
              )}
            >
              {constraintKey}
            </span>
          )}
        </div>
        <p className="text-xs text-charcoal/80 font-body leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
