"use client";

import { useTransition } from "react";
import { updateMemberRole, toggleMemberActive } from "@/lib/actions/team";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initials } from "@/lib/utils";
import type { UserRole } from "@/types/database.types";

type Member = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
};

export function MemberRow({ member, canManage }: { member: Member; canManage: boolean }) {
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 border-t border-border py-3 first:border-none">
      <Avatar className="size-8">
        <AvatarFallback>{initials(member.full_name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{member.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>
      <Select
        value={member.role}
        disabled={!canManage}
        onValueChange={(role) => startTransition(() => updateMemberRole(member.id, role as UserRole))}
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="owner">Proprietário</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="lawyer">Advogado</SelectItem>
          <SelectItem value="paralegal">Paralegal</SelectItem>
          <SelectItem value="financial">Financeiro</SelectItem>
          <SelectItem value="viewer">Visualização</SelectItem>
        </SelectContent>
      </Select>
      <Switch
        checked={member.is_active}
        disabled={!canManage}
        onCheckedChange={(checked) => startTransition(() => toggleMemberActive(member.id, checked))}
      />
    </div>
  );
}
