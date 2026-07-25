"use client";

import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";
import { updateNotificationPrefs } from "@/lib/actions/notifications";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database.types";

const CHANNELS = [
  { key: "in_app", label: "No aplicativo", icon: Bell, ready: true },
  { key: "email", label: "E-mail", icon: Mail, ready: true },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, ready: false },
  { key: "push", label: "Push (mobile/desktop)", icon: Smartphone, ready: false },
] as const;

export function NotificationPrefsForm({ prefs }: { prefs: Profile["notification_prefs"] }) {
  return (
    <form action={updateNotificationPrefs} className="space-y-4">
      {CHANNELS.map((channel) => (
        <div key={channel.key} className="flex items-center justify-between">
          <Label htmlFor={channel.key} className="flex items-center gap-2 font-normal">
            <channel.icon className="size-4 text-muted-foreground" />
            {channel.label}
            {!channel.ready && (
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                Integração pendente
              </span>
            )}
          </Label>
          <Switch id={channel.key} name={channel.key} defaultChecked={prefs[channel.key]} />
        </div>
      ))}
      <Button type="submit" size="sm">
        Salvar preferências
      </Button>
    </form>
  );
}
