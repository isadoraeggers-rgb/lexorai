"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createTask } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";

export function NewTaskSheet({
  team,
  processes,
  defaultOpen = false,
}: {
  team: { id: string; full_name: string }[];
  processes: { id: string; number: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [state, formAction, pending] = useActionState(createTask, undefined);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus /> Nova tarefa
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova tarefa</SheetTitle>
        </SheetHeader>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
          }}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-6"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="priority">Prioridade</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger className="w-full" id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Vencimento</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assigned_to">Responsável</Label>
            <Select name="assigned_to">
              <SelectTrigger className="w-full" id="assigned_to">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {team.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="process_id">Processo (opcional)</Label>
            <Select name="process_id">
              <SelectTrigger className="w-full" id="process_id">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                {processes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SheetFooter className="px-0">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Criar tarefa"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
