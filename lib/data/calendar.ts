import { createClient } from "@/lib/supabase/server";

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  allDay?: boolean;
  color: string;
  extendedProps: { kind: "deadline" | "hearing" | "task"; href: string };
};

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = await createClient();

  const [{ data: deadlines }, { data: hearings }, { data: tasks }] = await Promise.all([
    supabase.from("deadlines").select("id, title, due_date, process_id").neq("status", "completed"),
    supabase.from("hearings").select("id, title, scheduled_at").eq("status", "scheduled"),
    supabase.from("tasks").select("id, title, due_date").neq("status", "done").not("due_date", "is", null),
  ]);

  const events: CalendarEvent[] = [];

  (deadlines ?? []).forEach((d) =>
    events.push({
      id: `deadline-${d.id}`,
      title: `⏱ ${d.title}`,
      start: d.due_date,
      color: "#dc2626",
      extendedProps: { kind: "deadline", href: d.process_id ? `/processes/${d.process_id}` : "/deadlines" },
    })
  );

  (hearings ?? []).forEach((h) =>
    events.push({
      id: `hearing-${h.id}`,
      title: `⚖ ${h.title}`,
      start: h.scheduled_at,
      color: "#2563eb",
      extendedProps: { kind: "hearing", href: `/hearings/${h.id}` },
    })
  );

  (tasks ?? []).forEach((t) =>
    events.push({
      id: `task-${t.id}`,
      title: `✓ ${t.title}`,
      start: t.due_date as string,
      allDay: true,
      color: "#16a34a",
      extendedProps: { kind: "task", href: "/tasks" },
    })
  );

  return events;
}
