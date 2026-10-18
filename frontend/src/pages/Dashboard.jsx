import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";
import Icon from "../components/Icon";
import { ProviderAvatar, ProviderCard, Status } from "../components/UI";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [appointmentsResponse, servicesResponse, providersResponse] =
          await Promise.all([
            api.get("/appointments/my"),
            api.get("/services"),
            api.get("/auth/providers")
          ]);

        setAppointments(appointmentsResponse.data.appointments);
        setServices(servicesResponse.data.services);
        setProviders(providersResponse.data.providers);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const upcoming = useMemo(
    () => appointments.find((item) => item.status === "confirmed"),
    [appointments]
  );

  const providerGroups = providers.slice(0, 3).map((provider) => ({
    ...provider,
    services: services.filter(
      (service) => service.providerId?._id === provider._id
    )
  }));

  return (
    <section>
      <div className="dashboard-hero">
        <div className="container dashboard-hero-inner">
          <div>
            <p className="eyebrow">Your workspace</p>
            <h1>Good morning, {user?.name?.split(" ")[0]}.</h1>
            <p>
              Find your next appointment or keep track of the ones you already
              have.
            </p>
          </div>
          <Link className="button button-dark" to="/providers">
            Find a provider <Icon name="arrow" size={17} />
          </Link>
        </div>
      </div>

      <div className="container section-tight">
        {loading ? (
          <div className="skeleton-grid">
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-main">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">Next up</p>
                  <h2>Upcoming appointment</h2>
                </div>
                <Link to="/appointments">View all</Link>
              </div>

              {upcoming ? (
                <AppointmentMini appointment={upcoming} />
              ) : (
                <div className="soft-card empty-inline">
                  <span className="empty-icon">
                    <Icon name="calendar" size={20} />
                  </span>
                  <div>
                    <strong>No upcoming appointment</strong>
                    <p>Find a provider and book a time that works for you.</p>
                  </div>
                  <Link to="/providers" className="button button-light">
                    Explore providers
                  </Link>
                </div>
              )}

              <div className="section-heading-row provider-heading">
                <div>
                  <p className="eyebrow">Discover</p>
                  <h2>Available providers</h2>
                </div>
                <Link to="/providers">See all</Link>
              </div>

              <div className="provider-grid">
                {providerGroups.map((provider) => (
                  <ProviderCard
                    key={provider._id}
                    provider={provider}
                    services={provider.services}
                    onSelect={() => {
                      window.location.href = `/providers/${provider._id}`;
                    }}
                  />
                ))}
              </div>
            </div>

            <aside className="dashboard-side">
              <div className="profile-summary">
                <ProviderAvatar name={user?.name} large />
                <p className="eyebrow">Signed in as</p>
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
                <span className="role-chip">Patient account</span>
                <Link to="/profile">
                  Manage profile <Icon name="arrow" size={15} />
                </Link>
              </div>

              <div className="quick-card">
                <p className="eyebrow">How it works</p>
                <MiniStep n="1" text="Find a provider" />
                <MiniStep n="2" text="Choose a service and slot" />
                <MiniStep n="3" text="Confirm your appointment" />
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function AppointmentMini({ appointment }) {
  return (
    <div className="appointment-mini">
      <div className="date-tile">
        <strong>{appointment.slotId?.date?.slice(8)}</strong>
        <span>
          {new Date(`${appointment.slotId?.date}T00:00:00`)
            .toLocaleDateString("en-US", { month: "short" })
            .toUpperCase()}
        </span>
      </div>

      <div className="appointment-mini-info">
        <p className="eyebrow">{appointment.providerId?.name}</p>
        <h3>{appointment.serviceId?.name}</h3>
        <p>
          <Icon name="clock" size={15} />
          {appointment.slotId?.startTime} — {appointment.slotId?.endTime}
        </p>
      </div>

      <Status value={appointment.status} />
      <Link to={`/appointments/${appointment._id}`} className="icon-button">
        <Icon name="chevron" size={18} />
      </Link>
    </div>
  );
}

function MiniStep({ n, text }) {
  return (
    <div className="mini-step">
      <span>{n}</span>
      <p>{text}</p>
    </div>
  );
}
