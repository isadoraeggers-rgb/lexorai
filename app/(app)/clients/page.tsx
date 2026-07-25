import Link from "next/link";
import { Plus, Users, Search } from "lucide-react";
import { listClients } from "@/lib/data/clients";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await listClients(q);

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${clients.length} cliente${clients.length === 1 ? "" : "s"} cadastrado${clients.length === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/clients/new">
              <Plus /> Novo cliente
            </Link>
          </Button>
        }
      />

      <form className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Buscar por nome..." className="pl-9" />
        </div>
      </form>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente encontrado"
          description="Cadastre seu primeiro cliente para começar a vincular processos e documentos."
          action={
            <Button asChild>
              <Link href="/clients/new">
                <Plus /> Novo cliente
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback>{initials(client.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.type === "individual" ? "Pessoa física" : "Pessoa jurídica"}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{client.email ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{client.phone ?? ""}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {client.cpf || client.cnpj || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.is_active ? "success" : "outline"}>
                      {client.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
