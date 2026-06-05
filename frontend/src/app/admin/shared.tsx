import type { LucideIcon } from "lucide-react";

interface AdminPlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  columns: string[];
}

export function AdminPlaceholderPage({
  icon: Icon,
  title,
  description,
  columns,
}: AdminPlaceholderPageProps) {
  return (
    <section className="space-y-5">
      <div className="glass-card rounded-lg p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Admin Module
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            Coming soon
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid min-w-[42rem] grid-cols-5 border-b border-border bg-muted/40 px-4 py-3">
          {columns.map((column) => (
            <span
              key={column}
              className="text-xs font-bold uppercase tracking-wide text-muted-foreground"
            >
              {column}
            </span>
          ))}
        </div>
        <div className="min-w-[42rem] px-4 py-10 text-center text-sm font-semibold text-muted-foreground">
          Data connection will be added in the next module pass.
        </div>
      </div>
    </section>
  );
}
