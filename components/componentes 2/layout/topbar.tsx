"use client";

import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { UserMenu } from "@/components/layout/user-menu";
import type { Profile, Organization } from "@/types/database.types";

export function Topbar({
  profile,
  organization,
  onOpenSearch,
}: {
  profile: Profile;
  organization: Organization;
  onOpenSearch: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <button
        onClick={onOpenSearch}
        className="flex h-8 flex-1 max-w-md items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary cursor-pointer"
      >
        <Search className="size-3.5" />
        <span>Buscar em tudo...</span>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationsPopover userId={profile.id} />
        <UserMenu profile={profile} organization={organization} />
      </div>
    </header>
  );
}
