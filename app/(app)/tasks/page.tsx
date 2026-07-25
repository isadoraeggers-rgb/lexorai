import { listTasks } from "@/lib/data/tasks";
import { listTeamMembers } from "@/lib/data/team";
import { listProcesses } from "@/lib/data/processes";
import { PageHeader } from "@/components/shared/page-header";
import { TaskBoard } from "@/components/tasks/task-board";
import { NewTaskSheet } from "@/components/tasks/new-task-sheet";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: openNew } = await searchParams;
  const [tasks, team, processes] = await Promise.all([listTasks(), listTeamMembers(), listProcesses()]);

  return (
    <div>
      <PageHeader
        title="Tarefas"
        description="Organize o trabalho do escritório em um quadro Kanban."
        actions={
          <NewTaskSheet
            team={team.map((t) => ({ id: t.id, full_name: t.full_name }))}
            processes={processes.map((p) => ({ id: p.id, number: p.number }))}
            defaultOpen={openNew === "1"}
          />
        }
      />
      <TaskBoard tasks={tasks} />
    </div>
  );
}
