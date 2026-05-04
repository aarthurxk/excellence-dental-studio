import * as React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface MetricsCardProps {
  title: string;
  value: string | number;
  /** Variação % em relação ao período anterior (positivo = melhora, negativo = piora) */
  trend?: number;
  icon?: LucideIcon;
  /** Usado quando o card representa um atendente/usuário específico */
  avatarUrl?: string | null;
  avatarFallback?: string;
  description?: string;
  className?: string;
  onClick?: () => void;
}

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0) return <TrendingUp className="h-3.5 w-3.5" />;
  if (trend < 0) return <TrendingDown className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

function trendClass(trend: number) {
  if (trend > 0) return "text-emerald-600";
  if (trend < 0) return "text-red-500";
  return "text-muted-foreground";
}

export function MetricsCard({
  title,
  value,
  trend,
  icon: Icon,
  avatarUrl,
  avatarFallback,
  description,
  className,
  onClick,
}: MetricsCardProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-4 shadow-soft",
        "text-left transition-shadow",
        onClick && "hover:shadow-card cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {/* Top row: icon / avatar + title */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {avatarUrl !== undefined ? (
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatarUrl ?? undefined} alt={avatarFallback} />
            <AvatarFallback className="text-[10px] font-medium bg-muted">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        ) : Icon ? (
          <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : null}
      </div>

      {/* Value */}
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {trend !== undefined && (
          <span className={cn("flex items-center gap-0.5 text-xs font-medium mb-0.5", trendClass(trend))}>
            <TrendIcon trend={trend} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      )}
    </Wrapper>
  );
}
