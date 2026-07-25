import { getCurrentProfile } from "@/lib/data/profile";
import { OfficeForm } from "@/components/settings/office-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function OfficeSettingsPage() {
  const session = await getCurrentProfile();

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Informações do escritório</CardTitle>
      </CardHeader>
      <CardContent>
        <OfficeForm organization={session!.organization} canEdit={["owner", "admin"].includes(session!.profile.role)} />
      </CardContent>
    </Card>
  );
}
