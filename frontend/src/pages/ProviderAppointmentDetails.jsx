import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import Icon from "../components/Icon";
import { Button, ProviderAvatar, Status } from "../components/UI";

export default function ProviderAppointmentDetails() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/appointments/provider");
        setAppointment(data.appointments.find((item) => item._id === id));
      } catch {
        setError("Could not load appointment.");
      }
    }

    load();
  }, [id]);

  async function update(status) {
    setError("");

    try {
      await api.patch(`/appointments/provider/${id}/status`, { status });
      setAppointment((current) => ({ ...current, status }));
    } catch (error) {
      setError(
        error.response?.data?.message || "Could not update appointment"
      );
    }
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
      <Link className="back-link" to="/provider/appointments">
        <Icon name="arrowLeft" size={17} />
        Back to appointments
      </Link>

      <div className="detail-layout provider-detail">
        <div className="detail-main">
          <div className="detail-head">
            <div className="provider-welcome">
              <ProviderAvatar name={appointment.userId?.name} />
              <div>
                <p className="eyebrow">Client appointment</p>
                <h1>{appointment.userId?.name}</h1>
                <p>{appointment.userId?.email}</p>
              </div>
            </div>
            <Status value={appointment.status} />
          </div>

          <div className="detail-grid">
            <Detail
              icon="briefcase"
              label="Service"
              value={appointment.serviceId?.name}
            />
            <Detail
              icon="calendar"
              label="Date"
              value={appointment.slotId?.date}
            />
            <Detail
              icon="clock"
              label="Time"
              value={`${appointment.slotId?.startTime} — ${appointment.slotId?.endTime}`}
            />
            <Detail
              icon="mail"
              label="Client email"
              value={appointment.userId?.email}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {appointment.status === "confirmed" && (
            <div className="detail-actions">
              <Button onClick={() => update("completed")}>
                Mark completed <Icon name="check" size={17} />
              </Button>
              <button
                className="button button-danger"
                onClick={() => update("rejected")}
              >
                Reject appointment
              </button>
            </div>
          )}
        </div>

        <aside className="reschedule-card">
          <p className="eyebrow">Appointment status</p>
          <h2>{appointment.status}</h2>
          <p>
            Confirmed bookings reserve a seat. Completing an appointment keeps
            the booking history without returning the seat.
          </p>
          <div className="side-check">
            <Icon name="check" size={16} />
            Slot reserved atomically
          </div>
          <div className="side-check">
            <Icon name="mail" size={16} />
            Confirmation email
          </div>
        </aside>
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
