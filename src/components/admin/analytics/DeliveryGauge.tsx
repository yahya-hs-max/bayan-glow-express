import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeliveryGaugeProps {
  title: string;
  value: number;
  target: number;
  sparkline?: number[];
  subtitle?: string;
}

export const DeliveryGauge = ({
  title,
  value,
  target,
  sparkline,
  subtitle,
}: DeliveryGaugeProps) => {
  const percentage = Math.min((value / 100) * 100, 100);
  const rotation = (percentage / 100) * 180 - 90;

  const getColor = () => {
    if (title.includes("RTO")) {
      if (value <= 6) return "#10b981";
      if (value <= 8) return "#f59e0b";
      return "#ef4444";
    } else {
      if (value >= target) return "#10b981";
      if (value >= target - 5) return "#f59e0b";
      return "#ef4444";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-32 h-16 mb-4">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <path
              d="M 10 45 A 40 40 0 0 1 90 45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <path
              d="M 10 45 A 40 40 0 0 1 90 45"
              fill="none"
              stroke={getColor()}
              strokeWidth="8"
              strokeDasharray={`${(percentage / 100) * 126} 126`}
            />
            <line
              x1="50"
              y1="45"
              x2="50"
              y2="15"
              stroke="#374151"
              strokeWidth="2"
              transform={`rotate(${rotation} 50 45)`}
            />
          </svg>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{value}%</div>
          <div className="text-sm text-muted-foreground">
            Cible: {target}%
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          )}
        </div>
        {sparkline && sparkline.length > 0 && (
          <div className="mt-4 w-full h-8">
            <svg viewBox="0 0 100 20" className="w-full h-full">
              <polyline
                points={sparkline
                  .map((val, i) => `${(i / (sparkline.length - 1)) * 100},${20 - (val / 100) * 20}`)
                  .join(" ")}
                fill="none"
                stroke={getColor()}
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
