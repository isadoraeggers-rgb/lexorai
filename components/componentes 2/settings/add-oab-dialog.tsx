"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createOabRegistration } from "@/lib/actions/oab";
import { maskOabNumber } from "@/lib/validation/oab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { BRAZILIAN_STATES } from "@/types/database.types";

export function AddOabDialog({ team }: { team: { id: string; full_name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [oabNumber, setOabNumber] = useState("");
  const [state, formAction, pending] = useActionState(createOabRegistration, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nova OAB
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar registro de OAB</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await formAction(formData);
            setOpen(false);
            setOabNumber("");
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="profile_id">Advogado</Label>
            <Select name="profile_id" required>
              <SelectTrigger className="w-full" id="profile_id">
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
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="oab_state">UF</Label>
              <Select name="oab_state" required>
                <SelectTrigger className="w-full" id="oab_state">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oab_number">Número</Label>
              <Input
                id="oab_number"
                name="oab_number"
                value={oabNumber}
                onChange={(e) => setOabNumber(maskOabNumber(e.target.value))}
                placeholder="49.412"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="practice_areas">Áreas de atuação (separadas por vírgula)</Label>
            <Input id="practice_areas" name="practice_areas" placeholder="Cível, Trabalhista" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="is_monitored" />
            Monitorar automaticamente
          </label>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
