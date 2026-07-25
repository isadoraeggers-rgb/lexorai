"use client";

import { useActionState, useState } from "react";
import { UserPlus } from "lucide-react";
import { inviteTeamMember } from "@/lib/actions/team";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(inviteTeamMember, undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> Convidar membro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar membro da equipe</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nome</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Função</Label>
            <Select name="role" defaultValue="lawyer">
              <SelectTrigger className="w-full" id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="lawyer">Advogado</SelectItem>
                <SelectItem value="paralegal">Paralegal</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="viewer">Visualização</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.success && <p className="text-sm text-success">Convite enviado!</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando..." : "Enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
