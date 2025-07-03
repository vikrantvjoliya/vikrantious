import { useNavigate } from "react-router-dom";
import { useSessionTimeout } from "../hooks/useSessionTimeout";

export default function SessionTimeoutHandler() {
  const navigate = useNavigate();

  useSessionTimeout(() => {
    // Clear auth/session here if needed
    // e.g. localStorage.removeItem("token");
    navigate("/login");
  });

  return null;
}