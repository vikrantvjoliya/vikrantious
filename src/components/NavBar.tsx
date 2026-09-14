import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Alert } from "@mui/material";
import GridViewRounded from "@mui/icons-material/GridViewRounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import GestureRounded from "@mui/icons-material/GestureRounded";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import SportsEsportsOutlined from "@mui/icons-material/SportsEsportsOutlined";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../utils/supabaseClient";
const links = [
  { to: "/", label: "Résumé", icon: <PersonOutlineRounded /> },
  { to: "/workspace", label: "Overview", icon: <GridViewRounded /> },
  { to: "/text-notes", label: "Text notes", icon: <DescriptionOutlined /> },
  { to: "/drawing-notes", label: "Drawing studio", icon: <GestureRounded /> },
  { to: "/file-notes", label: "Files", icon: <FolderOutlined /> },
];
export default function NavBar() {
  const { user } = useAuth();
  const [error, setError] = useState(false);
  const logout = async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    setError(Boolean(error));
  };
  return (
    <aside className="sidebar">
      <Link className="brand" to="/" aria-label="Vikrantious home">
        <img className="brand-logo" src="/vk-logo.svg" alt="VK" width="42" height="42" />
        <span>
          vikrantious<span className="brand-caption">VIKRANT JOLIYA</span>
        </span>
      </Link>
      <div className="nav-section-label">YOUR WORKSPACE</div>
      <nav aria-label="Main navigation" className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {link.icon}
            <span>{link.label}</span>
            {link.to === "/" && <span className="active-dot" />}
          </NavLink>
        ))}
        <div className="nav-section-label break-label">
          A MOMENT TO YOURSELF
        </div>
        <NavLink
          to="/suika-game"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <SportsEsportsOutlined />
          <span>Fruity Fall</span>
          <span className="tiny-tag">PLAY</span>
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span className="sparkle">✳</span>
          <h3>Room to think.</h3>
          <p>
            Capture the little things.
            <br />
            Make space for what’s next.
          </p>
          <Link to="/text-notes">
            Write something <ArrowForwardRounded fontSize="small" />
          </Link>
        </div>
        {error && <Alert severity="error">Couldn’t sign out. Try again.</Alert>}
        {user ? (
          <button className="account-button" onClick={logout}>
            <span className="avatar">{user.email?.[0].toUpperCase()}</span>
            <span className="account-text">
              My workspace<small>Sign out</small>
            </span>
            <LogoutRounded fontSize="small" />
          </button>
        ) : (
          <Link className="account-button" to="/login">
            <span className="avatar">V</span>
            <span className="account-text">
              Make yourself at home<small>Sign in to your workspace</small>
            </span>
            <ArrowForwardRounded fontSize="small" />
          </Link>
        )}
      </div>
    </aside>
  );
}
