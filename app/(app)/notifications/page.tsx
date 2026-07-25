import { Bell } from "lucide-react";
import { getCurrentProfile } from "@/lib/data/profile";
import { listAllNotifications } from "@/lib/data/notifications";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificationPrefsForm } from "@/components/notifications/notification-prefs-form";
import { cn, formatDateTime } from "@/lib/utils";

export default async function NotificationsPage() {
  const session = await getCurrentProfile();
  const notifications = await listAllNotifications(session!.profile.id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <PageHeader
        title="Notificações"
        description={`${unreadCount} não lida${unreadCount === 1 ? "" : "s"}`}
        actions={
          unreadCount > 0 && (
            <form action={markAllNotificationsRead}>
              <Button variant="outline" type="submit">
                Marcar todas como lidas
              </Button>
            </form>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="Nenhuma notificação" />
          ) : (
            <div className="flex flex-col gap-2">
              {notifications.map((n) => {
                const markRead = markNotificationRead.bind(null, n.id);
                return (
                  <Card
                    key={n.id}
                    className={cn("flex-row items-start justify-between gap-3 p-4", !n.is_read && "bg-accent-soft/40")}
                  >
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <form action={markRead}>
                        <Button variant="ghost" size="sm" type="submit">
                          Marcar como lida
                        </Button>
                      </form>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationPrefsForm prefs={session!.profile.notification_prefs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
