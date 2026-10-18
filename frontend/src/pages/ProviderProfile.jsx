import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import Icon from "../components/Icon";
import { Button, ProviderAvatar } from "../components/UI";

export default function ProviderProfile() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [providersResponse, servicesResponse] = await Promise.all([
          api.get("/auth/providers"),
          api.get("/services", { params: { providerId: id } })
        ]);

        setProvider(
          providersResponse.data.providers.find((item) => item._id === id)
        );
        setServices(servicesResponse.data.services);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <section className="container section">
        <div className="skeleton profile-skeleton" />
      </section>
    );
  }

  if (!provider) {
    return (
      <section className="container section">
        <div className="empty-state">
          <h3>Provider not found</h3>
          <Link to="/providers" className="button button-dark">
            Back to providers
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container section">
      <Link className="back-link" to="/providers">
        <Icon name="arrowLeft" size={17} />
        Back to providers
      </Link>

      <div className="provider-profile-head">
        <ProviderAvatar name={provider.name} large />
        <div>
          <p className="eyebrow">Provider profile</p>
          <h1>{provider.name}</h1>
          <p className="profile-specialization">{provider.specialization}</p>
          <p className="profile-bio">
            {provider.bio || "Offering appointment services through Appointify."}
          </p>
        </div>
      </div>

      <div className="profile-content-grid">
        <div>
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Services</p>
              <h2>Choose a service</h2>
            </div>
          </div>

          {services.length ? (
            <div className="service-list">
              {services.map((service) => (
                <article className="service-row" key={service._id}>
                  <span className="service-icon">
                    <Icon name="briefcase" size={19} />
                  </span>
                  <div>
                    <h3>{service.name}</h3>
                    <p>{service.description || "Appointment service"}</p>
                  </div>
                  <div className="service-duration">
                    <Icon name="clock" size={15} />
                    {service.durationMinutes} min
                  </div>
                  <Button to={`/book/${service._id}?provider=${provider._id}`}>
                    View slots <Icon name="arrow" size={16} />
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No active services</h3>
              <p>This provider has not published a bookable service yet.</p>
            </div>
          )}
        </div>

        <aside className="profile-side-card">
          <p className="eyebrow">About booking</p>
          <h3>Simple and flexible</h3>
          <p>
            Choose a service, select one of the provider's available slots, and
            confirm instantly.
          </p>
          <div className="side-check">
            <Icon name="check" size={16} />
            Automatic confirmation
          </div>
          <div className="side-check">
            <Icon name="mail" size={16} />
            Email notification
          </div>
          <div className="side-check">
            <Icon name="calendar" size={16} />
            Google Calendar ready
          </div>
        </aside>
      </div>
    </section>
  );
}
