import { useEffect, useState } from "react";
import api from "../api";
import Icon from "../components/Icon";
import { Button, EmptyState, PageHeader } from "../components/UI";

const initialForm = {
  name: "",
  description: "",
  durationMinutes: 30
};

export default function ProviderServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/services/mine");
      setServices(data.services);
    } catch (error) {
      setError(error.response?.data?.message || "Could not load services");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (editing) {
        await api.put(`/services/${editing}`, form);
        setMessage("Service updated.");
      } else {
        await api.post("/services", form);
        setMessage("Service added.");
      }

      setForm(initialForm);
      setEditing(null);
      await load();
    } catch (error) {
      setError(error.response?.data?.message || "Could not save service");
    }
  }

  async function disable(id) {
    if (!window.confirm("Disable this service?")) return;

    try {
      await api.delete(`/services/${id}`);
      await load();
    } catch (error) {
      setError(error.response?.data?.message || "Could not disable service");
    }
  }

  function edit(service) {
    setEditing(service._id);
    setForm({
      name: service.name,
      description: service.description || "",
      durationMinutes: service.durationMinutes
    });
    setMessage("");
    setError("");
  }

  return (
    <section className="container section">
      <PageHeader
        eyebrow="Provider workspace"
        title="My services"
        text="Create the services people can book with you."
      />

      <div className="provider-content-grid">
        <div>
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Active services</p>
              <h2>{services.length} services</h2>
            </div>
          </div>

          {services.length ? (
            <div className="service-manage-list">
              {services.map((service) => (
                <article className="manage-service-card" key={service._id}>
                  <div className="service-icon">
                    <Icon name="briefcase" size={19} />
                  </div>

                  <div className="manage-service-info">
                    <div>
                      <h3>{service.name}</h3>
                      <span className="duration-chip">
                        <Icon name="clock" size={14} />
                        {service.durationMinutes} min
                      </span>
                    </div>
                    <p>{service.description || "No description added."}</p>
                  </div>

                  <div className="manage-actions">
                    <button onClick={() => edit(service)}>
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      className="danger-icon"
                      onClick={() => disable(service._id)}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No services yet"
              text="Add your first service using the form."
            />
          )}
        </div>

        <aside className="form-card sticky-card">
          <p className="eyebrow">{editing ? "Edit service" : "New service"}</p>
          <h2>{editing ? "Update your service" : "Create a service"}</h2>

          <form className="form-stack" onSubmit={submit}>
            <label className="field">
              <span>Service name</span>
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="General Consultation"
              />
            </label>

            <label className="field">
              <span>
                Description <em>optional</em>
              </span>
              <textarea
                rows="4"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Briefly describe what clients can expect."
              />
            </label>

            <label className="field">
              <span>Duration</span>
              <select
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    durationMinutes: Number(event.target.value)
                  })
                }
              >
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </label>

            {error && <div className="alert alert-error">{error}</div>}
            {message && (
              <div className="alert alert-success">{message}</div>
            )}

            <Button type="submit">
              {editing ? "Save changes" : "Add service"}
              <Icon name="arrow" size={16} />
            </Button>

            {editing && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setEditing(null);
                  setForm(initialForm);
                }}
              >
                Cancel editing
              </button>
            )}
          </form>
        </aside>
      </div>
    </section>
  );
}
