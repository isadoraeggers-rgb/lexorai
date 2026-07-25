import { getCurrentProfile } from "@/lib/data/profile";
import { listChats } from "@/lib/data/ai-chats";
import { PageHeader } from "@/components/shared/page-header";
import { AiWorkspace } from "@/components/ai/ai-workspace";

export default async function AiAssistantPage() {
  const session = await getCurrentProfile();
  const chats = await listChats(session!.profile.id);

  return (
    <div>
      <PageHeader
        title="Assistente de IA"
        description="Converse com o Assistente Geral ou escolha um dos agentes especializados do escritório."
      />
      <AiWorkspace initialChats={chats} />
    </div>
  );
}
