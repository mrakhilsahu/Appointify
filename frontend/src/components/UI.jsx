import { Link } from "react-router-dom";
import Icon from "./Icon";

export function PageHeader({ eyebrow, title, text, action }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {text && <p className="page-lead">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  to,
  onClick,
  variant = "dark",
  type = "button",
  disabled = false,
  className = ""
}) {
  const classes = `button button-${variant} ${className}`.trim();

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Status({ value }) {
  return <span className={`status status-${value}`}>{value}</span>;
}

export function EmptyState({
  icon = "calendar",
  title,
  text,
  action
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={22} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

export function SelectField({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  );
}

export function ProviderAvatar({ name, large = false }) {
  const initials =
    name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "P";

  return (
    <div className={`avatar ${large ? "avatar-large" : ""}`}>
      {initials}
    </div>
  );
}

export function ProviderCard({ provider, services = [], onSelect }) {
  return (
    <article className="provider-card fade-up">
      <div className="provider-card-top">
        <ProviderAvatar name={provider.name} />
        <span className="availability-dot">Available</span>
      </div>

      <h3>{provider.name}</h3>
      <p className="provider-specialization">
        {provider.specialization || "Appointment provider"}
      </p>
      <p className="provider-bio">
        {provider.bio ||
          "Offering convenient appointment times through Appointify."}
      </p>

      <div className="service-tags">
        {services.slice(0, 2).map((service) => (
          <span key={service._id}>{service.name}</span>
        ))}
      </div>

      <button className="card-link" onClick={onSelect}>
        <span>View availability</span>
        <Icon name="arrow" size={17} />
      </button>
    </article>
  );
}
