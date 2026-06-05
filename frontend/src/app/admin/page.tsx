"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  FileText,
  Newspaper,
  Settings2,
  Stethoscope,
  Users,
} from "lucide-react";
import AdminStatCard from "../../components/admin/AdminStatCard";
import { useAdminAnalyticsStore } from "../../store/adminAnalyticsStore";

const quickLinks = [
  {
    title: "Manage Doctors",
    href: "/admin/doctors",
    description: "Add providers, update slots, fees, bios, and verification status.",
  },
  {
    title: "Manage Articles",
    href: "/admin/articles",
    description: "Create Knowledge Hub content, publish drafts, and feature education.",
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    description: "Review user roles, account status, and access controls.",
  },
  {
    title: "Run Tools",
    href: "/admin/tools",
    description: "Seed data, export article CSVs, refresh Trie search, and retrain ML.",
  },
];

export default function AdminOverviewPage() {
  const overview = useAdminAnalyticsStore((state) => state.overview);
  const isLoading = useAdminAnalyticsStore((state) => state.isLoading);
  const error = useAdminAnalyticsStore((state) => state.error);
  const fetchOverview = useAdminAnalyticsStore((state) => state.fetchOverview);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return (
    <>
      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Doctors"
          value={isLoading || !overview ? "--" : String(overview.users.doctors)}
          description={
            overview
              ? `${overview.users.admins} admins · ${overview.users.activeUsers} active users`
              : "Provider records ready for admin management."
          }
          icon={Stethoscope}
        />
        <AdminStatCard
          title="Articles"
          value={isLoading || !overview ? "--" : String(overview.knowledgeHub.totalArticles)}
          description={
            overview
              ? `${overview.knowledgeHub.publishedArticles} published · ${overview.knowledgeHub.featuredArticles} featured`
              : "Knowledge Hub content and publishing workflow."
          }
          icon={Newspaper}
        />
        <AdminStatCard
          title="Users"
          value={isLoading || !overview ? "--" : String(overview.users.totalUsers)}
          description={
            overview
              ? `${overview.users.newUsersThisMonth} new this month`
              : "Accounts, roles, and access status."
          }
          icon={Users}
        />
        <AdminStatCard
          title="Appointments"
          value={
            isLoading || !overview
              ? "--"
              : String(overview.appointments.totalAppointments)
          }
          description={
            overview
              ? `${overview.appointments.pendingAppointments} pending · ${overview.appointments.completedAppointments} completed`
              : "Consultation volume and status monitoring."
          }
          icon={CalendarCheck}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-card rounded-lg p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Quick Actions
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
                Admin workspace shortcuts
              </h2>
            </div>
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg dark:hover:shadow-primary/10"
              >
                <h3 className="font-bold text-foreground">{link.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-lg p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Operations Snapshot
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
            Live admin overview
          </h2>
          {overview ? (
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {overview.reports.totalReports} uploaded report records.
              </p>
              <p className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                {overview.knowledgeHub.totalArticleViews} article views and{" "}
                {overview.knowledgeHub.totalBookmarks} bookmarks.
              </p>
              <p className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                {overview.pcos.totalAssessments} PCOS assessments tracked.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {isLoading
                ? "Loading analytics summary..."
                : "Analytics summary will appear here once backend data is available."}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
