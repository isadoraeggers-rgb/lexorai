import { notFound } from "next/navigation";
import { getProcess } from "@/lib/data/processes";
import { listTeamMembers } from "@/lib/data/team";
import { EditProcessForm } from "@/components/processes/edit-process-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export default async function EditProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ process }, team] = await Promise.all([getProcess(id), listTeamMembers()]);

  if (!process) notFound();

  return (
    <div>
      <PageHeader title={`Editar processo ${process.number}`} />
      <Card className="max-w-3xl">
        <EditProcessForm process={process} team={team} />
      </Card>
    </div>
  );
}
