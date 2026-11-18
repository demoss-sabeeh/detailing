import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutGrid, Users, Columns3, Contact, Car, FileText, CalendarClock, CalendarDays, MessagesSquare, BellRing, Workflow, Wrench, BarChart3, Settings, Menu, LogOut, RotateCcw, ExternalLink, Loader2, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DetailingMark } from "@/components/admin/DetailingMark";
import { BRAND } from "@/lib/brand";
import { RunDemoButton } from "@/components/admin/RunDemo";
import { resetDemo } from "@/lib/actions";
import { useInvalidate } from "@/lib/admin-data";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFollowUps } from "@/lib/admin-data";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: `${BRAND.productName} — Business Dashboard` }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { group: "Main", items: [{ to: "/admin", label: "Overview", icon: LayoutGrid, exact: true }, { to: "/admin/appointments", label: "Bookings", icon: CalendarClock }, { to: "/admin/calendar", label: "Calendar", icon: CalendarDays }] },
  { group: "Customers", items: [{ to: "/admin/customers", label: "Customers", icon: Contact }, { to: "/admin/vehicles", label: "Vehicles", icon: Car }, { to: "/admin/leads", label: "Leads & Inquiries", icon: Users }] },
  { group: "Business", items: [{ to: "/admin/services", label: "Services & Pricing", icon: Wrench }, { to: "/admin/revenue", label: "Revenue & Payments", icon: FileText }, { to: "/admin/analytics", label: "Reports", icon: BarChart3 }] },
  { group: "System", items: [{ to: "/admin/settings", label: "Settings", icon: Settings }] },
] as const;

function SideNav({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Admin">
      {NAV.map((g) => (
        <div key={g.group}>
          {!collapsed && <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-muted/60">{g.group}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.to}>
                <Link
                  to={it.to}
                  onClick={onNavigate}
                  activeOptions={{ exact: "exact" in it && it.exact }}
                  title={collapsed ? it.label : undefined}
                  className={cn("relative flex h-9 items-center gap-3 rounded-md px-2.5 text-[13px] font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground", collapsed && "justify-center px-0")}
                  activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:text-sidebar-primary before:absolute before:-left-3 before:top-2 before:bottom-2 before:w-0.5 before:rounded-r before:bg-sidebar-primary" }}
                >
                  <it.icon className="h-4 w-4 shrink-0" strokeWidth={1.9} /> {!collapsed && <span className="truncate">{it.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [resetting, setResetting] = useState(false);
  const invalidate = useInvalidate();
  const reminders = useFollowUps();
  const nav = useNavigate();
  const pageLabel = (() => {
    const items = NAV.flatMap((g) => g.items as readonly { to: string; label: string }[]);
    const hit = [...items].sort((a, b) => b.to.length - a.to.length).find((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
    return hit?.label ?? "Overview";
  })();

  async function doReset() {
    setResetting(true);
    try {
      await resetDemo();
      await invalidate();
      toast.success("Demo restored to its original state.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/auth" });
  }

  const footer = (c = false) => (
    <div className="space-y-1 border-t border-sidebar-border p-3">
      <Link to="/" target="_blank" className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-semibold text-sidebar-foreground hover:bg-sidebar-accent", c && "justify-center")}><ExternalLink className="h-4 w-4" /> {!c && "Customer website"}</Link>
      <Button variant="ghost" onClick={signOut} aria-label="Sign out" className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", c && "justify-center px-0")}><LogOut className="h-4 w-4" /> {!c && "Sign out"}</Button>
    </div>
  );

  return (
    <div className="admin-workspace flex min-h-screen bg-background">
      <aside className={cn("sticky top-0 hidden h-dvh shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex", collapsed ? "w-16" : "w-60")}>
        <div className={cn("flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
          <Link to="/admin" aria-label={`${BRAND.productName} overview`} className="min-w-0"><DetailingMark compact={collapsed} className={collapsed ? "h-7" : "h-8"} /></Link>
          {!collapsed && (
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)} className="h-8 w-8 shrink-0 text-navy-muted hover:bg-sidebar-accent hover:text-navy-foreground" aria-label="Collapse sidebar"><PanelLeftClose className="h-4 w-4" /></Button>
          )}
        </div>
        {collapsed && (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="mx-auto mt-3 h-8 w-8 text-navy-muted hover:bg-sidebar-accent hover:text-navy-foreground" aria-label="Expand sidebar"><PanelLeftOpen className="h-4 w-4" /></Button>
        )}
        {!collapsed && (
          <div className="mx-3 mt-3 rounded-md border border-sidebar-border px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky">Demo workspace</p>
            <p className="text-sm font-bold text-navy-foreground">{BRAND.demoBusiness.name}</p>
          </div>
        )}
        <SideNav collapsed={collapsed} />
        {footer(collapsed)}
      </aside>

      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="admin-workspace flex w-72 flex-col border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="flex h-16 items-center border-b border-sidebar-border px-4 text-navy-foreground"><DetailingMark /></SheetTitle>
          <SideNav onNavigate={() => setMobile(false)} />
          {footer()}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-surface/95 px-4 backdrop-blur md:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="h-11 w-11 lg:hidden" onClick={() => setMobile(true)} aria-label="Open navigation"><Menu /></Button>
            {BRAND.demoMode && (
              <span className="inline-flex items-center gap-2 rounded border border-warning/30 bg-warning-soft px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-warning">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" /> Demo mode
              </span>
            )}
            <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
              <span className="truncate font-semibold text-slate">{BRAND.demoBusiness.name}</span>
              <span className="text-mist">/</span>
              <span className="truncate font-bold text-navy">{pageLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Notifications"><BellRing /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-72"><p className="px-2 py-2 text-sm font-semibold">Reminders</p>{reminders.data?.filter((f) => ["pending", "scheduled"].includes(f.status)).slice(0, 5).map((f) => <DropdownMenuItem key={f.id} asChild><Link to="/admin/customers/$id" params={{ id: f.customer_id }}><span className="whitespace-normal">{f.customer?.first_name} · {f.reason}</span></Link></DropdownMenuItem>)}{!reminders.data?.some((f) => ["pending", "scheduled"].includes(f.status)) && <p className="p-2 text-xs text-slate">No pending reminders</p>}</DropdownMenuContent></DropdownMenu>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={resetting}>{resetting ? <Loader2 className="animate-spin" /> : <RotateCcw />}<span className="hidden sm:inline">Reset demo</span></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset the demo workspace?</AlertDialogTitle>
                  <AlertDialogDescription>All leads, customers, quotes and appointments return to the original seeded state. Anything created during this session is removed.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={doReset}>Reset demo</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="hidden md:block"><RunDemoButton /></div>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary" size="icon" aria-label="Profile menu"><Contact /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to="/admin/settings">Account settings</Link></DropdownMenuItem><DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 md:p-6 lg:p-8">
          <div key={pathname} className="animate-page-in"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
