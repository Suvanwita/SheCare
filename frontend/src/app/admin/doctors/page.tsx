"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Edit3,
  Eye,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import type { AdminDoctorAppointment } from "../../../services/adminDoctor.service";
import type { Doctor, DoctorPayload } from "../../../services/doctor.service";
import { useAdminDoctorStore } from "../../../store/adminDoctorStore";
import { formatDate } from "../../../lib/utils";

const emptyForm: DoctorPayload = {
  name: "",
  specialization: "",
  experienceYears: 0,
  rating: 0,
  location: "",
  consultationFee: 0,
  availableSlots: [],
  bio: "",
  isVerified: false,
};

type DoctorModalMode = "create" | "edit";

function getPatientLabel(appointment: AdminDoctorAppointment) {
  const user = appointment.user;

  if (typeof user === "string") {
    return user;
  }

  return user.fullName || user.email || "Patient";
}

function DoctorFormModal({
  doctor,
  mode,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  doctor: Doctor | null;
  mode: DoctorModalMode;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: DoctorPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<DoctorPayload>(emptyForm);
  const [slotsText, setSlotsText] = useState("");

  useEffect(() => {
    if (doctor) {
      setForm({
        name: doctor.name,
        specialization: doctor.specialization,
        experienceYears: doctor.experienceYears ?? 0,
        rating: doctor.rating ?? 0,
        location: doctor.location ?? "",
        consultationFee: doctor.consultationFee ?? 0,
        availableSlots: doctor.availableSlots ?? [],
        bio: doctor.bio ?? "",
        isVerified: doctor.isVerified,
      });
      setSlotsText((doctor.availableSlots ?? []).join(", "));
      return;
    }

    setForm(emptyForm);
    setSlotsText("");
  }, [doctor]);

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      experienceYears: Number(form.experienceYears) || 0,
      rating: Math.min(Math.max(Number(form.rating) || 0, 0), 5),
      consultationFee: Number(form.consultationFee) || 0,
      availableSlots: slotsText
        .split(",")
        .map((slot) => slot.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
      <form
        onSubmit={submitForm}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {mode === "create" ? "Add doctor" : "Edit doctor"}
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground">
              Doctor profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close doctor form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">
              Specialization
            </span>
            <input
              value={form.specialization}
              onChange={(event) =>
                setForm({ ...form, specialization: event.target.value })
              }
              required
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">
              Experience years
            </span>
            <input
              type="number"
              min={0}
              value={form.experienceYears}
              onChange={(event) =>
                setForm({ ...form, experienceYears: Number(event.target.value) })
              }
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Rating</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(event) =>
                setForm({ ...form, rating: Number(event.target.value) })
              }
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Location</span>
            <input
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">
              Consultation fee
            </span>
            <input
              type="number"
              min={0}
              value={form.consultationFee}
              onChange={(event) =>
                setForm({ ...form, consultationFee: Number(event.target.value) })
              }
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-bold text-muted-foreground">
              Available slots
            </span>
            <input
              value={slotsText}
              onChange={(event) => setSlotsText(event.target.value)}
              placeholder="09:30, 11:00, 16:30"
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-bold text-muted-foreground">Bio</span>
            <textarea
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
              rows={4}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3 md:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(form.isVerified)}
              onChange={(event) =>
                setForm({ ...form, isVerified: event.target.checked })
              }
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-bold text-foreground">Verified doctor</span>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save doctor"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AppointmentsDrawer({
  doctor,
  appointments,
  isLoading,
  onClose,
}: {
  doctor: Doctor | null;
  appointments: AdminDoctorAppointment[];
  isLoading: boolean;
  onClose: () => void;
}) {
  if (!doctor) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30 backdrop-blur-sm">
      <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Linked appointments
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground">
              {doctor.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close appointments drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm font-semibold text-muted-foreground">
              Loading appointments...
            </div>
          ) : null}

          {!isLoading && appointments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm font-semibold text-muted-foreground">
              No appointments linked to this doctor yet.
            </div>
          ) : null}

          {!isLoading &&
            appointments.map((appointment) => (
              <article
                key={appointment._id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground">
                      {getPatientLabel(appointment)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(appointment.date)} at {appointment.slot}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary">
                    {appointment.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {appointment.reason || "No reason provided."}
                </p>
              </article>
            ))}
        </div>
      </aside>
    </div>
  );
}

export default function AdminDoctorsPage() {
  const doctors = useAdminDoctorStore((state) => state.doctors);
  const pagination = useAdminDoctorStore((state) => state.pagination);
  const filters = useAdminDoctorStore((state) => state.filters);
  const appointments = useAdminDoctorStore((state) => state.appointments);
  const appointmentDoctor = useAdminDoctorStore((state) => state.appointmentDoctor);
  const isLoading = useAdminDoctorStore((state) => state.isLoading);
  const isSubmitting = useAdminDoctorStore((state) => state.isSubmitting);
  const isLoadingAppointments = useAdminDoctorStore(
    (state) => state.isLoadingAppointments
  );
  const error = useAdminDoctorStore((state) => state.error);
  const fetchDoctors = useAdminDoctorStore((state) => state.fetchDoctors);
  const createDoctor = useAdminDoctorStore((state) => state.createDoctor);
  const updateDoctor = useAdminDoctorStore((state) => state.updateDoctor);
  const deleteDoctor = useAdminDoctorStore((state) => state.deleteDoctor);
  const verifyDoctor = useAdminDoctorStore((state) => state.verifyDoctor);
  const unverifyDoctor = useAdminDoctorStore((state) => state.unverifyDoctor);
  const fetchAppointments = useAdminDoctorStore((state) => state.fetchAppointments);
  const clearAppointments = useAdminDoctorStore((state) => state.clearAppointments);
  const [search, setSearch] = useState(filters.search ?? "");
  const [specialization, setSpecialization] = useState(filters.specialization ?? "all");
  const [verifiedFilter, setVerifiedFilter] = useState(filters.isVerified ?? "all");
  const [modalMode, setModalMode] = useState<DoctorModalMode | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  const specializations = useMemo(
    () => ["all", ...Array.from(new Set(doctors.map((doctor) => doctor.specialization)))],
    [doctors]
  );

  useEffect(() => {
    fetchDoctors({ page: 1, limit: 10 });
  }, [fetchDoctors]);

  const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    fetchDoctors({
      search: search.trim(),
      specialization,
      isVerified: verifiedFilter,
      page: 1,
    });
  };

  const openCreateModal = () => {
    setEditingDoctor(null);
    setModalMode("create");
  };

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setModalMode("edit");
  };

  const closeModal = () => {
    setEditingDoctor(null);
    setModalMode(null);
  };

  const saveDoctor = async (payload: DoctorPayload) => {
    if (modalMode === "edit" && editingDoctor) {
      await updateDoctor(editingDoctor._id, payload);
    } else {
      await createDoctor(payload);
    }

    closeModal();
  };

  const viewAppointments = async (doctor: Doctor) => {
    await fetchAppointments(doctor._id);
  };

  return (
    <section className="space-y-5">
      <div className="glass-card rounded-lg p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Stethoscope className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Admin Module
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
                Doctors
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Manage provider profiles, verification status, slots, fees, and linked appointments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add doctor
          </button>
        </div>
      </div>

      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm lg:grid-cols-[1fr_14rem_12rem_auto]"
      >
        <label className="relative">
          <span className="sr-only">Search doctors</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, specialization, location..."
            className="h-11 w-full rounded-2xl border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </label>
        <select
          value={specialization}
          onChange={(event) => setSpecialization(event.target.value)}
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          {specializations.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All specializations" : item}
            </option>
          ))}
        </select>
        <select
          value={verifiedFilter}
          onChange={(event) =>
            setVerifiedFilter(event.target.value as "all" | "true" | "false")
          }
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <button
          type="submit"
          className="h-11 rounded-2xl border border-border bg-foreground px-5 text-sm font-bold text-background transition-colors hover:bg-foreground/90"
        >
          Apply
        </button>
      </form>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[62rem] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center font-semibold text-muted-foreground">
                    Loading doctors...
                  </td>
                </tr>
              ) : null}

              {!isLoading && doctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center font-semibold text-muted-foreground">
                    No doctors found.
                  </td>
                </tr>
              ) : null}

              {!isLoading &&
                doctors.map((doctor) => (
                  <tr key={doctor._id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-bold text-foreground">{doctor.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {doctor.experienceYears ?? 0} years experience
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {doctor.specialization}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {doctor.location || "Not set"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {doctor.consultationFee ? `₹${doctor.consultationFee}` : "Not set"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {doctor.rating?.toFixed(1) ?? "0.0"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          doctor.isVerified
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {doctor.isVerified ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {doctor.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => viewAppointments(doctor)}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="View appointments"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            doctor.isVerified
                              ? unverifyDoctor(doctor._id)
                              : verifyDoctor(doctor._id)
                          }
                          disabled={isSubmitting}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-50"
                          aria-label={doctor.isVerified ? "Unverify doctor" : "Verify doctor"}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(doctor)}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Edit doctor"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doctor)}
                          className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete doctor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total} doctors
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => fetchDoctors({ page: pagination.page - 1 })}
            className="rounded-xl border border-border px-3 py-2 font-bold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages || isLoading}
            onClick={() => fetchDoctors({ page: pagination.page + 1 })}
            className="rounded-xl border border-border px-3 py-2 font-bold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {modalMode ? (
        <DoctorFormModal
          doctor={editingDoctor}
          mode={modalMode}
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onSubmit={saveDoctor}
        />
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl">
            <h2 className="text-xl font-black text-foreground">Delete doctor?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This will remove {deleteTarget.name} from the doctor directory.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  await deleteDoctor(deleteTarget._id);
                  setDeleteTarget(null);
                }}
                className="rounded-2xl bg-destructive px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AppointmentsDrawer
        doctor={appointmentDoctor}
        appointments={appointments}
        isLoading={isLoadingAppointments}
        onClose={clearAppointments}
      />
    </section>
  );
}
