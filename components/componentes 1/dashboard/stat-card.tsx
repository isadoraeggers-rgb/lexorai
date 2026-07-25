import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "destructive" | "success";
}) {
  const toneClasses = {
    default: "bg-accent-soft text-accent",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
  }[tone];

  return (
    <Card className="gap-3 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={cn("flex size-8 items-center justify-center rounded-lg", toneClasses)}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </Card>
  );
}
