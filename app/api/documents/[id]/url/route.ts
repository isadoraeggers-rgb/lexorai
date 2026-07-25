import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: doc } = await supabase.from("documents").select("file_path").eq("id", id).maybeSingle();
  if (!doc) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 60 * 5);
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Falha ao gerar link" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
