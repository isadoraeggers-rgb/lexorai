"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createHearing } from "@/lib/actions/hearings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function NewHearingSheet({ processes }: { processes: { id: string; number: string }[] }) {
  const [open, setOpen] = useState(false);
  const [locationType, setLocationType] = useState("in_person");
  const [state, formAction, pending] = useActionState(createHearing, undefined);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus /> Nova audiência
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nova audiência</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" placeholder="Audiência de conciliação" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hearing_type">Tipo</Label>
            <Input id="hearing_type" name="hearing_type" placeholder="Conciliação, Instrução..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="scheduled_at">Data e hora</Label>
              <Input id="scheduled_at" name="scheduled_at" type="datetime-local" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration_minutes">Duração (min)</Label>
              <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={60} />
            </div>
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
            <Label htmlFor="location_type">Modalidade</Label>
            <Select name="location_type" defaultValue="in_person" onValueChange={setLocationType}>
              <SelectTrigger className="w-full" id="location_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">Presencial</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="hybrid">Híbrida</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {locationType !== "online" && (
            <div className="space-y-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" name="address" placeholder="Fórum, sala..." />
            </div>
          )}
          {locationType !== "in_person" && (
            <div className="space-y-1.5">
              <Label htmlFor="meet_url">Link (Google Meet)</Label>
              <Input id="meet_url" name="meet_url" placeholder="https://meet.google.com/..." />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="judge">Juiz</Label>
            <Input id="judge" name="judge" />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SheetFooter className="px-0">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Criar audiência"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
