import { notFound } from "next/navigation";
import { getClient } from "@/lib/data/clients";
import { EditClientForm } from "@/components/clients/edit-client-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { client } = await getClient(id);

  if (!client) notFound();

  return (
    <div>
      <PageHeader title={`Editar ${client.name}`} description="Atualize as informações do cliente." />
      <Card className="max-w-3xl">
        <EditClientForm client={client} />
      </Card>
    </div>
  );
}
