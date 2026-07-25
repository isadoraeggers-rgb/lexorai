import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/profile";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentProfile();

  if (!session) {
    redirect("/login");
  }

  if (!session.organization.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return (
    <TooltipProvider>
      <AppShell profile={session.profile} organization={session.organization}>
        {children}
      </AppShell>
    </TooltipProvider>
  );
}
