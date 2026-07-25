"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { TASK_STATUS_LABEL } from "@/components/shared/badges";
import type { TaskStatus } from "@/types/database.types";

const COLORS: Record<string, string> = {
  todo: "var(--color-chart-3)",
  doing: "var(--color-chart-1)",
  waiting: "var(--color-chart-4)",
  done: "var(--color-chart-2)",
};

export function TasksChart({ data }: { data: { status: string; count: number }[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: TASK_STATUS_LABEL[d.status as TaskStatus] ?? d.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--color-muted-foreground)"
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "var(--color-secondary)" }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
