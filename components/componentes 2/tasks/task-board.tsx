"use client";

import { useState, useTransition } from "react";
import { MessageSquare, KanbanSquare } from "lucide-react";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge, TASK_STATUS_LABEL } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { cn, formatDate, initials } from "@/lib/utils";
import type { TaskStatus, PriorityLevel } from "@/types/database.types";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date: string | null;
  commentCount: number;
  assignee?: { full_name: string; avatar_url: string | null };
};

const COLUMNS: TaskStatus[] = ["todo", "doing", "waiting", "done"];

export function TaskBoard({ tasks }: { tasks: TaskRow[] }) {
  const [items, setItems] = useState(tasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [, startTransition] = useTransition();

  function moveTask(id: string, status: TaskStatus) {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    startTransition(() => {
      updateTaskStatus(id, status);
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {COLUMNS.map((status) => {
          const columnItems = items.filter((t) => t.status === status);
          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) moveTask(dragId, status);
                setDragId(null);
              }}
              className="rounded-2xl bg-secondary/30 p-3"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-sm font-medium">{TASK_STATUS_LABEL[status]}</p>
                <span className="text-xs text-muted-foreground">{columnItems.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {columnItems.length === 0 ? (
                  <EmptyState icon={KanbanSquare} title="Vazio" className="border-none py-8" />
                ) : (
                  columnItems.map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => setDragId(task.id)}
                      onClick={() => setSelectedTask(task)}
                      className={cn(
                        "cursor-grab gap-2 p-3 active:cursor-grabbing",
                        dragId === task.id && "opacity-50"
                      )}
                    >
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={task.priority} />
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">{formatDate(task.due_date)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        {task.assignee ? (
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px]">
                              {initials(task.assignee.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <span />
                        )}
                        {task.commentCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="size-3" /> {task.commentCount}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetailSheet
        taskId={selectedTask?.id ?? null}
        title={selectedTask?.title}
        open={Boolean(selectedTask)}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </>
  );
}
