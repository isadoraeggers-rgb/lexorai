"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createMemory } from "@/lib/actions/second-brain";
import { MEMORY_TYPE_LABEL } from "@/components/second-brain/memory-type";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NewMemoryDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createMemory, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nova memória
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova memória</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="type">Tipo</Label>
            <Select name="type" defaultValue="note">
              <SelectTrigger className="w-full" id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEMORY_TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea id="content" name="content" rows={6} required />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar memória"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
