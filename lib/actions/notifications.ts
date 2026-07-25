"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profile";

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId);
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const session = await getCurrentProfile();
  if (!session) return;
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", session.profile.id)
    .eq("is_read", false);
  revalidatePath("/notifications");
}

export async function updateNotificationPrefs(formData: FormData) {
  const session = await getCurrentProfile();
  if (!session) return;
  const supabase = await createClient();

  await supabase
    .from("profiles")
    .update({
      notification_prefs: {
        in_app: formData.get("in_app") === "on",
        email: formData.get("email") === "on",
        push: formData.get("push") === "on",
        whatsapp: formData.get("whatsapp") === "on",
      },
    })
    .eq("id", session.profile.id);

  revalidatePath("/notifications");
  revalidatePath("/settings");
}
