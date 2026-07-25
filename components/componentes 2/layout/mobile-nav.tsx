"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Scale, KanbanSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { title: "Início", href: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", href: "/clients", icon: Users },
  { title: "Processos", href: "/processes", icon: Scale },
  { title: "Tarefas", href: "/tasks", icon: KanbanSquare },
  { title: "IA", href: "/ai", icon: Sparkles },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-16 shrink-0 items-center justify-around border-t border-border bg-card md:hidden">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-medium",
              active ? "text-accent" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
