import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CalendarClock,
  Gavel,
  FileText,
  StickyNote,
  History,
  Sparkles,
} from "lucide-react";
import { getProcess } from "@/lib/data/processes";
import { deleteProcessRecord, addProcessNote } from "@/lib/actions/processes";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ProcessStatusBadge,
  PriorityBadge,
  RiskBadge,
  DeadlineStatusBadge,
  HearingStatusBadge,
} from "@/components/shared/badges";
import { GenerateSummaryButton } from "@/components/processes/generate-summary-button";
import { SyncNotionButton } from "@/components/processes/sync-notion-button";
import { formatCurrencyBRL, formatDate, formatDateTime, initials } from "@/lib/utils";

export default async function ProcessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { process, clients, lawyer, responsible, deadlines, hearings, documents, notes, timeline } =
    await getProcess(id);

  if (!process) notFound();

  const deleteAction = deleteProcessRecord.bind(null, process.id);
  const addNoteAction = addProcessNote.bind(null, process.id);

  return (
    <div>
      <PageHeader
        title={process.number}
        description={process.subject ?? "Sem assunto definido"}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/processes">
                <ArrowLeft /> Voltar
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/processes/${process.id}/edit`}>
                <Pencil /> Editar
              </Link>
            </Button>
            <SyncNotionButton processId={process.id} />
            <form action={deleteAction}>
              <Button variant="outline" type="submit">
                <Trash2 className="text-destructive" />
              </Button>
            </form>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <div className="flex flex-wrap gap-2">
              <ProcessStatusBadge status={process.status} />
              <PriorityBadge priority={process.priority} />
              <RiskBadge risk={process.risk_level} />
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Vara / Tribunal</dt>
                <dd>{process.court || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Juiz</dt>
                <dd>{process.judge || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Classe</dt>
                <dd>{process.class || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Parte contrária</dt>
                <dd>{process.opposing_party || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Valor da causa</dt>
                <dd>{process.case_value ? formatCurrencyBRL(process.case_value) : "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Distribuição</dt>
                <dd>{process.distribution_date ? formatDate(process.distribution_date) : "—"}</dd>
              </div>
            </dl>

            <div className="space-y-2 border-t border-border pt-4">
              {lawyer && (
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">{initials(lawyer.full_name)}</AvatarFallback>
                  </Avatar>
                  <span>{lawyer.full_name}</span>
                  <span className="text-xs text-muted-foreground">Advogado</span>
                </div>
              )}
              {responsible && (
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">{initials(responsible.full_name)}</AvatarFallback>
                  </Avatar>
                  <span>{responsible.full_name}</span>
                  <span className="text-xs text-muted-foreground">Responsável</span>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Sparkles className="size-4 text-accent" /> Resumo com IA
              </p>
              <GenerateSummaryButton processId={process.id} />
            </div>
            {process.ai_summary ? (
              <p className="text-sm text-muted-foreground">{process.ai_summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ainda não há resumo gerado. Clique em &quot;Gerar&quot; para que o agente Analista de Casos
                resuma este processo, identifique riscos e sugira a próxima estratégia.
              </p>
            )}
          </Card>

          <Card>
            <p className="text-sm font-medium">Clientes vinculados</p>
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum cliente vinculado.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {clients.map((c) => (
                  <Link
                    key={c.id}
                    href={`/clients/${c.id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-secondary"
                  >
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">{initials(c.name)}</AvatarFallback>
                    </Avatar>
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="deadlines">
            <TabsList>
              <TabsTrigger value="deadlines">
                <CalendarClock /> Prazos ({deadlines.length})
              </TabsTrigger>
              <TabsTrigger value="hearings">
                <Gavel /> Audiências ({hearings.length})
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText /> Documentos ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                <StickyNote /> Notas ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <History /> Linha do tempo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deadlines">
              {deadlines.length === 0 ? (
                <EmptyState icon={CalendarClock} title="Nenhum prazo cadastrado" />
              ) : (
                <div className="flex flex-col gap-2">
                  {deadlines.map((d) => (
                    <Card key={d.id} className="flex-row items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(d.due_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={d.priority} />
                        <DeadlineStatusBadge status={d.status} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="hearings">
              {hearings.length === 0 ? (
                <EmptyState icon={Gavel} title="Nenhuma audiência cadastrada" />
              ) : (
                <div className="flex flex-col gap-2">
                  {hearings.map((h) => (
                    <Card key={h.id} className="flex-row items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{h.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(h.scheduled_at)}</p>
                      </div>
                      <HearingStatusBadge status={h.status} />
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents">
              {documents.length === 0 ? (
                <EmptyState icon={FileText} title="Nenhum documento" />
              ) : (
                <div className="flex flex-col gap-2">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="flex-row items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="size-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{doc.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</p>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes">
              <Card className="mb-4">
                <form action={addNoteAction} className="space-y-3">
                  <Textarea name="body" placeholder="Escreva uma nota sobre este processo..." rows={3} required />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">
                      Adicionar nota
                    </Button>
                  </div>
                </form>
              </Card>
              {notes.length === 0 ? (
                <EmptyState icon={StickyNote} title="Nenhuma nota registrada" />
              ) : (
                <div className="flex flex-col gap-2">
                  {notes.map((note) => (
                    <Card key={note.id} className="p-4">
                      <p className="text-sm">{note.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(note.created_at)}</p>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="timeline">
              {timeline.length === 0 ? (
                <EmptyState icon={History} title="Nenhum evento registrado" />
              ) : (
                <div className="relative ml-2 flex flex-col gap-6 border-l border-border pl-6">
                  {timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <span className="absolute -left-[29px] top-1 size-2.5 rounded-full bg-accent" />
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatDateTime(event.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
