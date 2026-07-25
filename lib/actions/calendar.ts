"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function rescheduleEvent(eventId: string, newStartIso: string) {
  const [kind, id] = eventId.split(/-(.+)/);
  const supabase = await createClient();

  if (kind === "deadline") {
    await supabase.from("deadlines").update({ due_date: newStartIso }).eq("id", id);
  } else if (kind === "hearing") {
    await supabase.from("hearings").update({ scheduled_at: newStartIso }).eq("id", id);
  } else if (kind === "task") {
    await supabase.from("tasks").update({ due_date: newStartIso }).eq("id", id);
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}
