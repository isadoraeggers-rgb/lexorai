"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import type { UserRole } from "@/types/database.types";

export type TeamActionState = { error?: string; success?: boolean } | undefined;

export async function inviteTeamMember(
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };
  if (session.profile.role !== "owner" && session.profile.role !== "admin") {
    return { error: "Apenas administradores podem convidar membros." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = (String(formData.get("role") ?? "lawyer")) as UserRole;

  if (!email || !fullName) return { error: "Preencha nome e e-mail." };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." };
  }

  const adminClient = createServiceRoleClient();
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      invited_organization_id: session.profile.organization_id,
      invited_role: role,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
  });

  if (error) return { error: error.message };

  revalidatePath("/settings/team");
  return { success: true };
}

export async function updateMemberRole(memberId: string, role: UserRole) {
  const session = await getCurrentProfile();
  if (!session || (session.profile.role !== "owner" && session.profile.role !== "admin")) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", memberId);
  revalidatePath("/settings/team");
}

export async function toggleMemberActive(memberId: string, isActive: boolean) {
  const session = await getCurrentProfile();
  if (!session || (session.profile.role !== "owner" && session.profile.role !== "admin")) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: isActive }).eq("id", memberId);
  revalidatePath("/settings/team");
}
