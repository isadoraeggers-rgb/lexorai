import { createClient } from "@/lib/supabase/server";

export async function listTasks() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, status, priority, due_date, assigned_to, process_id, order_index")
    .order("order_index", { ascending: true });

  const userIds = Array.from(
    new Set((tasks ?? []).map((t) => t.assigned_to).filter((id): id is string => Boolean(id)))
  );
  const userById = new Map<string, { full_name: string; avatar_url: string | null }>();
  if (userIds.length > 0) {
    const { data: users } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
    users?.forEach((u) => userById.set(u.id, u));
  }

  const taskIds = (tasks ?? []).map((t) => t.id);
  const commentCounts = new Map<string, number>();
  if (taskIds.length > 0) {
    const { data: comments } = await supabase.from("task_comments").select("task_id").in("task_id", taskIds);
    comments?.forEach((c) => commentCounts.set(c.task_id, (commentCounts.get(c.task_id) ?? 0) + 1));
  }

  return (tasks ?? []).map((t) => ({
    ...t,
    assignee: t.assigned_to ? userById.get(t.assigned_to) : undefined,
    commentCount: commentCounts.get(t.id) ?? 0,
  }));
}

export async function getTaskComments(taskId: string) {
  const supabase = await createClient();
  const { data: comments } = await supabase
    .from("task_comments")
    .select("id, body, created_at, author_id")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  const authorIds = Array.from(new Set((comments ?? []).map((c) => c.author_id).filter((id): id is string => Boolean(id))));
  const authorById = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", authorIds);
    profiles?.forEach((p) => authorById.set(p.id, p.full_name));
  }

  return (comments ?? []).map((c) => ({
    ...c,
    authorName: c.author_id ? authorById.get(c.author_id) : undefined,
  }));
}
