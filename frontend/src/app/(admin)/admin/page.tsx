"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Briefcase,
  Calculator,
  FolderKanban,
  Layers,
  Mail,
  RefreshCw,
  Users,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useAdmin";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLoader } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { timeAgo } from "@/lib/utils";

const PIE_COLORS = ["#8b5cf6", "#f59e0b", "#22d3ee", "#10b981", "#f43f5e"];

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <PageLoader label="Loading dashboard…" />
      </div>
    );
  }

  if (isError || !data) {
    return <EmptyState title="Could not load dashboard" description="Make sure the API is running and you're signed in." />;
  }

  const { counts, contactTrend, contactsByStatus, device } = data;
  const trend = contactTrend.map((d) => ({ date: d._id, leads: d.count }));
  const statusData = contactsByStatus.map((s) => ({ name: s._id, value: s.count }));
  const deviceData = [
    { name: "Mobile", value: device.mobile || 0 },
    { name: "Desktop", value: device.desktop || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Business overview at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/leads"><Users className="h-4 w-4" /> Leads</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/estimates"><Calculator className="h-4 w-4" /> Estimates</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={counts.contacts} icon={Users} tone="primary" hint="Contact enquiries" />
        <StatCard title="Projects" value={counts.projects} icon={FolderKanban} tone="success" />
        <StatCard title="Estimates" value={counts.estimates} icon={Calculator} tone="warning" />
        <StatCard title="Subscribers" value={counts.subscribers} icon={Mail} tone="danger" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Team Members" value={counts.team} icon={Briefcase} />
        <StatCard title="Services" value={counts.services} icon={Layers} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead trend (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <EmptyState title="No leads yet" description="Leads from the contact form and estimator will appear here." />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="leads" stroke="#8b5cf6" strokeWidth={2} fill="url(#leadGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads by status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <EmptyState title="No data" description="Lead statuses will appear here." />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {statusData.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-3">
              {statusData.map((s, i) => (
                <span key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {deviceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Device breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} dataKey="value" nameKey="name" outerRadius={70}>
                      {deviceData.map((d, i) => (
                        <Cell key={d.name} fill={i === 0 ? "#8b5cf6" : "#22d3ee"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent activity</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/activity">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <EmptyState title="No activity yet" description="Admin actions are logged here." />
            ) : (
              <ul className="divide-y">
                {data.recentActivity.map((log) => (
                  <li key={log._id} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{log.description}</p>
                      <p className="text-xs text-muted-foreground">{log.userName || "System"} · {timeAgo(log.createdAt)}</p>
                    </div>
                    <StatusBadge status={log.action} className="shrink-0" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>
    </div>
  );
}
