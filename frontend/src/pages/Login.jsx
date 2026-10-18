import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import api from "../api";
import { setCredentials } from "../store/authSlice";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      dispatch(setCredentials(data));

      const destination =
        data.user.role === "provider"
          ? "/provider"
          : location.state?.from || "/dashboard";

      navigate(destination, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      text="Sign in to continue to your Appointify account."
    >
      <form onSubmit={submit} className="auth-form">
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            placeholder="you@example.com"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            required
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder="Your password"
          />
        </label>

        {error && <Alert text={error} />}

        <button className="button button-dark button-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
          <Icon name="arrow" size={17} />
        </button>
      </form>

      <p className="auth-foot">
        New to Appointify? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({ title, text, children }) {
  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-side">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <Icon name="check" size={18} />
            </span>
            Appointify
          </Link>

          <div>
            <p className="eyebrow">Simple scheduling</p>
            <h2>More time for people. Less time managing calendars.</h2>
            <p>
              Discover providers, book available slots, and keep appointments
              organized.
            </p>
          </div>

          <div className="auth-side-note">
            <Icon name="check" size={16} />
            Email confirmations and calendar-ready bookings
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-content">
            <p className="eyebrow">Your account</p>
            <h1>{title}</h1>
            <p className="auth-text">{text}</p>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Alert({ text }) {
  return <div className="alert alert-error">{text}</div>;
}
