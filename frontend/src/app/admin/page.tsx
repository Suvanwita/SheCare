import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  Newspaper,
  Stethoscope,
  Users,
} from "lucide-react";
import AdminStatCard from "../../components/admin/AdminStatCard";

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
    title: "View Analytics",
    href: "/admin/analytics",
    description: "Track platform health, usage trends, and content performance.",
  },
];

export default function AdminOverviewPage() {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Doctors"
          value="--"
          description="Provider records ready for admin management."
          icon={Stethoscope}
        />
        <AdminStatCard
          title="Articles"
          value="--"
          description="Knowledge Hub content and publishing workflow."
          icon={Newspaper}
        />
        <AdminStatCard
          title="Users"
          value="--"
          description="Accounts, roles, and access status."
          icon={Users}
        />
        <AdminStatCard
          title="Appointments"
          value="--"
          description="Consultation volume and status monitoring."
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
            Foundation Status
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
            Secure admin shell
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Route guard, navigation, logout, theme controls, and placeholder modules
            are ready. Data wiring can now be added module by module.
          </p>
        </div>
      </section>
    </>
  );
}
