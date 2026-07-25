import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { listDeadlines } from "@/lib/data/deadlines";
import { listProcesses } from "@/lib/data/processes";
import { PageHeader } from "@/components/shared/page-header";
import { DeadlineBoard } from "@/components/deadlines/deadline-board";
import { NewDeadlineSheet } from "@/components/deadlines/new-deadline-sheet";
import { Button } from "@/components/ui/button";

export default async function DeadlinesPage() {
  const [deadlines, processes] = await Promise.all([listDeadlines(), listProcesses()]);

  return (
    <div>
      <PageHeader
        title="Prazos"
        description="Acompanhe prazos em dia, atrasados e concluídos."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/deadlines/monitoring">
                <ShieldAlert /> Monitoramento
              </Link>
            </Button>
            <NewDeadlineSheet processes={processes.map((p) => ({ id: p.id, number: p.number }))} />
          </>
        }
      />
      <DeadlineBoard deadlines={deadlines} />
    </div>
  );
}
