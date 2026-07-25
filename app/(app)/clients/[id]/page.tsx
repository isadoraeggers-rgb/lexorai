import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Scale, FileText, StickyNote, History, Trash2 } from "lucide-react";
import { getClient } from "@/lib/data/clients";
import { deleteClientRecord, addClientNote } from "@/lib/actions/clients";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProcessStatusBadge } from "@/components/shared/badges";
import { formatDate, formatDateTime, initials, maskCpfCnpj } from "@/lib/utils";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { client, processes, documents, notes, timeline } = await getClient(id);

  if (!client) notFound();

  const address = client.address as Record<string, string>;
  const addressLine = [address.street, address.city, address.state, address.zip]
    .filter(Boolean)
    .join(", ");

  const deleteAction = deleteClientRecord.bind(null, client.id);
  const addNoteAction = addClientNote.bind(null, client.id);

  return (
    <div>
      <PageHeader
        title={client.name}
        description={client.type === "individual" ? "Pessoa física" : "Pessoa jurídica"}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/clients">
                <ArrowLeft /> Voltar
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/clients/${client.id}/edit`}>
                <Pencil /> Editar
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
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="text-base">{initials(client.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{client.name}</p>
              <Badge variant={client.is_active ? "success" : "outline"}>
                {client.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Documento</dt>
              <dd>{maskCpfCnpj(client.cpf || client.cnpj || "") || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">E-mail</dt>
              <dd>{client.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Telefone</dt>
              <dd>{client.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Endereço</dt>
              <dd>{addressLine || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cliente desde</dt>
              <dd>{formatDate(client.created_at)}</dd>
            </div>
          </dl>
          {client.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {client.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {client.notes && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Observações</p>
              <p className="text-sm">{client.notes}</p>
            </div>
          )}
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="processes">
            <TabsList>
              <TabsTrigger value="processes">
                <Scale /> Processos ({processes.length})
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

            <TabsContent value="processes">
              {processes.length === 0 ? (
                <EmptyState icon={Scale} title="Nenhum processo vinculado" />
              ) : (
                <div className="flex flex-col gap-2">
                  {processes.map((p) => (
                    <Link key={p.id} href={`/processes/${p.id}`}>
                      <Card className="flex-row items-center justify-between p-4 hover:bg-secondary/50">
                        <div>
                          <p className="font-medium">{p.number}</p>
                          <p className="text-sm text-muted-foreground">{p.subject ?? "Sem assunto"}</p>
                        </div>
                        <ProcessStatusBadge status={p.status} />
                      </Card>
                    </Link>
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
                  <Textarea name="body" placeholder="Escreva uma nota sobre este cliente..." rows={3} required />
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
