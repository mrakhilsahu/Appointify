import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import api from "../api";
import { AuthLayout, Alert } from "./Login";
import { setCredentials } from "../store/authSlice";

const initialForm = {
  name: "",
  email: "",
  password: "",
  specialization: "",
  bio: ""
};

export default function Register() {
  const [role, setRole] = useState("user");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        ...form,
        role
      });

      dispatch(setCredentials(data));
      navigate(role === "provider" ? "/provider" : "/dashboard", {
        replace: true
      });
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      text="Choose how you want to use Appointify and get started."
    >
      <div className="role-picker">
        <button
          type="button"
          className={role === "user" ? "selected" : ""}
          onClick={() => setRole("user")}
        >
          <span>
            <Icon name="user" size={20} />
          </span>
          <strong>Book appointments</strong>
          <small>Find providers and manage bookings.</small>
        </button>

        <button
          type="button"
          className={role === "provider" ? "selected" : ""}
          onClick={() => setRole("provider")}
        >
          <span>
            <Icon name="briefcase" size={20} />
          </span>
          <strong>Provide appointments</strong>
          <small>Offer services and manage availability.</small>
        </button>
      </div>

      <form onSubmit={submit} className="auth-form">
        <label className="field">
          <span>Full name</span>
          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            placeholder="Your name"
          />
        </label>

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

        {role === "provider" && (
          <>
            <label className="field">
              <span>Specialization</span>
              <input
                required
                value={form.specialization}
                onChange={(event) =>
                  setForm({ ...form, specialization: event.target.value })
                }
                placeholder="e.g. General Physician"
              />
            </label>

            <label className="field">
              <span>
                Short bio <em>optional</em>
              </span>
              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm({ ...form, bio: event.target.value })
                }
                placeholder="Tell people a little about your services."
                rows="3"
              />
            </label>
          </>
        )}

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            minLength="6"
            required
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder="At least 6 characters"
          />
        </label>

        {error && <Alert text={error} />}

        <button className="button button-dark button-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
          <Icon name="arrow" size={17} />
        </button>
      </form>

      <p className="auth-foot">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
