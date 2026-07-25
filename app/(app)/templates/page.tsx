import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { listTemplates } from "@/lib/data/templates";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { TemplateCategory } from "@/types/database.types";

const CATEGORY_LABEL: Record<TemplateCategory, string> = {
  petition: "Petições",
  appeal: "Recursos",
  contract: "Contratos",
  notification: "Notificações",
  email: "E-mails",
  checklist: "Checklists",
  report: "Relatórios",
};

export default async function TemplatesPage() {
  const templates = await listTemplates();
  const grouped = templates.reduce<Record<string, typeof templates>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Modelos"
        description="Petições, recursos, contratos e e-mails do escritório. A IA usa estes modelos primeiro."
        actions={
          <Button asChild>
            <Link href="/templates/new">
              <Plus /> Novo modelo
            </Link>
          </Button>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum modelo cadastrado"
          description="Cadastre petições, contratos e e-mails para que a IA os utilize automaticamente."
          action={
            <Button asChild>
              <Link href="/templates/new">
                <Plus /> Novo modelo
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                {CATEGORY_LABEL[category as TemplateCategory]}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => (
                  <Link key={t.id} href={`/templates/${t.id}`}>
                    <Card className="h-full gap-2 p-4 hover:bg-secondary/50">
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{t.name}</p>
                        {!t.is_active && <Badge variant="outline">Inativo</Badge>}
                      </div>
                      {t.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Usado {t.usage_count}x · Atualizado {formatDate(t.updated_at)}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
