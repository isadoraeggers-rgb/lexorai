"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";

export type OnboardingActionState = { error?: string; success?: boolean } | undefined;

export async function updateOfficeBasics(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name) return { error: "Informe o nome do escritório." };
  if (!email) return { error: "Informe o e-mail do escritório." };

  const supabase = await createClient();

  const logo = formData.get("logo") as File | null;
  let logoUrl: string | undefined;

  if (logo && logo.size > 0) {
    const path = `${session.profile.organization_id}/logo-${Date.now()}-${logo.name}`;
    const { error: uploadError } = await supabase.storage
      .from("brand-assets")
      .upload(path, logo, { contentType: logo.type, upsert: true });
    if (uploadError) return { error: uploadError.message };

    const { data: publicUrl } = supabase.storage.from("brand-assets").getPublicUrl(path);
    logoUrl = publicUrl.publicUrl;
  }

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      email,
      phone,
      ...(logoUrl ? { logo_url: logoUrl } : {}),
    })
    .eq("id", session.profile.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/onboarding");
  return { success: true };
}

export async function updateLawyerBasics(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return { error: "Informe seu nome completo." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: String(formData.get("phone") ?? "").trim() || null,
    })
    .eq("id", session.profile.id);

  if (error) return { error: error.message };

  revalidatePath("/onboarding");
  return { success: true };
}

export async function completeOnboarding() {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const supabase = await createClient();

  const { count } = await supabase
    .from("oab_registrations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", session.profile.organization_id);

  if (!count || count === 0) {
    return { error: "Cadastre ao menos uma OAB antes de concluir." };
  }

  await supabase
    .from("organizations")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", session.profile.organization_id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
