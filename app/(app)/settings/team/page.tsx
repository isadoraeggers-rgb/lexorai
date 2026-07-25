import { getCurrentProfile } from "@/lib/data/profile";
import { listAllMembers } from "@/lib/data/team-full";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { MemberRow } from "@/components/settings/member-row";

export default async function TeamSettingsPage() {
  const session = await getCurrentProfile();
  const members = await listAllMembers();
  const canManage = ["owner", "admin"].includes(session!.profile.role);

  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Equipe ({members.length})</CardTitle>
        {canManage && <InviteMemberDialog />}
      </CardHeader>
      <CardContent className="p-0 px-6 pb-2">
        {members.map((member) => (
          <MemberRow key={member.id} member={member} canManage={canManage} />
        ))}
      </CardContent>
    </Card>
  );
}
