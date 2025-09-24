import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoggedIn, isHydrated } = useAuth();
  const location = useLocation();

  // Wait until auth is hydrated from storage before deciding
  if (!isHydrated) {
    return null; // or render a loader component
  }

  if (!isLoggedIn) {
    // Redirect to login page with the current location as state
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute; 