"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import { cn, formatRelative } from "@/lib/utils";
import type { Notification } from "@/types/database.types";

export function NotificationsPopover({ userId }: { userId: string }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    let active = true;

    supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (active && data) setNotifications(data as Notification[]);
      });

    const channel = supabase
      .channel("notifications-" + userId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-1.5 rounded-full bg-accent" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-medium">Notificações</p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-accent hover:underline cursor-pointer">
              Marcar todas como lidas
            </button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por aqui.
            </p>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  className={cn(
                    "flex flex-col gap-0.5 border-b border-border px-4 py-3 text-sm hover:bg-secondary",
                    !n.is_read && "bg-accent-soft/40"
                  )}
                >
                  <span className="font-medium">{n.title}</span>
                  {n.body && <span className="text-xs text-muted-foreground">{n.body}</span>}
                  <span className="text-xs text-muted-foreground/70">{formatRelative(n.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
