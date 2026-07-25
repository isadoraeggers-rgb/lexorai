import { getCurrentProfile } from "@/lib/data/profile";
import { listOabRegistrations } from "@/lib/data/oab";
import { listTeamMembers } from "@/lib/data/team";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AddOabDialog } from "@/components/settings/add-oab-dialog";
import { OabRegistrationRow } from "@/components/settings/oab-registration-row";
import { EmptyState } from "@/components/shared/empty-state";
import { ShieldCheck } from "lucide-react";

export default async function OabSettingsPage() {
  const session = await getCurrentProfile();
  const [registrations, team] = await Promise.all([
    listOabRegistrations(session!.profile.organization_id),
    listTeamMembers(),
  ]);

  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Registros de OAB</CardTitle>
          <CardDescription>
            Cada advogado do escritório pode ter uma ou mais OABs. Apenas OABs ativas e marcadas como
            &quot;Monitorar&quot; habilitam o monitoramento automático de prazos.
          </CardDescription>
        </div>
        <AddOabDialog team={team.map((t) => ({ id: t.id, full_name: t.full_name }))} />
      </CardHeader>
      <CardContent className="p-0 px-6 pb-2">
        {registrations.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Nenhuma OAB cadastrada" className="border-none py-10" />
        ) : (
          registrations.map((r) => <OabRegistrationRow key={r.id} registration={r} />)
        )}
      </CardContent>
    </Card>
  );
}
