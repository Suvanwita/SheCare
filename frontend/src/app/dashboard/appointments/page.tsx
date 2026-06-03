"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  MapPin,
  Monitor,
  Search,
  Star,
  Stethoscope,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { cn, formatDate } from "../../../lib/utils";
import { useAppointmentStore } from "../../../store/appointmentStore";
import { useNotificationStore } from "../../../store/notificationStore";
import type { AppointmentStatus } from "../../../services/appointment.service";
import type { Doctor } from "../../../services/doctor.service";

const bookingSchema = z.object({
  doctorId: z.string().min(1, "Select a doctor"),
  date: z.string().min(1, "Date is required"),
  slot: z.string().min(1, "Select a slot"),
  appointmentType: z.enum(["online", "clinic"], {
    message: "Choose an appointment type",
  }),
  reason: z.string().trim().min(1, "Reason is required").max(180, "Reason is too long"),
  notes: z.string().max(260, "Notes cannot exceed 260 characters").optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

type AvailabilityFilter = "all" | "morning" | "afternoon" | "evening";

const statusTone: Record<AppointmentStatus, string> = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  confirmed: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "border-destructive/20 bg-destructive/10 text-destructive",
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="flex items-center gap-1 text-xs font-semibold text-destructive">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

function hasAvailability(doctor: Doctor, filter: AvailabilityFilter) {
  if (filter === "all") {
    return true;
  }

  return doctor.availableSlots.some((slot) => {
    const hour = Number(slot.split(":")[0]);
    if (filter === "morning") {
      return hour < 12;
    }
    if (filter === "afternoon") {
      return hour >= 12 && hour < 17;
    }
    return hour >= 17;
  });
}

function getDoctorInitials(name: string) {
  return name
    .split(" ")
    .filter((part) => part && part !== "Dr.")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatusCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-foreground">{value}</p>
    </div>
  );
}

export default function AppointmentsDashboardPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const doctors = useAppointmentStore((state) => state.doctors);
  const appointments = useAppointmentStore((state) => state.appointments);
  const isLoadingDoctors = useAppointmentStore((state) => state.isLoadingDoctors);
  const isLoadingAppointments = useAppointmentStore((state) => state.isLoadingAppointments);
  const isStoreSubmitting = useAppointmentStore((state) => state.isSubmitting);
  const error = useAppointmentStore((state) => state.error);
  const fetchDoctors = useAppointmentStore((state) => state.fetchDoctors);
  const fetchMyAppointments = useAppointmentStore((state) => state.fetchMyAppointments);
  const bookAppointment = useAppointmentStore((state) => state.bookAppointment);
  const cancelMyAppointment = useAppointmentStore((state) => state.cancelAppointment);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      doctorId: "",
      date: "",
      slot: "",
      appointmentType: "online",
      reason: "",
      notes: "",
    },
  });

  const selectedSlot = useWatch({ control, name: "slot" });

  const specializations = useMemo(
    () => Array.from(new Set(doctors.map((doctor) => doctor.specialization))),
    [doctors]
  );
  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          doctors
            .map((doctor) => doctor.location)
            .filter((location): location is string => Boolean(location))
        )
      ),
    [doctors]
  );

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query) ||
          (doctor.location ?? "").toLowerCase().includes(query);
        const matchesAvailability = hasAvailability(doctor, availabilityFilter);

        return matchesSearch && matchesAvailability;
      }),
    [availabilityFilter, doctors, searchQuery]
  );

  const upcomingCount = appointments.filter((appointment) =>
    ["pending", "confirmed"].includes(appointment.status)
  ).length;
  const completedCount = appointments.filter((appointment) => appointment.status === "completed").length;
  const cancelledCount = appointments.filter((appointment) => appointment.status === "cancelled").length;

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        `${b.date}T${b.slot}`.localeCompare(`${a.date}T${a.slot}`)
      ),
    [appointments]
  );

  useEffect(() => {
    fetchMyAppointments();
  }, [fetchMyAppointments]);

  useEffect(() => {
    fetchDoctors({
      page: 1,
      limit: 50,
      specialization: specializationFilter === "all" ? undefined : specializationFilter,
      location: locationFilter === "all" ? undefined : locationFilter,
      minRating: ratingFilter === "all" ? undefined : ratingFilter,
    });
  }, [fetchDoctors, locationFilter, ratingFilter, specializationFilter]);

  const openBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    reset({
      doctorId: doctor._id,
      date: "",
      slot: doctor.availableSlots[0] ?? "",
      appointmentType: "online",
      reason: "",
      notes: "",
    });
  };

  const closeBooking = () => {
    setSelectedDoctor(null);
  };

  const onSubmit = async (data: BookingFormValues) => {
    const doctor = doctors.find((item) => item._id === data.doctorId);
    if (!doctor) {
      return;
    }

    await bookAppointment({
      doctor: doctor._id,
      date: data.date,
      slot: data.slot,
      appointmentType: data.appointmentType,
      reason: data.reason,
      notes: data.notes?.trim() || undefined,
    });
    await fetchNotifications({ page: 1, limit: 20 });
    closeBooking();
  };

  const cancelAppointment = async (id: string) => {
    await cancelMyAppointment(id);
    await fetchNotifications({ page: 1, limit: 20 });
  };

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          SheCare appointments
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Appointments
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Book consultations and manage upcoming visits.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard label="Upcoming" value={upcomingCount} icon={CalendarCheck} />
        <StatusCard label="Completed" value={completedCount} icon={CheckCircle2} />
        <StatusCard label="Cancelled" value={cancelledCount} icon={X} />
      </section>

      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-black text-foreground">Find a doctor</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Search and filter available SheCare partner doctors.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))]">
          <label className="relative block">
            <span className="sr-only">Search doctors</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search doctor, location..."
              className="h-12 w-full rounded-2xl border border-border/80 bg-muted/10 pl-10 pr-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
            />
          </label>

          <select
            value={specializationFilter}
            onChange={(event) => setSpecializationFilter(event.target.value)}
            className="h-12 rounded-2xl border border-border/80 bg-muted/10 px-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
          >
            <option value="all">All specializations</option>
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            className="h-12 rounded-2xl border border-border/80 bg-muted/10 px-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
          >
            <option value="all">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="h-12 rounded-2xl border border-border/80 bg-muted/10 px-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
          >
            <option value="all">Any rating</option>
            <option value="4.8">4.8+</option>
            <option value="4.7">4.7+</option>
            <option value="4.5">4.5+</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value as AvailabilityFilter)}
            className="h-12 rounded-2xl border border-border/80 bg-muted/10 px-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
          >
            <option value="all">Any availability</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>
      </section>

      {(error || isLoadingDoctors || isLoadingAppointments) && (
        <section
          className={cn(
            "rounded-3xl border px-5 py-4 text-sm font-bold",
            error
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-border/60 bg-card text-muted-foreground"
          )}
        >
          {error ||
            (isLoadingDoctors ? "Loading doctors..." : "Loading appointments...")}
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        {filteredDoctors.map((doctor, index) => (
          <motion.article
            key={doctor._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary to-secondary text-base font-black text-white shadow-md shadow-primary/20">
                  {getDoctorInitials(doctor.name)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">{doctor.name}</h3>
                  <p className="text-sm font-bold text-primary">{doctor.specialization}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {doctor.rating}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1">
                      <Stethoscope className="h-3.5 w-3.5 text-primary" />
                      {doctor.experienceYears ?? 0} yrs
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {doctor.location ?? "Remote"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Fee
                </p>
                <p className="text-xl font-black text-foreground">
                  ₹{(doctor.consultationFee ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Available slots
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {doctor.availableSlots.map((slot) => (
                  <span
                    key={slot}
                    className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => openBooking(doctor)}
              disabled={isStoreSubmitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95 sm:w-auto"
            >
              <CalendarCheck className="h-4 w-4" />
              Book Appointment
            </button>
          </motion.article>
        ))}
        {!isLoadingDoctors && filteredDoctors.length === 0 && (
          <div className="rounded-3xl border border-border/60 bg-card p-6 text-sm font-bold text-muted-foreground shadow-sm xl:col-span-2">
            No doctors match these filters.
          </div>
        )}
      </section>

      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-black text-foreground">My appointments</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Booked appointments are synced with your SheCare account.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">Doctor</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.map((appointment) => (
                <tr key={appointment._id} className="bg-card shadow-sm">
                  <td className="rounded-l-2xl px-3 py-3">
                    <p className="font-bold text-foreground">{appointment.doctor.name}</p>
                    <p className="text-xs text-muted-foreground">{appointment.reason}</p>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{formatDate(appointment.date)}</td>
                  <td className="px-3 py-3 font-semibold">{appointment.slot}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs font-bold capitalize text-muted-foreground">
                      {appointment.appointmentType === "online" ? (
                        <Monitor className="h-3.5 w-3.5" />
                      ) : (
                        <Users className="h-3.5 w-3.5" />
                      )}
                      {appointment.appointmentType}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-black capitalize", statusTone[appointment.status])}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="rounded-r-2xl px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => cancelAppointment(appointment._id)}
                      disabled={appointment.status === "cancelled" || isStoreSubmitting}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoadingAppointments && sortedAppointments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="rounded-2xl bg-card px-3 py-5 text-center text-sm font-bold text-muted-foreground shadow-sm"
                  >
                    No appointments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-foreground/10"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    Book consultation
                  </p>
                  <h3 className="mt-1 text-xl font-black text-foreground">
                    {selectedDoctor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoctor.specialization} · {selectedDoctor.location ?? "Remote"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeBooking}
                  className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close booking modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <input type="hidden" {...register("doctorId")} />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                    Date
                  </span>
                  <input
                    type="date"
                    {...register("date")}
                    className={cn(
                      "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                      errors.date ? "border-destructive/60" : "border-border/80"
                    )}
                  />
                  <FieldError message={errors.date?.message} />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                    Appointment type
                  </span>
                  <select
                    {...register("appointmentType")}
                    className={cn(
                      "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                      errors.appointmentType ? "border-destructive/60" : "border-border/80"
                    )}
                  >
                    <option value="online">Online</option>
                    <option value="clinic">Clinic</option>
                  </select>
                  <FieldError message={errors.appointmentType?.message} />
                </label>
              </div>

              <div className="mt-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Slot
                </span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {selectedDoctor.availableSlots.map((slot) => (
                    <label
                      key={slot}
                      className={cn(
                        "flex cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-sm font-bold transition-colors",
                        selectedSlot === slot
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/70 bg-muted/10 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <input
                        type="radio"
                        value={slot}
                        {...register("slot")}
                        className="sr-only"
                      />
                      {slot}
                    </label>
                  ))}
                </div>
                <FieldError message={errors.slot?.message} />
              </div>

              <label className="mt-4 block space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Reason
                </span>
                <input
                  type="text"
                  {...register("reason")}
                  className={cn(
                    "w-full rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                    errors.reason ? "border-destructive/60" : "border-border/80"
                  )}
                  placeholder="Cycle review, PCOS symptoms, nutrition..."
                />
                <FieldError message={errors.reason?.message} />
              </label>

              <label className="mt-4 block space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                  Notes
                </span>
                <textarea
                  {...register("notes")}
                  rows={4}
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40",
                    errors.notes ? "border-destructive/60" : "border-border/80"
                  )}
                  placeholder="Add reports, symptoms, or questions to discuss..."
                />
                <FieldError message={errors.notes?.message} />
              </label>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeBooking}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isStoreSubmitting}
                  className="rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Confirm booking
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
