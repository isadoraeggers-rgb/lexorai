import { NextResponse } from "next/server";
import { semanticSearchMemories } from "@/lib/data/second-brain";
import type { MemoryType } from "@/types/database.types";

export async function POST(request: Request) {
  const { query, type } = await request.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Informe uma busca." }, { status: 400 });
  }

  try {
    const results = await semanticSearchMemories(query, type as MemoryType | undefined);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar" },
      { status: 500 }
    );
  }
}
