import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, SquareKanban as KanbanSquare, GraduationCap, FileText, SquareCheck as CheckSquare, Calendar, Sparkles, UserCog, Settings, Search, Bell, Plus, Moon, Sun, Menu, Check, X, Command, ChartBar as BarChart3, Zap, UserPlus, FilePlus, CalendarPlus, Mail, Upload, ChevronRight, ArrowUpRight, TrendingUp, MailWarning as FileWarning, Clock, Send, CircleCheck as CheckCircle2 } from "lucide-react";
import { useEffect, useState, useCallback, type ReactNode } from "react";
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
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
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
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const { notifications, markNotificationRead, markAllNotificationsRead, clients, isLoading } =
    useData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setQuickOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const active = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate({ to: "/search", search: { q: searchQ.trim() } });
    }
  };

  // Command palette items
  const cmdItems = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "Clients", to: "/clients", icon: Users },
    { label: "Applications", to: "/applications", icon: KanbanSquare },
    { label: "Universities", to: "/universities", icon: GraduationCap },
    { label: "Documents", to: "/documents", icon: FileText },
    { label: "Tasks", to: "/tasks", icon: CheckSquare },
    { label: "Calendar", to: "/calendar", icon: Calendar },
    { label: "AI Assistant", to: "/ai", icon: Sparkles },
    { label: "Analytics", to: "/analytics", icon: BarChart3 },
    { label: "Team", to: "/team", icon: UserCog },
    { label: "Settings", to: "/settings", icon: Settings },
    ...clients.slice(0, 10).map((c) => ({ label: c.name, to: `/clients/${c.id}`, icon: User })),
  ].filter((item) => item.label.toLowerCase().includes(cmdQuery.toLowerCase()));

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
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:block">
              ⌘K
            </kbd>
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

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-11 z-50 w-96 rounded-xl border border-border bg-card p-0 shadow-xl">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await markAllNotificationsRead();
                          setNotifOpen(false);
                        }}
                        className="text-xs text-primary hover:underline transition"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
                        <div className="mt-2 text-sm text-muted-foreground">No notifications</div>
                      </div>
                    ) : (
                      notifications.slice(0, 20).map((n) => (
                        <div
                          key={n.id}
                          className={
                            "flex items-start gap-3 border-b border-border px-4 py-3 transition hover:bg-secondary/30 " +
                            (n.read ? "" : "bg-primary/[0.03]")
                          }
                        >
                          <div
                            className={
                              "mt-0.5 h-2 w-2 shrink-0 rounded-full " +
                              (n.read ? "bg-transparent" : "bg-primary")
                            }
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{n.title}</div>
                            {n.message && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {n.message}
                              </div>
                            )}
                            <div className="mt-1 text-[10px] text-muted-foreground/60">
                              {new Date(n.created_at).toLocaleString()}
                            </div>
                          </div>
                          {!n.read && (
                            <button
                              onClick={async () => await markNotificationRead(n.id)}
                              className="text-muted-foreground hover:text-primary transition"
                              title="Mark read"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children ?? <Outlet />}</main>
      </div>

      {/* Command Palette */}
      {cmdOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setCmdOpen(false)} />
          <div className="fixed left-1/2 top-20 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search pages, clients, actions…"
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ESC
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto py-2">
              {cmdItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No results</div>
              ) : (
                cmdItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      navigate({ to: item.to });
                      setCmdOpen(false);
                      setCmdQuery("");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-secondary/60"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Quick Actions FAB */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setQuickOpen((v) => !v)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90 hover:scale-105"
        >
          <Zap className="h-5 w-5" />
        </button>
        {quickOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setQuickOpen(false)} />
            <div className="absolute bottom-14 right-0 w-56 rounded-xl border border-border bg-card p-2 shadow-xl">
              <QuickAction
                icon={UserPlus}
                label="New Client"
                onClick={() => {
                  setQuickOpen(false);
                  setNewClientOpen(true);
                }}
              />
              <QuickAction
                icon={FilePlus}
                label="New Application"
                onClick={() => {
                  setQuickOpen(false);
                  navigate({ to: "/applications" });
                }}
              />
              <QuickAction
                icon={CheckSquare}
                label="New Task"
                onClick={() => {
                  setQuickOpen(false);
                  navigate({ to: "/tasks" });
                }}
              />
              <QuickAction
                icon={CalendarPlus}
                label="New Event"
                onClick={() => {
                  setQuickOpen(false);
                  navigate({ to: "/calendar" });
                }}
              />
              <QuickAction
                icon={Upload}
                label="Upload Document"
                onClick={() => {
                  setQuickOpen(false);
                  navigate({ to: "/documents" });
                }}
              />
              <QuickAction
                icon={Mail}
                label="Send Email"
                onClick={() => {
                  setQuickOpen(false);
                  navigate({ to: "/ai" });
                }}
              />
            </div>
          </>
        )}
      </div>

      <ClientFormDialog open={newClientOpen} onOpenChange={setNewClientOpen} />
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-secondary/60"
    >
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </button>
  );
}
