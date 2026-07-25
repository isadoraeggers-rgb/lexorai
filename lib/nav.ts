import {
  LayoutDashboard,
  Users,
  Scale,
  CalendarClock,
  Gavel,
  KanbanSquare,
  FolderOpen,
  FileText,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Visão geral",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
      { title: "Control Center", href: "/control-center", icon: ShieldCheck, shortcut: "G C" },
    ],
  },
  {
    label: "Operação",
    items: [
      { title: "Clientes", href: "/clients", icon: Users, shortcut: "G L" },
      { title: "Processos", href: "/processes", icon: Scale, shortcut: "G P" },
      { title: "Prazos", href: "/deadlines", icon: CalendarClock, shortcut: "G Z" },
      { title: "Monitoramento de Prazos", href: "/deadlines/monitoring", icon: ShieldAlert, shortcut: "G V" },
      { title: "Audiências", href: "/hearings", icon: Gavel, shortcut: "G H" },
      { title: "Tarefas", href: "/tasks", icon: KanbanSquare, shortcut: "G T" },
      { title: "Calendário", href: "/calendar", icon: CalendarDays, shortcut: "G A" },
    ],
  },
  {
    label: "Conhecimento",
    items: [
      { title: "Documentos", href: "/documents", icon: FolderOpen, shortcut: "G O" },
      { title: "Modelos", href: "/templates", icon: FileText, shortcut: "G M" },
      { title: "Second Brain", href: "/second-brain", icon: BrainCircuit, shortcut: "G S" },
      { title: "Assistente IA", href: "/ai", icon: Sparkles, shortcut: "G I" },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Relatórios", href: "/reports", icon: BarChart3, shortcut: "G R" },
      { title: "Notificações", href: "/notifications", icon: Bell, shortcut: "G N" },
      { title: "Configurações", href: "/settings", icon: Settings, shortcut: "G ," },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
