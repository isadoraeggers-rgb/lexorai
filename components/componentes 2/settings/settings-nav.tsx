"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, FileText, Bell, User, Plug, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { title: "Escritório", href: "/settings", icon: Building2 },
  { title: "Equipe", href: "/settings/team", icon: Users },
  { title: "Registros de OAB", href: "/settings/oab", icon: ShieldCheck },
  { title: "Meu perfil", href: "/settings/profile", icon: User },
  { title: "Integrações", href: "/settings/integrations", icon: Plug },
  { title: "Modelos", href: "/templates", icon: FileText },
  { title: "Notificações", href: "/notifications", icon: Bell },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium",
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            <item.icon className="size-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
