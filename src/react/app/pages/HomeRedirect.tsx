import { Navigate } from "react-router";
import { useApp } from "../store/AppContext";

export default function HomeRedirect() {
  const { currentUser } = useApp();
  
  // If not authenticated, show landing page
  if (!currentUser) {
    return <Navigate to="/landing" replace />;
  }
  
  // If authenticated, redirect to menu
  return <Navigate to="/menu" replace />;
}