import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Icon from "../components/Icon";
import { ProviderCard } from "../components/UI";

import { todayISO } from "../utils/date";

export default function Providers() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [service, setService] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [availableIds, setAvailableIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [providersResponse, servicesResponse] = await Promise.all([
          api.get("/auth/providers"),
          api.get("/services")
        ]);

        setProviders(providersResponse.data.providers);
        setServices(servicesResponse.data.services);
      } catch (error) {
        setError(error.response?.data?.message || "Could not load providers");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!date || !providers.length) return;

    let cancelled = false;

    async function loadAvailability() {
      try {
        const { data } = await api.get("/slots/availability", {
          params: { date }
        });

        if (!cancelled) {
          setAvailableIds(new Set(data.providerIds));
        }
      } catch {
        if (!cancelled) setAvailableIds(new Set());
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [date, providers.length]);

  const filteredProviders = useMemo(() => {
    const value = query.trim().toLowerCase();

    return providers.filter((provider) => {
      const providerServices = services.filter(
        (item) => item.providerId?._id === provider._id
      );

      const matchesSearch =
        !value ||
        provider.name.toLowerCase().includes(value) ||
        (provider.specialization || "").toLowerCase().includes(value) ||
        providerServices.some((item) =>
          item.name.toLowerCase().includes(value)
        );

      const matchesService =
        !service || providerServices.some((item) => item._id === service);

      const matchesAvailability =
        !availableOnly || availableIds.has(provider._id);

      return matchesSearch && matchesService && matchesAvailability;
    });
  }, [providers, services, query, service, availableOnly, availableIds]);

  return (
    <section>
      <div className="discover-hero">
        <div className="container">
          <p className="eyebrow">Discover</p>
          <h1>Find a provider that fits your schedule.</h1>
          <p>
            Search providers and services, then choose an available appointment
            time.
          </p>

          <div className="search-panel">
            <div className="search-field">
              <Icon name="search" size={20} />
              <input
                placeholder="Search provider or service"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <select
              value={service}
              onChange={(event) => setService(event.target.value)}
            >
              <option value="">All services</option>
              {services.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>

            <label className="filter-date">
              <Icon name="calendar" size={17} />
              <input
                type="date"
                min={todayISO()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>

            <button
              className={`filter-toggle ${availableOnly ? "active" : ""}`}
              onClick={() => setAvailableOnly((value) => !value)}
            >
              <Icon name="filter" size={17} />
              Available
            </button>
          </div>
        </div>
      </div>

      <div className="container section-tight">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="results-row">
          <p>
            <strong>{filteredProviders.length}</strong> providers
          </p>
          <span>{service ? "Filtered by service" : "All providers"}</span>
        </div>

        {loading ? (
          <div className="provider-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : filteredProviders.length ? (
          <div className="provider-grid">
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider._id}
                provider={provider}
                services={services.filter(
                  (item) => item.providerId?._id === provider._id
                )}
                onSelect={() => navigate(`/providers/${provider._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <Icon name="search" size={22} />
            </span>
            <h3>No providers found</h3>
            <p>Try another provider name, service, or clear your filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}
