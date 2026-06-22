import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  GraduationCap,
  FileText,
  CheckSquare,
  Calendar,
  Sparkles,
  UserCog,
  Settings,
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/applications", label: "Applications", icon: KanbanSquare },
  { to: "/universities", label: "Universities", icon: GraduationCap },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/ai", label: "AI Assistant", icon: Sparkles },
  { to: "/team", label: "Team", icon: UserCog },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);
  return { dark, toggle: () => setDark(d => !d) };
}

export function AppShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const { dark, toggle } = useDarkMode();

  const active = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            M
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">MobilityOS</span>
            <span className="text-[11px] text-muted-foreground">Mobility Operations</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
          <ul className="flex flex-col gap-0.5">
            {NAV.map(item => {
              const Icon = item.icon;
              const isActive = active(item.to, "exact" in item ? item.exact : undefined);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={
                      "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors " +
                      (isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")
                    }
                  >
                    <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent/60">
            <img src="https://i.pravatar.cc/40?img=47" alt="" className="h-8 w-8 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">Emma Wilson</div>
              <div className="truncate text-xs text-muted-foreground">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search clients, applications, documents…"
              className="h-9 w-full rounded-md border border-input bg-secondary/50 pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:bg-background"
            />
          </div>
          <button className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
            <Plus className="h-4 w-4" /> New Client
          </button>
          <button
            onClick={toggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground">
            <Bell className="h-4 w-4" />
          </button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
