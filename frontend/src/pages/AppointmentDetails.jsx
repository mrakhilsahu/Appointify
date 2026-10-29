import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../api";
import Icon from "../components/Icon";
import { Button, Status } from "../components/UI";
import { todayISO } from "../utils/date";
import {
  cancelAppointment,
  fetchMyAppointments
} from "../store/appointmentSlice";

function calendarLink(appointment) {
  if (!appointment?.slotId?.date) return "#";

  const start = new Date(
    `${appointment.slotId.date}T${appointment.slotId.startTime}:00`
  );
  const end = new Date(
    `${appointment.slotId.date}T${appointment.slotId.endTime}:00`
  );

  const format = (date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${appointment.serviceId?.name || "Appointment"} with ${
      appointment.providerId?.name || "Provider"
    }`,
    dates: `${format(start)}/${format(end)}`,
    details: "Appointment booked through Appointify.",
    location: ""
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function AppointmentDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const appointment = useSelector((state) =>
    state.appointments.items.find((item) => item._id === id)
  );

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState(
    searchParams.get("confirmed")
      ? "Appointment confirmed. Your email notification is being processed."
      : ""
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!appointment) {
      dispatch(fetchMyAppointments());
    }
  }, [appointment, dispatch]);

  useEffect(() => {
    if (!appointment?.slotId?.date) return;

    setDate(appointment.slotId.date);
    loadSlots(appointment.slotId.date);
  }, [appointment]);

  async function loadSlots(selectedDate) {
    try {
      const { data } = await api.get("/slots", {
        params: {
          serviceId: appointment.serviceId._id,
          date: selectedDate,
          providerId: appointment.providerId._id
        }
      });

      setSlots(data.slots);
      setError("");
    } catch (error) {
      setSlots([]);
      setError(error.response?.data?.message || "Could not load slots.");
    }
  }

  const availableSlots = useMemo(
    () =>
      slots.filter(
        (slot) =>
          slot._id !== appointment?.slotId?._id && slot.availableSeats > 0
      ),
    [slots, appointment]
  );

  async function cancel() {
    if (!window.confirm("Cancel this appointment?")) return;

    const result = await dispatch(cancelAppointment(id));

    if (cancelAppointment.fulfilled.match(result)) {
      setMessage("Appointment cancelled successfully.");
    }
  }

  async function reschedule() {
    if (!selected) return;

    setSaving(true);
    setError("");

    try {
      await api.patch(`/appointments/${id}/reschedule`, {
        slotId: selected
      });

      await dispatch(fetchMyAppointments());
      setSelected("");
      setMessage("Appointment rescheduled successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Could not reschedule appointment"
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeDate(event) {
    const nextDate = event.target.value;
    setDate(nextDate);
    setSelected("");
    await loadSlots(nextDate);
  }

  if (!appointment) {
    return (
      <section className="container section">
        <div className="skeleton profile-skeleton" />
      </section>
    );
  }

  return (
    <section className="container section">
      <Link className="back-link" to="/appointments">
        <Icon name="arrowLeft" size={17} />
        Back to appointments
      </Link>

      {message && (
        <div
          className={`notice ${
            searchParams.get("confirmed") ? "notice-success" : ""
          }`}
        >
          <Icon name="check" size={18} />
          {message}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-head">
            <div>
              <p className="eyebrow">Appointment</p>
              <h1>{appointment.serviceId?.name}</h1>
              <p>
                {appointment.providerId?.name} ·{" "}
                {appointment.providerId?.specialization}
              </p>
            </div>
            <Status value={appointment.status} />
          </div>

          <div className="detail-grid">
            <Detail
              icon="calendar"
              label="Date"
              value={new Date(
                `${appointment.slotId?.date}T00:00:00`
              ).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
              })}
            />
            <Detail
              icon="clock"
              label="Time"
              value={`${appointment.slotId?.startTime} — ${appointment.slotId?.endTime}`}
            />
            <Detail
              icon="briefcase"
              label="Duration"
              value={`${appointment.serviceId?.durationMinutes} minutes`}
            />
            <Detail
              icon="user"
              label="Provider"
              value={appointment.providerId?.name}
            />
          </div>

          <div className="detail-actions">
            <a
              className="button button-light"
              href={calendarLink(appointment)}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="calendar" size={17} />
              Add to Google Calendar
            </a>

            {appointment.status === "confirmed" && (
              <button className="button button-danger" onClick={cancel}>
                Cancel appointment
              </button>
            )}
          </div>
        </div>

        {appointment.status === "confirmed" && (
          <aside className="reschedule-card">
            <p className="eyebrow">Need another time?</p>
            <h2>Reschedule</h2>
            <p>
              Choose another available slot with the same provider and service.
            </p>

            <label className="field">
              <span>Date</span>
              <input
                type="date"
                min={todayISO()}
                value={date}
                onChange={changeDate}
              />
            </label>

            <select
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="">Select a slot</option>
              {availableSlots.map((slot) => (
                <option key={slot._id} value={slot._id}>
                  {slot.startTime} — {slot.endTime}
                </option>
              ))}
            </select>

            <Button onClick={reschedule} disabled={!selected || saving}>
              {saving ? "Saving..." : "Reschedule"}
            </Button>
          </aside>
        )}
      </div>
    </section>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="detail-item">
      <span className="feature-icon">
        <Icon name={icon} size={18} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value || "-"}</strong>
      </div>
    </div>
  );
}
