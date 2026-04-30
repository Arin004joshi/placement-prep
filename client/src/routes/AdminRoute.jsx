import { Navigate, Outlet } from "react-router-dom";
import LoadingState from "../components/ui/LoadingState";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { isAdmin, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingState label="Checking permissions" />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
