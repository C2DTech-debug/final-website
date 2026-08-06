"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { LogOut, Moon, ShieldCheck, Sun } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import type { AdminUser } from "@/types";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/admin-sidebar";
import { PageLoader } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [restoring, setRestoring] = React.useState(false);
  const validated = React.useRef(false);

  React.useEffect(() => setMounted(true), []);

  // Validate the session on every load whenever a token exists. Previously this
  // only ran when `user` was missing, so a stale (persisted) session rendered a
  // broken dashboard. Now expired sessions redirect to /admin/login instead.
  React.useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    if (validated.current) return;
    validated.current = true;

    setRestoring(true);
    api
      .get<{ user?: AdminUser }>("/api/v1/auth/me", { retryAuth: true })
      .then((data) => {
        if (data?.user) setUser(data.user);
        else throw new Error("Session invalid");
      })
      .catch(() => {
        logout();
        router.replace("/admin/login");
      })
      .finally(() => setRestoring(false));
  }, [mounted, token, router, setUser, logout]);

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout", {}).catch(() => undefined);
    } catch {
      // ignore
    }
    logout();
    router.replace("/admin/login");
  };

  if (!mounted || restoring || !token || !user) return <PageLoader label="Checking session…" />;

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden md:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </aside>

      <div className={cn("flex min-w-0 flex-1 flex-col transition-[padding] duration-300", collapsed ? "md:pl-16" : "md:pl-64")}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <AdminMobileNav />
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.roleLabel}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
