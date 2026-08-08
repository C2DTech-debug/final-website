"use client";

import * as React from "react";
import { CalendarClock, CalendarCheck, LogIn, LogOut } from "lucide-react";
import { useMyAttendance, useMyToday, useTeamAttendance, useTeamToday } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/lib/permissions";
import { formatTime } from "@/lib/utils";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function fmtHours(totalSeconds: number): string {
  if (!totalSeconds) return "—";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AdminAttendancePage() {
  const user = useAuthStore((s) => s.user);
  const [month, setMonth] = React.useState(currentMonth());
  const [tab, setTab] = React.useState("me");

  const [year, mon] = React.useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return [y || new Date().getFullYear(), m || new Date().getMonth() + 1];
  }, [month]);

  const canViewAll = hasPermission(user, "attendance:view_all");
  const activeTab = canViewAll ? tab : "me";

  const my = useMyAttendance(year, mon);
  const today = useMyToday();
  const team = useTeamAttendance(year, mon);
  const teamToday = useTeamToday();

  const myRecords = my.data ?? [];
  const todayRec = today.data;

  const presentDays = myRecords.filter((r) => r.status === "present").length;
  const totalSeconds = myRecords.reduce((acc, r) => acc + (r.totalSeconds ?? 0), 0);
  const clockedIn = todayRec?.clockIn && !todayRec?.clockOut;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance"
        description="Auto-recorded from your login / logout activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today" value={todayRec ? (clockedIn ? "Clocked in" : "Clocked out") : "Not recorded"} icon={CalendarCheck} tone={clockedIn ? "success" : "default"} />
        <StatCard title="Clock in" value={todayRec?.clockIn ? formatTime(todayRec.clockIn) : "—"} icon={LogIn} />
        <StatCard title="Clock out" value={todayRec?.clockOut ? formatTime(todayRec.clockOut) : "—"} icon={LogOut} />
        <StatCard title="Present days" value={presentDays} icon={CalendarClock} tone="primary" />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Month</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
        </div>
        {canViewAll && (
          <Tabs value={activeTab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="me">My attendance</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {activeTab === "team" && canViewAll ? (
        <div className="rounded-xl border">
          {team.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : teamToday.data?.length ? (
            <div className="border-b p-4">
              <h2 className="mb-3 text-sm font-semibold">Today</h2>
              <div className="flex flex-wrap gap-2">
                {teamToday.data.map((row) => (
                  <div key={row.user._id} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
                    <span className="font-medium">{row.user.name}</span>
                    {row.record?.clockOut ? (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(row.record.clockIn)} – {formatTime(row.record.clockOut)}
                      </span>
                    ) : row.record?.clockIn ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">Clocked in</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not recorded</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {team.data?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Half day</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Total hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.data.map((row) => (
                  <TableRow key={row.user._id}>
                    <TableCell>
                      <p className="text-sm font-medium">{row.user.name}</p>
                      <p className="text-xs text-muted-foreground">{row.user.email}</p>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{row.present}</TableCell>
                    <TableCell className="text-sm text-amber-600 dark:text-amber-400">{row.halfDay}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.absent}</TableCell>
                    <TableCell className="text-sm">{fmtHours(row.totalSeconds)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No attendance yet" description="Attendance is captured when team members sign in and out." />
          )}
        </div>
      ) : (
        <div className="rounded-xl border">
          {my.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : myRecords.length === 0 ? (
            <EmptyState
              title="No attendance records"
              description="Sign in and out of the dashboard — each day is recorded automatically."
              icon={CalendarClock}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock in</TableHead>
                  <TableHead>Clock out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRecords.map((r) => (
                  <TableRow key={r.date}>
                    <TableCell className="text-sm font-medium">{r.date}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.clockIn ? formatTime(r.clockIn) : "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.clockOut ? formatTime(r.clockOut) : "—"}</TableCell>
                    <TableCell className="text-sm">{fmtHours(r.totalSeconds ?? 0)}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Attendance is captured automatically when you sign in and sign out of the admin dashboard. No manual marking required.
      </p>
    </div>
  );
}
