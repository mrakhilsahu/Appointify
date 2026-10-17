import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { logout } from "../store/authSlice";

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? "nav-link-active" : ""}`;

export default function Layout({ children }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const dashboard = user?.role === "provider" ? "/provider" : "/dashboard";

  function closeMenu() {
    setOpen(false);
    setProfileOpen(false);
  }

  useEffect(() => {
    function handleOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function logoutUser() {
    dispatch(logout());
    closeMenu();
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" onClick={closeMenu}>
            <span className="brand-mark">
              <Icon name="check" size={18} />
            </span>
            <span>Appointify</span>
          </Link>

          <button
            className="mobile-menu"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            <Icon name={open ? "x" : "menu"} />
          </button>

          <nav className={`site-nav ${open ? "site-nav-open" : ""}`}>
            {user ? (
              <NavLink to={dashboard} className={linkClass} onClick={closeMenu}>
                Dashboard
              </NavLink>
            ) : (
              <NavLink to="/" className={linkClass} onClick={closeMenu}>
                Home
              </NavLink>
            )}

            {user?.role === "user" && (
              <>
                <NavLink
                  to="/providers"
                  className={linkClass}
                  onClick={closeMenu}
                >
                  Find providers
                </NavLink>
                <NavLink
                  to="/appointments"
                  className={linkClass}
                  onClick={closeMenu}
                >
                  Appointments
                </NavLink>
              </>
            )}

            {user?.role === "provider" && (
              <>
                <NavLink
                  to="/provider/services"
                  className={linkClass}
                  onClick={closeMenu}
                >
                  Services
                </NavLink>
                <NavLink
                  to="/provider/availability"
                  className={linkClass}
                  onClick={closeMenu}
                >
                  Availability
                </NavLink>
                <NavLink
                  to="/provider/appointments"
                  className={linkClass}
                  onClick={closeMenu}
                >
                  Appointments
                </NavLink>
              </>
            )}

            {user ? (
              <div className="profile-menu" ref={profileRef}>
                <button
                  className={`profile-trigger ${profileOpen ? "profile-trigger-open" : ""}`}
                  onClick={() => setProfileOpen((value) => !value)}
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                >
                  <span className="profile-trigger-avatar">
                    <Icon name="user" size={17} />
                  </span>
                  <Icon name="chevronDown" size={15} />
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-head">
                      <span className="profile-dropdown-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.role === "provider" ? "Provider account" : "User account"}</span>
                      </div>
                    </div>
                    <div className="profile-dropdown-divider" />
                    <Link to="/profile" onClick={closeMenu} className="profile-dropdown-item">
                      <Icon name="user" size={17} />
                      <span>Profile</span>
                    </Link>
                    <button onClick={logoutUser} className="profile-dropdown-item profile-dropdown-logout">
                      <Icon name="logout" size={17} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={linkClass}
                  onClick={closeMenu}
                >
                  Log in
                </NavLink>
                <Link
                  to="/register"
                  className="button button-dark button-small"
                  onClick={closeMenu}
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="page-content">{children}</main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="brand footer-brand">
              <span className="brand-mark">
                <Icon name="check" size={17} />
              </span>
              Appointify
            </Link>
            <p className="footer-copy">
              A simpler way to discover providers and book time that works for
              you.
            </p>
          </div>

          <div>
            <p className="footer-title">Product</p>
            <Link to="/providers">Find providers</Link>
            <Link to="/register">Get started</Link>
          </div>

          <div>
            <p className="footer-title">Account</p>
            <Link to={user ? "/profile" : "/login"}>
              {user ? "Profile" : "Log in"}
            </Link>
            <Link to="/">Home</Link>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Appointify</span>
          <span>Built for simple scheduling.</span>
        </div>
      </footer>
    </div>
  );
}
