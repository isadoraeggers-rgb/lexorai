import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listTeamMembers } from "@/lib/data/team";
import { listClients } from "@/lib/data/clients";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewProcessForm } from "@/components/processes/new-process-form";

export default async function NewProcessPage() {
  const [team, clients] = await Promise.all([listTeamMembers(), listClients()]);

  return (
    <div>
      <PageHeader
        title="Novo processo"
        description="Cadastre um novo processo judicial."
        actions={
          <Button variant="outline" asChild>
            <Link href="/processes">
              <ArrowLeft /> Voltar
            </Link>
          </Button>
        }
      />
      <Card className="max-w-3xl">
        <NewProcessForm team={team} clients={clients} />
      </Card>
    </div>
  );
}
