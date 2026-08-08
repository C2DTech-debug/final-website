"use client";

import * as React from "react";
import { Coins, Download } from "lucide-react";
import { usePayrollSummary } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function toCsv(rows: string[][]): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

export default function AdminPayrollPage() {
  const [month, setMonth] = React.useState(currentMonth());
  const [rate, setRate] = React.useState("");

  const [year, mon] = React.useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return [y || new Date().getFullYear(), m || new Date().getMonth() + 1];
  }, [month]);

  const { data, isLoading } = usePayrollSummary(year, mon);

  const rows = data?.rows ?? [];
  const ratePerPoint = Number(rate) || 0;
  const totalPoints = rows.reduce((acc, r) => acc + r.points, 0);
  const totalTasks = rows.reduce((acc, r) => acc + r.tasksCompleted, 0);
  const monthLabel = data ? new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(data.year, data.month - 1, 1)) : "";

  const handleExport = () => {
    const header = ["Member", "Role", "Tasks completed", "Points", "Present days", "Half days", "Amount (rate × points)"];
    const lines = rows.map((r) => [
      r.user.name,
      r.user.role.replace(/_/g, " "),
      String(r.tasksCompleted),
      String(r.points),
      String(r.presentDays),
      String(r.halfDays),
      ratePerPoint ? formatINR(r.points * ratePerPoint) : "",
    ]);
    const blob = new Blob([toCsv([header, ...lines])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `c2d-payroll-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Points & Payroll"
        description="Monthly task points and attendance per member. Set your own rate to preview payouts."
        actions={
          <Button size="sm" variant="outline" onClick={handleExport} disabled={rows.length === 0}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title={monthLabel || "This month"} value={`${totalPoints} pts`} icon={Coins} tone="primary" />
        <StatCard title="Tasks verified" value={totalTasks} icon={Coins} tone="success" />
        <StatCard
          title={ratePerPoint ? "Estimated payout" : "Payout"}
          value={ratePerPoint ? formatINR(totalPoints * ratePerPoint) : "Set a rate"}
          icon={Coins}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Month</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
        </div>
        <div className="space-y-2">
          <Label>₹ per point (optional preview)</Label>
          <Input
            type="number"
            min={0}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 50"
            className="w-40"
          />
        </div>
      </div>

      <div className="rounded-xl border">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No payroll data"
            description="Verified task points and attendance for this month will appear here."
            icon={Coins}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Tasks verified</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Present days</TableHead>
                <TableHead>Half days</TableHead>
                {ratePerPoint > 0 && <TableHead>Estimated payout</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.user._id}>
                  <TableCell>
                    <p className="text-sm font-medium">{row.user.name}</p>
                    <p className="text-xs text-muted-foreground">{row.user.email}</p>
                  </TableCell>
                  <TableCell className="text-sm">{row.tasksCompleted}</TableCell>
                  <TableCell className="text-sm font-semibold">{row.points}</TableCell>
                  <TableCell className="text-sm text-emerald-600 dark:text-emerald-400">{row.presentDays}</TableCell>
                  <TableCell className="text-sm text-amber-600 dark:text-amber-400">{row.halfDays}</TableCell>
                  {ratePerPoint > 0 && <TableCell className="text-sm font-medium">{formatINR(row.points * ratePerPoint)}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
            {ratePerPoint > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="font-semibold">{totalTasks}</TableCell>
                  <TableCell className="font-semibold">{totalPoints}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold">{formatINR(totalPoints * ratePerPoint)}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Points are awarded when a manager verifies your task. C2D Tech does not convert points to money automatically — set the
        rate above only to preview what a rate would pay. Each member calculates their own salary with their agreed per-point rate.
      </p>
    </div>
  );
}
