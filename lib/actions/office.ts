"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";

export type OfficeActionState = { error?: string; success?: boolean } | undefined;

export async function updateOffice(
  _prevState: OfficeActionState,
  formData: FormData
): Promise<OfficeActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };
  if (session.profile.role !== "owner" && session.profile.role !== "admin") {
    return { error: "Apenas administradores podem editar as informações do escritório." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome do escritório." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      brand_color: String(formData.get("brand_color") ?? "#2563EB"),
      oab_registration: String(formData.get("oab_registration") ?? "").trim() || null,
      address: {
        street: String(formData.get("street") ?? ""),
        city: String(formData.get("city") ?? ""),
        state: String(formData.get("state") ?? ""),
        zip: String(formData.get("zip") ?? ""),
      },
    })
    .eq("id", session.profile.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function updateProfile(
  _prevState: OfficeActionState,
  formData: FormData
): Promise<OfficeActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "Informe seu nome." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: String(formData.get("phone") ?? "").trim() || null,
      oab_number: String(formData.get("oab_number") ?? "").trim() || null,
      title: String(formData.get("title") ?? "").trim() || null,
    })
    .eq("id", session.profile.id);

  if (error) return { error: error.message };

  revalidatePath("/settings/profile");
  return { success: true };
}
