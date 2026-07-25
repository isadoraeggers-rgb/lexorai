import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getTemplate } from "@/lib/data/templates";
import { deleteTemplate } from "@/lib/actions/templates";
import { EditTemplateForm } from "@/components/templates/edit-template-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplate(id);

  if (!template) notFound();

  const deleteAction = deleteTemplate.bind(null, template.id);

  return (
    <div>
      <PageHeader
        title={template.name}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/templates">
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
      <Card className="max-w-3xl">
        <EditTemplateForm template={template} />
      </Card>
    </div>
  );
}
