"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Undo2, CalendarClock, Sparkles } from "lucide-react";
import { toggleDeadlineComplete } from "@/lib/actions/deadlines";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatDateTime } from "@/lib/utils";
import type { DeadlineStatus, PriorityLevel, DeadlineOrigin } from "@/types/database.types";

type DeadlineRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: DeadlineStatus;
  priority: PriorityLevel;
  process_id: string | null;
  origin?: DeadlineOrigin;
  processNumber?: string;
};

const COLUMNS: { status: DeadlineStatus; label: string; accent: string }[] = [
  { status: "upcoming", label: "Em dia", accent: "border-t-accent" },
  { status: "late", label: "Atrasados", accent: "border-t-destructive" },
  { status: "completed", label: "Concluídos", accent: "border-t-success" },
];

export function DeadlineBoard({ deadlines }: { deadlines: DeadlineRow[] }) {
  const [items, setItems] = useState(deadlines);
  const [, startTransition] = useTransition();

  function handleToggle(id: string, completed: boolean) {
    setItems((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: completed ? "completed" : new Date(d.due_date) < new Date() ? "late" : "upcoming" }
          : d
      )
    );
    startTransition(() => {
      toggleDeadlineComplete(id, completed);
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const columnItems = items.filter((d) => d.status === col.status);
        return (
          <div key={col.status} className={cn("rounded-2xl border-t-4 bg-secondary/30 p-3", col.accent)}>
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-medium">{col.label}</p>
              <span className="text-xs text-muted-foreground">{columnItems.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {columnItems.length === 0 ? (
                <EmptyState icon={CalendarClock} title="Nenhum prazo" className="border-none py-8" />
              ) : (
                columnItems.map((d) => (
                  <Card key={d.id} className="gap-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={d.process_id ? `/processes/${d.process_id}` : "#"}
                        className="text-sm font-medium hover:underline"
                      >
                        {d.title}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => handleToggle(d.id, col.status !== "completed")}
                        title={col.status === "completed" ? "Reabrir" : "Marcar como concluído"}
                      >
                        {col.status === "completed" ? <Undo2 className="size-3.5" /> : <Check className="size-3.5" />}
                      </Button>
                    </div>
                    {d.processNumber && (
                      <p className="text-xs text-muted-foreground">Processo {d.processNumber}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDateTime(d.due_date)}</p>
                    <div className="flex flex-wrap items-center gap-1">
                      <PriorityBadge priority={d.priority} />
                      {d.origin === "auto_monitoring" && (
                        <Badge variant="accent">
                          <Sparkles /> Detectado por IA
                        </Badge>
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
  );
}
