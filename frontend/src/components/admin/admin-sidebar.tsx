"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, PanelLeft } from "lucide-react";
import { ADMIN_NAV, type AdminNavItem } from "@/constants";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AdminSidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const home = user
    ? hasPermission(user, "dashboard:view")
      ? "/admin"
      : hasPermission(user, "tasks:view")
        ? "/admin/tasks/my"
        : hasPermission(user, "attendance:view")
          ? "/admin/attendance"
          : hasPermission(user, "payroll:view")
            ? "/admin/payroll"
            : "/admin"
    : "/admin";
  const sections = React.useMemo(() => {
    const groups: Record<string, AdminNavItem[]> = { Overview: [] };
    for (const item of ADMIN_NAV) {
      if (item.permission && !hasPermission(user, item.permission)) continue;
      (groups[item.section || "Overview"] ??= []).push(item);
    }
    return groups;
  }, [user]);

  return (
    <div className={cn("flex h-full flex-col border-r bg-muted/20", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Link href={home} className="flex items-center gap-2 overflow-hidden">
          <span className="relative flex h-8 w-8 shrink-0 overflow-hidden items-center justify-center rounded-lg bg-white border border-slate-200/90 dark:border-slate-800 dark:bg-slate-900 p-0.5 shadow-xs">
            <Image src="/brand-logo.png" alt="C2D Admin" width={32} height={32} className="h-full w-full object-contain" />
          </span>
          {!collapsed && <span className="font-display font-bold">C2D Admin</span>}
        </Link>
        <Button variant="ghost" size="icon" className={cn("ml-auto h-8 w-8", collapsed && "hidden")} onClick={onToggle} aria-label="Collapse sidebar">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        {!collapsed && (
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </div>
        )}
        <nav className="space-y-1" aria-label="Admin navigation">
          {Object.entries(sections).map(([section, items]) => (
            <React.Fragment key={section}>
              {section !== "Overview" && (
                <>
                  {!collapsed && (
                    <div className="mb-1 mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {section}
                    </div>
                  )}
                  {collapsed && <div className="my-2 border-t" />}
                </>
              )}
              {items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const icon = (
                  <item.icon className="h-4 w-4 shrink-0" />
                );
                const label = (
                  <span className="flex-1 truncate text-left text-sm">{item.title}</span>
                );
                return collapsed ? (
                  <TooltipProvider key={item.href}>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "flex h-9 w-full items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                            active && "bg-primary/15 text-primary"
                          )}
                          aria-label={item.title}
                        >
                          {icon}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                      active && "bg-primary/15 text-primary"
                    )}
                  >
                    {icon}
                    {label}
                    {item.badge && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </React.Fragment>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export function AdminMobileNav() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open navigation" className="md:hidden">
        <PanelLeft className="h-5 w-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 shadow-xl">
            <AdminSidebar collapsed={false} onToggle={() => setOpen(false)} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
