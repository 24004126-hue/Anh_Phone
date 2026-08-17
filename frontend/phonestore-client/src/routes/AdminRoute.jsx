import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
    const { user } = useAuth();
    const token = user?.token || sessionStorage.getItem("token") || localStorage.getItem("token");
    const role = user?.role || sessionStorage.getItem("role") || localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role?.toLowerCase() !== "admin") {
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default AdminRoute;