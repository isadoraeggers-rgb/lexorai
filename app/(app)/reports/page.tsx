import { getReportsData } from "@/lib/data/reports";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { DistributionBarChart, DistributionPieChart, ProductivityChart } from "@/components/reports/report-charts";
import { ExportButtons } from "@/components/reports/export-buttons";
import { GenerateOfficeReport } from "@/components/reports/generate-office-report";
import { formatCurrencyBRL } from "@/lib/utils";

export default async function ReportsPage() {
  const data = await getReportsData();

  return (
    <div>
      <PageHeader title="Relatórios" description="Produtividade, casos, financeiro, prazos e audiências." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Produtividade por advogado</CardTitle>
            <CardAction>
              <ExportButtons
                title="Produtividade"
                columns={["Advogado", "Processos", "Tarefas concluídas"]}
                rows={data.productivity.map((p) => [p.name, p.processos, p.tarefasConcluidas])}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <ProductivityChart data={data.productivity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Casos por status</CardTitle>
            <CardAction>
              <ExportButtons
                title="Casos por status"
                columns={["Status", "Quantidade"]}
                rows={data.casesByStatus.map((c) => [c.name, c.value])}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <DistributionBarChart data={data.casesByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Casos por risco</CardTitle>
            <CardAction>
              <ExportButtons
                title="Casos por risco"
                columns={["Risco", "Quantidade"]}
                rows={data.casesByRisk.map((c) => [c.name, c.value])}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <DistributionPieChart data={data.casesByRisk} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Prazos</CardTitle>
            <CardAction>
              <ExportButtons
                title="Prazos"
                columns={["Status", "Quantidade"]}
                rows={data.deadlinesByStatus.map((c) => [c.name, c.value])}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <DistributionPieChart data={data.deadlinesByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Audiências</CardTitle>
            <CardAction>
              <ExportButtons
                title="Audiências"
                columns={["Status", "Quantidade"]}
                rows={data.hearingsByStatus.map((c) => [c.name, c.value])}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <DistributionPieChart data={data.hearingsByStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Financeiro (valor da causa por status)</CardTitle>
            <CardAction>
              <ExportButtons
                title="Financeiro"
                columns={["Status", "Total (R$)"]}
                rows={data.financialByStatus.map((c) => [c.status, c.total])}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.financialByStatus.map((f) => (
              <div key={f.status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{f.status}</span>
                <span className="font-medium">{formatCurrencyBRL(f.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <GenerateOfficeReport />
      </div>
    </div>
  );
}
