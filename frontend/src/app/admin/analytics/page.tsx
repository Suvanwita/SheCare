"use client";

import { useEffect } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  FileText,
  Newspaper,
  Users,
} from "lucide-react";
import AdminStatCard from "../../../components/admin/AdminStatCard";
import { useAdminAnalyticsStore } from "../../../store/adminAnalyticsStore";

const chartColors = ["#e11d48", "#7c3aed", "#14b8a6", "#f59e0b", "#6366f1", "#ec4899"];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-lg p-5">
      <h2 className="text-lg font-black text-foreground">{title}</h2>
      <div className="mt-4 h-72">{children}</div>
    </section>
  );
}

export default function AdminAnalyticsPage() {
  const overview = useAdminAnalyticsStore((state) => state.overview);
  const isLoading = useAdminAnalyticsStore((state) => state.isLoading);
  const error = useAdminAnalyticsStore((state) => state.error);
  const fetchOverview = useAdminAnalyticsStore((state) => state.fetchOverview);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const userRoleData = overview
    ? [
        { name: "Users", value: Math.max(overview.users.totalUsers - overview.users.doctors - overview.users.admins, 0) },
        { name: "Doctors", value: overview.users.doctors },
        { name: "Admins", value: overview.users.admins },
      ]
    : [];

  const pcosRiskData = overview
    ? [
        { name: "Low", value: overview.pcos.lowRiskCount },
        { name: "Moderate", value: overview.pcos.moderateRiskCount },
        { name: "High", value: overview.pcos.highRiskCount },
      ]
    : [];

  return (
    <section className="space-y-5">
      <div className="glass-card rounded-lg p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BarChart3 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Admin Module
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
              Analytics
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Platform operations, content, health trends, and user activity at a glance.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading || !overview ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm font-semibold text-muted-foreground">
          Loading analytics overview...
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              title="Total Users"
              value={String(overview.users.totalUsers)}
              description={`${overview.users.activeUsers} active · ${overview.users.newUsersThisMonth} new this month`}
              icon={Users}
            />
            <AdminStatCard
              title="Appointments"
              value={String(overview.appointments.totalAppointments)}
              description={`${overview.appointments.pendingAppointments} pending · ${overview.appointments.completedAppointments} completed`}
              icon={CalendarCheck}
            />
            <AdminStatCard
              title="Articles"
              value={String(overview.knowledgeHub.totalArticles)}
              description={`${overview.knowledgeHub.publishedArticles} published · ${overview.knowledgeHub.totalArticleViews} views`}
              icon={Newspaper}
            />
            <AdminStatCard
              title="Reports"
              value={String(overview.reports.totalReports)}
              description={`${overview.healthTrends.averageCycleLength} day average cycle · ${overview.healthTrends.irregularCycleCount} irregular cycles`}
              icon={FileText}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Appointment Volume By Month">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.appointments.appointmentVolumeByMonth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#e11d48" fill="#e11d48" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Article Categories">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.knowledgeHub.popularCategories}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="PCOS Risk Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pcosRiskData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} label>
                    {pcosRiskData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Popular Symptoms">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.healthTrends.popularSymptoms} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={110} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#14b8a6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="User Role Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={userRoleData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {userRoleData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Reports By MIME Type">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.reports.reportsByMimeType}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <AdminStatCard
              title="Bookmarks"
              value={String(overview.knowledgeHub.totalBookmarks)}
              description={`${overview.knowledgeHub.featuredArticles} featured articles`}
              icon={Activity}
            />
            <AdminStatCard
              title="PCOS Assessments"
              value={String(overview.pcos.totalAssessments)}
              description={`${overview.pcos.highRiskCount} high risk · ${overview.pcos.moderateRiskCount} moderate`}
              icon={Activity}
            />
            <AdminStatCard
              title="Cancelled Appointments"
              value={String(overview.appointments.cancelledAppointments)}
              description="Operational cancellation count across the platform"
              icon={CalendarCheck}
            />
          </section>
        </>
      )}
    </section>
  );
}
