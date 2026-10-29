import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "provider" ? "/provider" : "/dashboard"}
        replace
      />
    );
  }

  return children;
}
