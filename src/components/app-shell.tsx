import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, SquareKanban as KanbanSquare, GraduationCap, FileText, SquareCheck as CheckSquare, Calendar, Sparkles, UserCog, Settings, Search, Bell, Plus, Moon, Sun, Menu, Check, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ClientFormDialog } from "@/components/dialogs";
import { useData } from "@/lib/data-provider";

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
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("mobilityos:dark") === "1";
    }
    return false;
  });
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      window.localStorage.setItem("mobilityos:dark", dark ? "1" : "0");
    } catch {
      // ignore
    }
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

export function AppShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { dark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const active = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate({ to: "/search", search: { q: searchQ.trim() } });
    }
  };

  const sidebar = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-sm text-primary-foreground">
          M
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">MobilityOS</span>
          <span className="text-[11px] text-muted-foreground">Mobility Operations</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active(item.to, "exact" in item ? item.exact : undefined);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={
                    "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors " +
                    (isActive
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
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
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        {sidebar}
      </aside>

      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden">
            {sidebar}
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <form onSubmit={submitSearch} className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search clients, applications, documents…"
              className="h-9 w-full rounded-md border border-input bg-secondary/50 pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:bg-background"
            />
          </form>
          <button
            onClick={() => setNewClientOpen(true)}
            className="hidden items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 sm:inline-flex"
          >
            <Plus className="h-4 w-4" /> New Client
          </button>
          <button
            onClick={toggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-card p-3 shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await markAllNotificationsRead();
                          setNotifOpen(false);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <ul className="max-h-64 space-y-1 overflow-y-auto">
                      {notifications.slice(0, 20).map((n) => (
                        <li
                          key={n.id}
                          className={
                            "flex items-start gap-2 rounded-lg p-2 text-sm " +
                            (n.read ? "text-muted-foreground" : "bg-primary/5 font-medium")
                          }
                        >
                          <div className="flex-1">
                            <div>{n.title}</div>
                            {n.message && (
                              <div className="text-xs text-muted-foreground">{n.message}</div>
                            )}
                          </div>
                          {!n.read && (
                            <button
                              onClick={async () => await markNotificationRead(n.id)}
                              className="text-muted-foreground hover:text-primary"
                              title="Mark read"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children ?? <Outlet />}</main>
      </div>

      <ClientFormDialog open={newClientOpen} onOpenChange={setNewClientOpen} />
    </div>
  );
}
