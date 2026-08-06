"use client";

import * as React from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, Eye, MousePointerClick, Users } from "lucide-react";
import { useAnalytics } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/utils";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

const DEVICE_COLORS = ["#8b5cf6", "#22d3ee", "#10b981", "#f59e0b"];

export default function AdminAnalyticsPage() {
  const [days, setDays] = React.useState(30);
  const { data, isLoading } = useAnalytics(days);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        description="Traffic and conversion insights from the website."
        actions={
          <div className="flex gap-1 rounded-lg border p-1">
            {RANGES.map((r) => (
              <Button
                key={r.days}
                size="sm"
                variant={days === r.days ? "secondary" : "ghost"}
                onClick={() => setDays(r.days)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : !data ? (
        <EmptyState title="No analytics data" description="Page visits are recorded once visitors arrive." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total visits" value={formatNumber(data.totalVisits)} icon={Eye} tone="primary" />
            <StatCard title="Unique visitors" value={formatNumber(data.uniqueVisits)} icon={Users} tone="success" />
            <StatCard title="Leads" value={formatNumber(data.leads)} icon={MousePointerClick} tone="warning" />
            <StatCard title="Estimates" value={formatNumber(data.estimates)} icon={CalendarDays} tone="danger" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visits per day</CardTitle>
              </CardHeader>
              <CardContent>
                {data.byDay.length === 0 ? (
                  <EmptyState title="No data yet" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byDay.map((d) => ({ date: d._id, visits: d.count }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="visits" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Devices</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(data.byDevice).length === 0 ? (
                  <EmptyState title="No data yet" />
                ) : (
                  <>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(data.byDevice).map(([name, value]) => ({ name, value }))}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={70}
                          >
                            {Object.entries(data.byDevice).map(([name], i) => (
                              <Cell key={name} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {Object.entries(data.byDevice).map(([name, value], i) => (
                        <span key={name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />
                          {name} ({value})
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top pages</CardTitle>
            </CardHeader>
            <CardContent>
              {data.byPage.length === 0 ? (
                <EmptyState title="No page views yet" />
              ) : (
                <ul className="divide-y">
                  {data.byPage.map((p) => (
                    <li key={p._id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{p._id}</span>
                      <span className="font-medium">{formatNumber(p.count)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
