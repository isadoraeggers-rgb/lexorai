import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ clients: [], processes: [], tasks: [] });
  }

  const supabase = await createClient();

  const [{ data: clients }, { data: processes }, { data: tasks }] = await Promise.all([
    supabase.from("clients").select("id, name, email").ilike("name", `%${q}%`).limit(5),
    supabase
      .from("processes")
      .select("id, number, subject, opposing_party")
      .or(`number.ilike.%${q}%,subject.ilike.%${q}%,opposing_party.ilike.%${q}%`)
      .limit(5),
    supabase.from("tasks").select("id, title, status").ilike("title", `%${q}%`).limit(5),
  ]);

  return NextResponse.json({
    clients: clients ?? [],
    processes: processes ?? [],
    tasks: tasks ?? [],
  });
}
