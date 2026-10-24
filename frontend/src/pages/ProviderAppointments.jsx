import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Icon from "../components/Icon";
import { EmptyState, Status } from "../components/UI";

export default function ProviderAppointments() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/appointments/provider");
      setItems(data.appointments);
    } catch (error) {
      setError(
        error.response?.data?.message || "Could not load appointments"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (status === "all") return items;
    return items.filter((appointment) => appointment.status === status);
  }, [items, status]);

  async function update(id, nextStatus) {
    setError("");

    try {
      await api.patch(`/appointments/provider/${id}/status`, {
        status: nextStatus
      });
      await load();
    } catch (error) {
      setError(
        error.response?.data?.message || "Could not update appointment"
      );
    }
  }

  return (
    <section className="container section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Provider workspace</p>
          <h1>Appointments</h1>
          <p className="page-lead">
            See who has booked your services and manage the schedule.
          </p>
        </div>

        <select
          className="filter-select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="appointment-list">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : filtered.length ? (
        <div className="provider-appointment-list">
          {filtered.map((appointment) => (
            <article
              className="provider-appointment-card"
              key={appointment._id}
            >
              <div className="provider-appointment-time">
                <strong>{appointment.slotId?.startTime}</strong>
                <span>{appointment.slotId?.date}</span>
              </div>

              <div className="provider-appointment-info">
                <div className="appointment-card-title">
                  <div>
                    <p className="eyebrow">{appointment.userId?.email}</p>
                    <h2>{appointment.userId?.name}</h2>
                  </div>
                  <Status value={appointment.status} />
                </div>

                <p>
                  {appointment.serviceId?.name} ·{" "}
                  {appointment.slotId?.startTime} — {appointment.slotId?.endTime}
                </p>

                <div className="appointment-card-actions">
                  <Link to={`/provider/appointments/${appointment._id}`}>
                    View details <Icon name="arrow" size={15} />
                  </Link>

                  {appointment.status === "confirmed" && (
                    <>
                      <button
                        onClick={() =>
                          update(appointment._id, "completed")
                        }
                      >
                        Mark completed
                      </button>
                      <button
                        onClick={() => update(appointment._id, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="calendar"
          title="No appointments here"
          text="Bookings will appear here when users select your available slots."
        />
      )}
    </section>
  );
}
