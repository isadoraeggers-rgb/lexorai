import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { pullWikiIntoSecondBrain } from "@/lib/notion/sync";

export async function POST() {
  const session = await getCurrentProfile();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const imported = await pullWikiIntoSecondBrain(session.profile.organization_id);
    return NextResponse.json({ imported });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 500 });
  }
}
