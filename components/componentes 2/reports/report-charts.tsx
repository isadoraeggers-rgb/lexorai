"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

export function DistributionBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" allowDecimals={false} />
        <Tooltip cursor={{ fill: "var(--color-secondary)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ProductivityChart({ data }: { data: { name: string; processos: number; tarefasConcluidas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" allowDecimals={false} />
        <Tooltip cursor={{ fill: "var(--color-secondary)" }} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="processos" name="Processos" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} maxBarSize={32} />
        <Bar
          dataKey="tarefasConcluidas"
          name="Tarefas concluídas"
          fill="var(--color-chart-2)"
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
