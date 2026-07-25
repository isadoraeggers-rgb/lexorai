"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createDeadline } from "@/lib/actions/deadlines";
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

export function NewDeadlineSheet({
  processes,
}: {
  processes: { id: string; number: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createDeadline, undefined);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <SheetTrigger asChild>
        <Button>
          <Plus /> Novo prazo
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Novo prazo</SheetTitle>
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
            <Label htmlFor="due_date">Data e hora</Label>
            <Input id="due_date" name="due_date" type="datetime-local" required />
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
            <Label htmlFor="reminder_frequency">Lembrete</Label>
            <Select name="reminder_frequency" defaultValue="weekly">
              <SelectTrigger className="w-full" id="reminder_frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem lembrete</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SheetFooter className="px-0">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Criar prazo"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
