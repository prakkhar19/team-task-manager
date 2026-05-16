import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <FolderKanban className="brand-icon" />
          <span className="text-gradient">TeamTask</span>
        </div>

        <nav className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <FolderKanban size={20} />
            <span>Projects</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-secondary w-full">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-nav">
          <div className="page-title">
            {/* Dynamic based on route can be added, but handled by children mostly */}
          </div>
          <div className="user-profile">
            <div className="avatar">{user?.name.charAt(0).toUpperCase()}</div>
            <span className="user-name">{user?.name}</span>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
