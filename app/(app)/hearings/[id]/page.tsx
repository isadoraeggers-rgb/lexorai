import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, MapPin, Video, User, ListChecks, Users as UsersIcon } from "lucide-react";
import { getHearing } from "@/lib/data/hearings";
import { deleteHearing, addHearingChecklistItem, addHearingParticipant } from "@/lib/actions/hearings";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HearingStatusBadge } from "@/components/shared/badges";
import { HearingChecklist } from "@/components/hearings/hearing-checklist";
import { formatDateTime } from "@/lib/utils";

export default async function HearingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { hearing, processNumber, checklist, participants } = await getHearing(id);

  if (!hearing) notFound();

  const deleteAction = deleteHearing.bind(null, hearing.id);
  const addChecklistAction = addHearingChecklistItem.bind(null, hearing.id);
  const addParticipantAction = addHearingParticipant.bind(null, hearing.id);

  return (
    <div>
      <PageHeader
        title={hearing.title}
        description={processNumber ? `Processo ${processNumber}` : undefined}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/hearings">
                <ArrowLeft /> Voltar
              </Link>
            </Button>
            <form action={deleteAction}>
              <Button variant="outline" type="submit">
                <Trash2 className="text-destructive" />
              </Button>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <HearingStatusBadge status={hearing.status} />
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Data e hora</dt>
              <dd>{formatDateTime(hearing.scheduled_at)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duração</dt>
              <dd>{hearing.duration_minutes} minutos</dd>
            </div>
            {hearing.judge && (
              <div>
                <dt className="text-muted-foreground flex items-center gap-1">
                  <User className="size-3" /> Juiz
                </dt>
                <dd>{hearing.judge}</dd>
              </div>
            )}
            {hearing.address && (
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-3" /> Endereço
                </dt>
                <dd>{hearing.address}</dd>
              </div>
            )}
            {hearing.meet_url && (
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Video className="size-3" /> Link da reunião
                </dt>
                <dd>
                  <a href={hearing.meet_url} target="_blank" className="text-accent hover:underline">
                    {hearing.meet_url}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <ListChecks className="size-4" /> Checklist de preparação
            </p>
            <HearingChecklist hearingId={hearing.id} items={checklist} />
            <form action={addChecklistAction} className="flex gap-2">
              <Input name="title" placeholder="Adicionar item..." />
              <Button type="submit" variant="outline">
                Adicionar
              </Button>
            </form>
          </Card>

          <Card>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <UsersIcon className="size-4" /> Participantes
            </p>
            <div className="flex flex-col gap-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.role}</span>
                </div>
              ))}
            </div>
            <form action={addParticipantAction} className="grid grid-cols-3 gap-2">
              <Input name="name" placeholder="Nome" required />
              <Input name="role" placeholder="Papel" />
              <Button type="submit" variant="outline">
                Adicionar
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
