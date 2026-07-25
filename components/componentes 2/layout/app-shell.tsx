"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PageTransition } from "@/components/layout/page-transition";
import type { Profile, Organization } from "@/types/database.types";

export function AppShell({
  profile,
  organization,
  children,
}: {
  profile: Profile;
  organization: Organization;
  children: React.ReactNode;
}) {
  const [commandOpen, setCommandOpen] = React.useState(false);

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          profile={profile}
          organization={organization}
          onOpenSearch={() => setCommandOpen(true)}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </div>
        <MobileNav />
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
