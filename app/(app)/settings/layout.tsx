import { PageHeader } from "@/components/shared/page-header";
import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeader title="Configurações" description="Escritório, equipe, marca e preferências." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <SettingsNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
