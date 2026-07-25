import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { extractPublicationDeadline } from "@/lib/ai/publication-extraction";

/**
 * Deadline-monitoring ingestion endpoint.
 *
 * Today this is called from the "Colar publicação" form in
 * /deadlines/monitoring (manual paste). It's shaped to also be the target for
 * a future Diário da Justiça scraping worker or third-party webhook: POST the
 * same { oabRegistrationId, rawText, court?, publicationDate? } body and it
 * runs the identical AI-extraction → deadline-creation → notification pipeline.
 */
export async function POST(request: Request) {
  const session = await getCurrentProfile();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });
  }

  const { oabRegistrationId, rawText } = await request.json();
  if (!rawText || String(rawText).trim().length < 20) {
    return NextResponse.json({ error: "Cole o texto da publicação (mínimo 20 caracteres)." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: oab } = await supabase
    .from("oab_registrations")
    .select("id, profile_id, is_active, is_monitored, organization_id")
    .eq("id", oabRegistrationId)
    .maybeSingle();

  if (!oab || oab.organization_id !== session.profile.organization_id) {
    return NextResponse.json({ error: "OAB não encontrada." }, { status: 404 });
  }
  if (!oab.is_active || !oab.is_monitored) {
    return NextResponse.json({ error: "Esta OAB não está ativa/monitorada." }, { status: 400 });
  }

  let extracted;
  try {
    extracted = await extractPublicationDeadline(String(rawText));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao processar publicação" },
      { status: 500 }
    );
  }

  const { data: publication, error: pubError } = await supabase
    .from("monitored_publications")
    .insert({
      organization_id: session.profile.organization_id,
      oab_registration_id: oab.id,
      process_number: extracted.process_number,
      court: extracted.court,
      publication_date: extracted.publication_date,
      raw_text: String(rawText),
      status: "processed",
    })
    .select("id")
    .single();

  if (pubError || !publication) {
    return NextResponse.json({ error: pubError?.message ?? "Falha ao salvar publicação" }, { status: 500 });
  }

  let matchedProcessId: string | null = null;
  if (extracted.process_number) {
    const { data: process } = await supabase
      .from("processes")
      .select("id")
      .eq("organization_id", session.profile.organization_id)
      .eq("number", extracted.process_number)
      .maybeSingle();
    matchedProcessId = process?.id ?? null;
  }

  const responsibleUserId = oab.profile_id ?? session.profile.id;

  const { data: deadline, error: deadlineError } = await supabase
    .from("deadlines")
    .insert({
      organization_id: session.profile.organization_id,
      process_id: matchedProcessId,
      title: extracted.deadline_title,
      description: extracted.summary,
      due_date: extracted.due_date
        ? new Date(extracted.due_date).toISOString()
        : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      priority: extracted.priority,
      reminder_frequency: "daily",
      responsible_user_id: responsibleUserId,
      origin: "auto_monitoring",
      source_publication_id: publication.id,
      created_by: session.profile.id,
    })
    .select("id")
    .single();

  if (deadlineError || !deadline) {
    return NextResponse.json({ error: deadlineError?.message ?? "Falha ao criar prazo" }, { status: 500 });
  }

  await supabase
    .from("monitored_publications")
    .update({ detected_deadline_id: deadline.id })
    .eq("id", publication.id);

  await supabase.from("notifications").insert({
    organization_id: session.profile.organization_id,
    user_id: responsibleUserId,
    type: "deadline_due",
    channel: "in_app",
    title: "Novo prazo detectado automaticamente",
    body: extracted.deadline_title,
    link: "/deadlines",
  });

  await supabase.from("ai_agent_runs").insert({
    organization_id: session.profile.organization_id,
    agent_type: "controladoria",
    summary: `Prazo detectado via monitoramento: ${extracted.deadline_title}`,
    details: { publicationId: publication.id, deadlineId: deadline.id },
    process_id: matchedProcessId,
  });

  return NextResponse.json({ extracted, deadlineId: deadline.id, publicationId: publication.id });
}
