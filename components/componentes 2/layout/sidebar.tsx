"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, LogoMark } from "@/components/brand/logo";
import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        {collapsed ? <LogoMark /> : <Logo />}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-none px-2 py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <p className="px-3 pb-1 text-xs font-medium text-muted-foreground/70">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className={cn("size-4 shrink-0", active && "text-accent")} />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
