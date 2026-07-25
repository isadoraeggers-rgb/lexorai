import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { NotionIntegrationForm } from "@/components/settings/notion-integration-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function IntegrationsSettingsPage() {
  const session = await getCurrentProfile();
  const supabase = await createClient();
  const { data: workspace } = await supabase
    .from("notion_workspaces")
    .select("database_map")
    .eq("organization_id", session!.profile.organization_id)
    .maybeSingle();

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Integração com Notion</CardTitle>
        <CardDescription>
          Sincronize processos e clientes com o Notion e importe a base de conhecimento do escritório.
          Requer a variável de ambiente <code>NOTION_API_KEY</code> configurada no servidor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NotionIntegrationForm databaseMap={workspace?.database_map ?? {}} />
      </CardContent>
    </Card>
  );
}
