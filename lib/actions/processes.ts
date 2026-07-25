"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { processSchema } from "@/lib/validation/process";
import { getCurrentProfile } from "@/lib/data/profile";

export type ProcessActionState = { error?: string } | undefined;

function nullable(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

export async function createProcessRecord(
  _prevState: ProcessActionState,
  formData: FormData
): Promise<ProcessActionState> {
  const session = await getCurrentProfile();
  if (!session) return { error: "Sessão expirada." };

  const parsed = processSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();

  const { data: process, error } = await supabase
    .from("processes")
    .insert({
      organization_id: session.profile.organization_id,
      number: parsed.data.number,
      court: nullable(formData.get("court")),
      judge: nullable(formData.get("judge")),
      class: nullable(formData.get("class")),
      subject: nullable(formData.get("subject")),
      opposing_party: nullable(formData.get("opposing_party")),
      lawyer_id: nullable(formData.get("lawyer_id")),
      responsible_user_id: nullable(formData.get("responsible_user_id")),
      status: parsed.data.status,
      risk_level: parsed.data.risk_level,
      priority: parsed.data.priority,
      case_value: parsed.data.case_value ? Number(parsed.data.case_value) : null,
      distribution_date: nullable(formData.get("distribution_date")),
      created_by: session.profile.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const clientId = nullable(formData.get("client_id"));
  if (clientId) {
    await supabase.from("process_clients").insert({
      process_id: process.id,
      client_id: clientId,
      role: "client",
    });
  }

  await supabase.from("process_timeline_events").insert({
    organization_id: session.profile.organization_id,
    process_id: process.id,
    event_type: "process_created",
    title: "Processo cadastrado",
    created_by: session.profile.id,
  });

  revalidatePath("/processes");
  redirect(`/processes/${process.id}`);
}

export async function updateProcessRecord(
  processId: string,
  _prevState: ProcessActionState,
  formData: FormData
): Promise<ProcessActionState> {
  const parsed = processSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("processes")
    .update({
      number: parsed.data.number,
      court: nullable(formData.get("court")),
      judge: nullable(formData.get("judge")),
      class: nullable(formData.get("class")),
      subject: nullable(formData.get("subject")),
      opposing_party: nullable(formData.get("opposing_party")),
      lawyer_id: nullable(formData.get("lawyer_id")),
      responsible_user_id: nullable(formData.get("responsible_user_id")),
      status: parsed.data.status,
      risk_level: parsed.data.risk_level,
      priority: parsed.data.priority,
      case_value: parsed.data.case_value ? Number(parsed.data.case_value) : null,
      distribution_date: nullable(formData.get("distribution_date")),
    })
    .eq("id", processId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/processes");
  revalidatePath(`/processes/${processId}`);
  redirect(`/processes/${processId}`);
}

export async function deleteProcessRecord(processId: string) {
  const supabase = await createClient();
  await supabase.from("processes").delete().eq("id", processId);
  revalidatePath("/processes");
  redirect("/processes");
}

export async function addProcessNote(processId: string, formData: FormData) {
  const session = await getCurrentProfile();
  if (!session) return;
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createClient();
  await supabase.from("notes").insert({
    organization_id: session.profile.organization_id,
    process_id: processId,
    author_id: session.profile.id,
    body,
  });

  await supabase.from("process_timeline_events").insert({
    organization_id: session.profile.organization_id,
    process_id: processId,
    event_type: "note_added",
    title: "Nota adicionada",
    created_by: session.profile.id,
  });

  revalidatePath(`/processes/${processId}`);
}
