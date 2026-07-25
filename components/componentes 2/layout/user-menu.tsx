"use client";

import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";
import type { Profile, Organization } from "@/types/database.types";

export function UserMenu({
  profile,
  organization,
}: {
  profile: Profile;
  organization: Organization;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 outline-none hover:bg-secondary cursor-pointer">
        <Avatar className="size-7">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback>{initials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{profile.full_name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate">{profile.full_name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {organization.name}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <User /> Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings /> Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOut /> Sair
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
