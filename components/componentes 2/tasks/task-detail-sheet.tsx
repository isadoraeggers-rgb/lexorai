"use client";

import { useEffect, useState, useTransition } from "react";
import { addTaskComment } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { formatDateTime } from "@/lib/utils";

type Comment = { id: string; body: string; created_at: string; authorName?: string };

export function TaskDetailSheet({
  taskId,
  title,
  open,
  onOpenChange,
}: {
  taskId: string | null;
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (taskId && open) {
      fetch(`/api/tasks/${taskId}/comments`)
        .then((r) => r.json())
        .then(setComments)
        .catch(() => setComments([]));
    }
  }, [taskId, open]);

  if (!taskId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-border p-3 text-sm">
                <p>{c.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.authorName ?? "Usuário"} · {formatDateTime(c.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
        <form
          action={(formData) => {
            startTransition(async () => {
              await addTaskComment(taskId, formData);
              const res = await fetch(`/api/tasks/${taskId}/comments`);
              setComments(await res.json());
            });
          }}
          className="px-6"
        >
          <Textarea name="body" placeholder="Adicionar comentário..." rows={2} required />
          <SheetFooter className="px-0 pt-3">
            <Button type="submit" size="sm">
              Comentar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
