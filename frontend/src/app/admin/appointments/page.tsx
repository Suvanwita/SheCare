"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarCheck, CheckCircle2, Edit3, Search, X } from "lucide-react";
import type { AppointmentStatus, AppointmentType } from "../../../services/appointment.service";
import type { AdminAppointment } from "../../../services/adminAppointment.service";
import { useAdminAppointmentStore } from "../../../store/adminAppointmentStore";
import { formatDate } from "../../../lib/utils";

function personName(value: AdminAppointment["user"]) {
  return typeof value === "string" ? value : value.fullName || value.email || "Patient";
}

export default function AdminAppointmentsPage() {
  const appointments = useAdminAppointmentStore((s) => s.appointments);
  const pagination = useAdminAppointmentStore((s) => s.pagination);
  const isLoading = useAdminAppointmentStore((s) => s.isLoading);
  const isSubmitting = useAdminAppointmentStore((s) => s.isSubmitting);
  const error = useAdminAppointmentStore((s) => s.error);
  const fetchAppointments = useAdminAppointmentStore((s) => s.fetchAppointments);
  const updateStatus = useAdminAppointmentStore((s) => s.updateStatus);
  const resolveAppointment = useAdminAppointmentStore((s) => s.resolveAppointment);
  const [doctor, setDoctor] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [appointmentType, setAppointmentType] = useState<AppointmentType | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusTarget, setStatusTarget] = useState<AdminAppointment | null>(null);
  const [nextStatus, setNextStatus] = useState<AppointmentStatus>("confirmed");
  const [resolveTarget, setResolveTarget] = useState<AdminAppointment | null>(null);
  const [resolveNote, setResolveNote] = useState("");

  useEffect(() => {
    fetchAppointments({ page: 1, limit: 10 });
  }, [fetchAppointments]);

  const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    fetchAppointments({ doctor, status, appointmentType, startDate, endDate, page: 1 });
  };

  return (
    <section className="space-y-5">
      <div className="glass-card rounded-lg p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Admin Module</p>
            <h1 className="mt-1 text-3xl font-black text-foreground">Appointments</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Monitor appointments, update status, and resolve operational issues.</p>
          </div>
        </div>
      </div>

      <form onSubmit={applyFilters} className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm xl:grid-cols-[1fr_11rem_11rem_10rem_10rem_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Doctor ID" className="h-11 w-full rounded-2xl border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus | "all")} className="h-11 rounded-2xl border border-input bg-background px-4 text-sm">
          <option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
        <select value={appointmentType} onChange={(e) => setAppointmentType(e.target.value as AppointmentType | "all")} className="h-11 rounded-2xl border border-input bg-background px-4 text-sm">
          <option value="all">All types</option><option value="online">Online</option><option value="clinic">Clinic</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 rounded-2xl border border-input bg-background px-4 text-sm" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 rounded-2xl border border-input bg-background px-4 text-sm" />
        <button className="h-11 rounded-2xl bg-foreground px-5 text-sm font-bold text-background">Apply</button>
      </form>

      {error ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div> : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[68rem] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Doctor</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="px-4 py-10 text-center font-semibold text-muted-foreground">Loading appointments...</td></tr> : null}
              {!isLoading && appointments.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center font-semibold text-muted-foreground">No appointments found.</td></tr> : null}
              {!isLoading && appointments.map((item) => (
                <tr key={item._id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-4 font-bold text-foreground">{personName(item.user)}</td>
                  <td className="px-4 py-4 text-muted-foreground">{item.doctor?.name || "Doctor"}</td>
                  <td className="px-4 py-4 text-muted-foreground">{formatDate(item.date)} · {item.slot}</td>
                  <td className="px-4 py-4 text-muted-foreground">{item.appointmentType}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary">{item.status}</span></td>
                  <td className="px-4 py-4"><div className="flex justify-end gap-2">
                    <button onClick={() => { setStatusTarget(item); setNextStatus(item.status); }} className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted" aria-label="Update status"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => setResolveTarget(item)} className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted" aria-label="Resolve"><CheckCircle2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground"><span>Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total}</span><div className="flex gap-2"><button disabled={pagination.page <= 1} onClick={() => fetchAppointments({ page: pagination.page - 1 })} className="rounded-xl border border-border px-3 py-2 disabled:opacity-50">Previous</button><button disabled={pagination.page >= pagination.pages} onClick={() => fetchAppointments({ page: pagination.page + 1 })} className="rounded-xl border border-border px-3 py-2 disabled:opacity-50">Next</button></div></div>

      {statusTarget ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl"><button onClick={() => setStatusTarget(null)} className="float-right rounded-xl p-2 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button><h2 className="text-xl font-black">Update status</h2><select value={nextStatus} onChange={(e) => setNextStatus(e.target.value as AppointmentStatus)} className="mt-5 h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><button disabled={isSubmitting} onClick={async () => { await updateStatus(statusTarget._id, nextStatus); setStatusTarget(null); }} className="mt-5 w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">Save</button></div></div> : null}
      {resolveTarget ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl"><button onClick={() => setResolveTarget(null)} className="float-right rounded-xl p-2 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button><h2 className="text-xl font-black">Resolve appointment</h2><textarea value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} rows={4} placeholder="Resolution note" className="mt-5 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm" /><button disabled={isSubmitting || !resolveNote.trim()} onClick={async () => { await resolveAppointment(resolveTarget._id, resolveNote); setResolveTarget(null); setResolveNote(""); }} className="mt-5 w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">Resolve</button></div></div> : null}
    </section>
  );
}
