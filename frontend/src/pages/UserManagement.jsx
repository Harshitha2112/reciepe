import { useState, useEffect } from "react";
import { getAllUsers, updateRole, toggleBan, deleteUser, createUser } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Ban, Trash2, UserPlus, Search, X } from "lucide-react";

const ROLE_COLORS = { ADMIN: "#ef4444", SUBADMIN: "#3b82f6", USER: "#22c55e" };

const UserManagement = () => {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "ADMIN";
  const isSubAdmin = currentUser?.role === "SUBADMIN";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "USER" });

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => { try { const { data } = await getAllUsers(); setUsers(data); } catch { toast.error("Failed to load users"); } setLoading(false); };
  const handleRoleChange = async (id, role) => { if (!isAdmin && !isSubAdmin) return; try { await updateRole(id, role); setUsers(u => u.map(user => user._id === id ? { ...user, role } : user)); toast.success(`Role updated to ${role}`); } catch { toast.error("Failed"); } };
  const handleBan = async (id) => { if (!isAdmin && !isSubAdmin) return; try { const { data } = await toggleBan(id); setUsers(u => u.map(user => user._id === id ? { ...user, isBanned: data.isBanned } : user)); toast.success(data.message); } catch { toast.error("Failed"); } };
  const handleDelete = async (id) => { if (!isAdmin && !isSubAdmin) return; if (!window.confirm("Permanently delete this user?")) return; try { await deleteUser(id); setUsers(u => u.filter(user => user._id !== id)); toast.success("User deleted"); } catch { toast.error("Failed"); } };
  const handleCreateUser = async (e) => { e.preventDefault(); try { const { data } = await createUser(newUser); setUsers([data, ...users]); setShowCreateModal(false); setNewUser({ name: "", email: "", password: "", role: "USER" }); toast.success("User created!"); } catch (err) { toast.error(err.response?.data?.message || "Failed"); } };
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: "0.4rem" }}>👥 User Management</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{isAdmin ? "Manage all platform users and roles" : "View platform users"}</p>
        </div>
        {(isAdmin || isSubAdmin) && <button className="btn-primary" onClick={() => setShowCreateModal(true)}><UserPlus size={18} /> Create User</button>}
      </div>
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", maxWidth: "500px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input className="input-field" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th>{(isAdmin || isSubAdmin) && <th>Actions</th>}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading...</td></tr>
              : filteredUsers.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No users found</td></tr>
              : filteredUsers.map(u => (
                <tr key={u._id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>{u.name[0].toUpperCase()}</div><span style={{ fontWeight: 600 }}>{u.name}</span></div></td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                  <td>{(isAdmin || isSubAdmin) ? <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.4rem 0.6rem", color: ROLE_COLORS[u.role], fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}><option value="USER">USER</option><option value="SUBADMIN">SUBADMIN</option><option value="ADMIN">ADMIN</option></select> : <span className="badge" style={{ background: `${ROLE_COLORS[u.role]}22`, color: ROLE_COLORS[u.role], border: `1px solid ${ROLE_COLORS[u.role]}44` }}>{u.role}</span>}</td>
                  <td><span className={`badge ${u.isBanned ? "badge-red" : "badge-green"}`}>{u.isBanned ? "Banned" : "Active"}</span></td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  {(isAdmin || isSubAdmin) && <td><div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleBan(u._id)} title={u.isBanned ? "Unban" : "Ban"} style={{ background: u.isBanned ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${u.isBanned ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "0.5rem", padding: "0.5rem", cursor: "pointer", color: u.isBanned ? "#22c55e" : "#ef4444" }}><Ban size={14} /></button>
                    <button onClick={() => handleDelete(u._id)} title="Delete" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.5rem", cursor: "pointer", color: "#ef4444" }}><Trash2 size={14} /></button>
                  </div></td>}
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "450px", padding: "2rem", position: "relative" }}>
            <button onClick={() => setShowCreateModal(false)} style={{ position: "absolute", right: "1.5rem", top: "1.5rem", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}><X size={20} /></button>
            <h2 style={{ marginBottom: "1.5rem", fontWeight: 800 }}>Create New User</h2>
            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div><label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>Full Name</label><input className="input-field" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" /></div>
              <div><label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>Email</label><input className="input-field" type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@example.com" /></div>
              <div><label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>Password</label><input className="input-field" type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" /></div>
              <div><label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>Role</label><select className="input-field" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}><option value="USER">USER</option><option value="SUBADMIN">SUBADMIN</option><option value="ADMIN">ADMIN</option></select></div>
              <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem", padding: "0.85rem" }}>Create User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
