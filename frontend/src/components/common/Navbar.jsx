import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import {
  ChefHat, Home, BookOpen, PlusCircle, Bookmark, Bell,
  LayoutDashboard, Shield, LogOut, LogIn, Menu, X, Sun, Moon, User, Users
} from "lucide-react";

const Navbar = ({ theme, toggleTheme }) => {
  const { user, logout, isAdmin, isSubAdmin, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const unreadCount = user?.notifications?.filter((n) => !n.read).length || 0;

  const getDashboardPath = () => {
    if (isAdmin()) return "/admin/dashboard";
    if (isSubAdmin()) return "/subadmin/dashboard";
    return "/dashboard";
  };

  const navLinks = [
    { to: "/", label: "Home", icon: <Home size={16} /> },
    { to: "/recipes", label: "Recipes", icon: <BookOpen size={16} /> },
    ...(isLoggedIn()
      ? [
        { to: getDashboardPath(), label: "Dashboard", icon: <LayoutDashboard size={16} /> },
        { to: "/recipes/create", label: "Create", icon: <PlusCircle size={16} /> },
        { to: "/bookmarks", label: "Bookmarks", icon: <Bookmark size={16} /> },
      ]
      : []),
    ...(isSubAdmin()
      ? [
        { to: "/users", label: "Users", icon: <Users size={16} /> },
        { to: "/subadmin", label: "Moderation", icon: <Shield size={16} /> }
      ]
      : []),
    ...(isAdmin()
      ? [{ to: "/admin", label: "Admin Panel", icon: <Shield size={16} /> }]
      : []),
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="page-container" style={{ padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", height: "64px", justifyContent: "space-between" }}>
          {/* ─ Logo ─ */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              borderRadius: "10px", padding: "6px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <ChefHat size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--text-primary)" }}>
              Recipe<span style={{ color: "var(--accent)" }}>Hub</span>
            </span>
          </Link>

          {/* ─ Desktop Nav ─ */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.45rem 0.85rem", borderRadius: "0.6rem",
                fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
                color: isActive(link.to) ? "var(--accent)" : "var(--text-secondary)",
                background: isActive(link.to) ? "var(--accent-light)" : "transparent",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { if (!isActive(link.to)) { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--glass)"; } }}
                onMouseLeave={e => { if (!isActive(link.to)) { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; } }}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* ─ Right Controls ─ */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{
              background: "var(--glass)", border: "1px solid var(--border)",
              borderRadius: "0.6rem", padding: "0.45rem", cursor: "pointer",
              color: "var(--text-secondary)", display: "flex", alignItems: "center"
            }}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            {isLoggedIn() && (
              <div style={{ position: "relative" }}>
                <button onClick={() => setNotifOpen(!notifOpen)} style={{
                  background: "var(--glass)", border: "1px solid var(--border)",
                  borderRadius: "0.6rem", padding: "0.45rem", cursor: "pointer",
                  color: "var(--text-secondary)", display: "flex", alignItems: "center"
                }}>
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: "absolute", top: "-4px", right: "-4px",
                      background: "var(--accent)", borderRadius: "50%",
                      width: "16px", height: "16px", fontSize: "10px",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700
                    }}>{unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "0.75rem", boxShadow: "var(--shadow)",
                    minWidth: "280px", zIndex: 200, overflow: "hidden"
                  }}>
                    <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: "0.85rem" }}>
                      Notifications
                    </div>
                    {user?.notifications?.length === 0 ? (
                      <div style={{ padding: "1rem", color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center" }}>No notifications</div>
                    ) : (
                      user?.notifications?.slice(-5).reverse().map((n, i) => (
                        <div key={i} style={{
                          padding: "0.75rem 1rem", fontSize: "0.82rem",
                          borderBottom: "1px solid var(--border)",
                          background: n.read ? "transparent" : "var(--accent-light)",
                          color: "var(--text-primary)"
                        }}>{n.message}</div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Auth */}
            {isLoggedIn() ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link to="/profile" style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.35rem 0.75rem 0.35rem 0.35rem",
                  background: "var(--glass)", border: "1px solid var(--border)",
                  borderRadius: "999px", textDecoration: "none", color: "var(--text-primary)"
                }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={14} color="#fff" />
                    </div>
                  )}
                  <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{user?.name?.split(" ")[0]}</span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem" }}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.875rem" }}>
                <LogIn size={16} /> Login
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn"
              style={{ background: "var(--glass)", border: "1px solid var(--border)", borderRadius: "0.6rem", padding: "0.45rem", cursor: "pointer", color: "var(--text-secondary)", display: "none" }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ─ Mobile Menu ─ */}
        {mobileOpen && (
          <div style={{ borderTop: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.65rem 0.5rem", fontSize: "0.9rem", fontWeight: 500,
                  color: isActive(link.to) ? "var(--accent)" : "var(--text-primary)",
                  textDecoration: "none", borderRadius: "0.5rem",
                  background: isActive(link.to) ? "var(--accent-light)" : "transparent",
                }}>
                {link.icon} {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
