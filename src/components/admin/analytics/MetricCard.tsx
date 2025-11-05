import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  status?: "good" | "warning" | "critical" | "neutral";
  target?: number;
  lastUpdated?: string;
}

export const MetricCard = ({
  title,
  value,
  trend,
  icon: Icon,
  status = "neutral",
  target,
  lastUpdated,
}: MetricCardProps) => {
  const statusColors = {
    good: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    critical: "bg-red-50 border-red-200",
    neutral: "bg-blue-50 border-blue-200",
  };

  const statusDots = {
    good: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500",
    neutral: "bg-blue-500",
  };

  return (
    <Card className={cn("border-2", statusColors[status])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-2 h-2 rounded-full", statusDots[status])} />
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
            </div>
            <p className="text-3xl font-bold mb-2">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                {trend > 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend > 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
            {target && (
              <p className="text-xs text-muted-foreground mt-1">
                Cible: {target}%
              </p>
            )}
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">{lastUpdated}</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-white">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
