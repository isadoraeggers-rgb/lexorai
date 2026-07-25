import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/data/profile";
import { pushProcessToNotion, pushClientToNotion } from "@/lib/notion/sync";

export async function POST(request: Request) {
  const session = await getCurrentProfile();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { entityType, entityId } = await request.json();

  try {
    let pageId: string;
    if (entityType === "process") {
      pageId = await pushProcessToNotion(session.profile.organization_id, entityId);
    } else if (entityType === "client") {
      pageId = await pushClientToNotion(session.profile.organization_id, entityId);
    } else {
      return NextResponse.json({ error: "Tipo de entidade não suportado" }, { status: 400 });
    }
    return NextResponse.json({ pageId });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro" }, { status: 500 });
  }
}
