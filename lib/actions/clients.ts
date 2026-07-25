"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validation/client";
import { getCurrentProfile } from "@/lib/data/profile";

export type ClientActionState = { error?: string } | undefined;

function buildAddress(formData: FormData) {
  return {
    street: String(formData.get("street") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    zip: String(formData.get("zip") ?? ""),
  };
}

export async function createClientRecord(
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      organization_id: session.profile.organization_id,
      type: parsed.data.type,
      name: parsed.data.name,
      cpf: parsed.data.cpf || null,
      cnpj: parsed.data.cnpj || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: buildAddress(formData),
      notes: parsed.data.notes || null,
      tags,
      created_by: session.profile.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await supabase.from("client_timeline_events").insert({
    organization_id: session.profile.organization_id,
    client_id: client.id,
    event_type: "client_created",
    title: "Cliente cadastrado",
    created_by: session.profile.id,
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClientRecord(
  clientId: string,
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase
    .from("clients")
    .update({
      type: parsed.data.type,
      name: parsed.data.name,
      cpf: parsed.data.cpf || null,
      cnpj: parsed.data.cnpj || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: buildAddress(formData),
      notes: parsed.data.notes || null,
      tags,
    })
    .eq("id", clientId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function deleteClientRecord(clientId: string) {
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", clientId);
  revalidatePath("/clients");
  redirect("/clients");
}

export async function addClientNote(clientId: string, formData: FormData) {
  const session = await getCurrentProfile();
  if (!session) return;
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createClient();
  await supabase.from("notes").insert({
    organization_id: session.profile.organization_id,
    client_id: clientId,
    author_id: session.profile.id,
    body,
  });

  await supabase.from("client_timeline_events").insert({
    organization_id: session.profile.organization_id,
    client_id: clientId,
    event_type: "note_added",
    title: "Nota adicionada",
    created_by: session.profile.id,
  });

  revalidatePath(`/clients/${clientId}`);
}
