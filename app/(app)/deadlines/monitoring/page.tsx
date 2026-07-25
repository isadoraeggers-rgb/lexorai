import Link from "next/link";
import { ShieldAlert, ShieldCheck, FileSearch } from "lucide-react";
import { getCurrentProfile } from "@/lib/data/profile";
import { getMonitoringStatus, listOabRegistrations, listMonitoredPublications } from "@/lib/data/oab";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicationForm } from "@/components/monitoring/publication-form";
import { formatOab } from "@/lib/validation/oab";
import { formatDateTime } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  processed: "Processada",
  dismissed: "Descartada",
};

export default async function DeadlineMonitoringPage() {
  const session = await getCurrentProfile();
  const orgId = session!.profile.organization_id;

  const [monitoringEnabled, registrations, publications] = await Promise.all([
    getMonitoringStatus(orgId),
    listOabRegistrations(orgId),
    listMonitoredPublications(orgId),
  ]);

  const monitoredOabs = registrations.filter((r) => r.is_active && r.is_monitored);

  return (
    <div>
      <PageHeader
        title="Monitoramento de Prazos"
        description="Publicações do Diário da Justiça monitoradas por OAB, com detecção automática de prazos."
      />

      {!monitoringEnabled ? (
        <EmptyState
          icon={ShieldAlert}
          title="Monitoramento desabilitado"
          description='Configure at least one active OAB registration to enable automatic deadline monitoring.'
          action={
            <Button asChild>
              <Link href="/settings/oab">Configurar OAB</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <ShieldCheck className="size-4 text-success" /> OABs monitoradas
            </p>
            <div className="flex flex-wrap gap-2">
              {monitoredOabs.map((r) => (
                <Badge key={r.id} variant="success">
                  {formatOab(r.oab_state, r.oab_number)}
                  {r.lawyerName ? ` — ${r.lawyerName}` : ""}
                </Badge>
              ))}
            </div>
          </Card>

          <PublicationForm monitoredOabs={monitoredOabs} />

          <Card>
            <p className="mb-2 text-sm font-medium">Publicações recentes</p>
            {publications.length === 0 ? (
              <EmptyState icon={FileSearch} title="Nenhuma publicação processada ainda" className="border-none py-8" />
            ) : (
              <div className="flex flex-col gap-2">
                {publications.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-none">
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        {p.process_number ?? "Processo não identificado"}
                        {p.court ? ` · ${p.court}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(p.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.status === "processed" ? "success" : "outline"}>
                        {STATUS_LABEL[p.status]}
                      </Badge>
                      {p.detected_deadline_id && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/deadlines">Ver prazo</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
