import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PipelineStage {
  status: string;
  count: number;
  percentage: number;
  conversionRate?: number;
}

interface OrderPipelineFunnelProps {
  stages: PipelineStage[];
}

export const OrderPipelineFunnel = ({ stages }: OrderPipelineFunnelProps) => {
  const getConversionColor = (rate?: number) => {
    if (!rate) return "bg-gray-500";
    if (rate >= 90) return "bg-green-500";
    if (rate >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline de commandes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.status}>
              <div
                className={cn(
                  "relative p-4 rounded-lg transition-all",
                  stage.status === "RTO" ? "bg-red-100" : "bg-primary/5"
                )}
                style={{
                  width: `${Math.max(stage.percentage, 20)}%`,
                  marginLeft: index > 0 ? `${(100 - Math.max(stage.percentage, 20)) / 2}%` : 0,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{stage.status}</span>
                  <span className="text-lg font-bold">{stage.count}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {stage.percentage}% du total
                </div>
              </div>
              {index < stages.length - 1 && stage.conversionRate && (
                <div className="flex items-center justify-center my-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-1 w-16",
                        getConversionColor(stage.conversionRate)
                      )}
                    />
                    <span className="text-sm font-medium">
                      {stage.conversionRate}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
