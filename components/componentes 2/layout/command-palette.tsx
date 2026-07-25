"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Scale, CalendarClock, KanbanSquare, Sparkles, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ALL_NAV_ITEMS } from "@/lib/nav";

type SearchResults = {
  clients: { id: string; name: string; email: string | null }[];
  processes: { id: string; number: string; subject: string | null; opposing_party: string | null }[];
  tasks: { id: string; title: string; status: string }[];
};

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const setOpen = onOpenChange;

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then(setResults)
        .catch(() => {});
    }, 150);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Busca rápida" description="Navegue ou execute uma ação rápida">
      <CommandInput placeholder="Buscar clientes, processos, tarefas, ações..." value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        <CommandGroup heading="Ações rápidas">
          <CommandItem onSelect={() => go("/clients/new")}>
            <Plus /> Novo cliente
          </CommandItem>
          <CommandItem onSelect={() => go("/processes/new")}>
            <Scale /> Novo processo
          </CommandItem>
          <CommandItem onSelect={() => go("/tasks?new=1")}>
            <KanbanSquare /> Nova tarefa
          </CommandItem>
          <CommandItem onSelect={() => go("/deadlines?new=1")}>
            <CalendarClock /> Novo prazo
          </CommandItem>
          <CommandItem onSelect={() => go("/ai")}>
            <Sparkles /> Perguntar ao assistente de IA
          </CommandItem>
          <CommandItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {resolvedTheme === "dark" ? <Sun /> : <Moon />} Alternar tema
          </CommandItem>
        </CommandGroup>

        {results && results.clients.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Clientes">
              {results.clients.map((c) => (
                <CommandItem key={c.id} onSelect={() => go(`/clients/${c.id}`)}>
                  <Users /> {c.name}
                  {c.email && <span className="ml-auto text-xs text-muted-foreground">{c.email}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results && results.processes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Processos">
              {results.processes.map((p) => (
                <CommandItem key={p.id} onSelect={() => go(`/processes/${p.id}`)}>
                  <Scale /> {p.number}
                  {p.opposing_party && (
                    <span className="ml-auto text-xs text-muted-foreground">{p.opposing_party}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results && results.tasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tarefas">
              {results.tasks.map((t) => (
                <CommandItem key={t.id} onSelect={() => go(`/tasks?highlight=${t.id}`)}>
                  <KanbanSquare /> {t.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Navegar">
          {ALL_NAV_ITEMS.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              <item.icon /> {item.title}
              {item.shortcut && <span className="ml-auto text-xs text-muted-foreground">{item.shortcut}</span>}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
