import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { EmptyState, Status } from "../components/UI";
import {
  cancelAppointment,
  fetchMyAppointments
} from "../store/appointmentSlice";

export default function MyAppointments() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(
    (state) => state.appointments
  );

  useEffect(() => {
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  async function cancel(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    await dispatch(cancelAppointment(id));
  }

  return (
    <section className="container section">
      <div className="page-header">
        <div>
          <p className="eyebrow">Your schedule</p>
          <h1>My appointments</h1>
          <p className="page-lead">
            Keep every upcoming and past booking in one place.
          </p>
        </div>
        <Link to="/providers" className="button button-dark">
          Book an appointment
          <Icon name="arrow" size={17} />
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="appointment-list">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : items.length ? (
        <div className="appointment-list">
          {items.map((appointment) => (
            <article className="appointment-card" key={appointment._id}>
              <div className="date-tile">
                <strong>{appointment.slotId?.date?.slice(8)}</strong>
                <span>
                  {new Date(
                    `${appointment.slotId?.date}T00:00:00`
                  ).toLocaleDateString("en-US", {
                    month: "short"
                  }).toUpperCase()}
                </span>
              </div>

              <div className="appointment-card-main">
                <div className="appointment-card-title">
                  <div>
                    <p className="eyebrow">
                      {appointment.providerId?.name}
                    </p>
                    <h2>{appointment.serviceId?.name}</h2>
                  </div>
                  <Status value={appointment.status} />
                </div>

                <p className="appointment-time">
                  <Icon name="clock" size={15} />
                  {appointment.slotId?.startTime} — {appointment.slotId?.endTime}
                </p>

                <div className="appointment-card-actions">
                  <Link to={`/appointments/${appointment._id}`}>
                    View details <Icon name="arrow" size={15} />
                  </Link>
                  {appointment.status === "confirmed" && (
                    <button onClick={() => cancel(appointment._id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No appointments yet"
          text="Find a provider and book your first appointment."
          action={
            <Link to="/providers" className="button button-dark">
              Find a provider
            </Link>
          }
        />
      )}
    </section>
  );
}
