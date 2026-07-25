import Link from "next/link";
import { Gavel, MapPin, Video } from "lucide-react";
import { listHearings } from "@/lib/data/hearings";
import { listProcesses } from "@/lib/data/processes";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { HearingStatusBadge } from "@/components/shared/badges";
import { NewHearingSheet } from "@/components/hearings/new-hearing-sheet";
import { formatDateTime } from "@/lib/utils";

export default async function HearingsPage() {
  const [hearings, processes] = await Promise.all([listHearings(), listProcesses()]);

  return (
    <div>
      <PageHeader
        title="Audiências"
        description="Todas as audiências agendadas e realizadas."
        actions={<NewHearingSheet processes={processes.map((p) => ({ id: p.id, number: p.number }))} />}
      />

      {hearings.length === 0 ? (
        <EmptyState icon={Gavel} title="Nenhuma audiência cadastrada" />
      ) : (
        <div className="flex flex-col gap-2">
          {hearings.map((h) => (
            <Link key={h.id} href={`/hearings/${h.id}`}>
              <Card className="flex-row items-center justify-between p-4 hover:bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 flex-col items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Gavel className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{h.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      {h.location_type === "online" ? <Video className="size-3" /> : <MapPin className="size-3" />}
                      {formatDateTime(h.scheduled_at)}
                      {h.processNumber && ` · Processo ${h.processNumber}`}
                    </p>
                  </div>
                </div>
                <HearingStatusBadge status={h.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
