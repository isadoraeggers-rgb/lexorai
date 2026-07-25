import { getCurrentProfile } from "@/lib/data/profile";
import { ProfileForm } from "@/components/settings/profile-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function ProfileSettingsPage() {
  const session = await getCurrentProfile();

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Meu perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileForm profile={session!.profile} />
      </CardContent>
    </Card>
  );
}
