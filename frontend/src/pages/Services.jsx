import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
export default function Services(){const user=useSelector(s=>s.auth.user);return <Navigate to={user?.role==="provider"?"/provider/services":"/providers"} replace/>}
