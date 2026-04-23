import { useState, useEffect } from "react";
import { getAllUsers, getAnalytics, updateRole, toggleBan, deleteUser } from "../services/api";
import toast from "react-hot-toast";
import { Users, BookOpen, MessageSquare, Activity, Ban, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const ROLE_COLORS = { ADMIN: "#ef4444", SUBADMIN: "#3b82f6", USER: "#22c55e" };
const PIE_COLORS = ["#f97316", "#22c55e", "#3b82f6", "#fbbf24", "#a855f7", "#ec4899"];

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="glass-card" style={{ padding: "1.5rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div><p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>{label}</p><p style={{ fontSize: "2rem", fontWeight: 800, color }}>{value}</p>{sub && <p style={{ fontSize: "0.75rem", color: "#22c55e", marginTop: "0.25rem" }}>+{sub} this week</p>}</div>
      <div style={{ background: `${color}22`, borderRadius: "0.6rem", padding: "0.6rem", color }}>{icon}</div>
    </div>
  </div>
);

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    try { const [u, a] = await Promise.all([getAllUsers(), getAnalytics()]); setUsers(u.data); setAnalytics(a.data); } catch { toast.error("Failed to load admin data"); }
    setLoading(false);
  };
  const handleRoleChange = async (id, role) => { try { await updateRole(id, role); setUsers(u => u.map(user => user._id === id ? { ...user, role } : user)); toast.success(`Role updated to ${role}`); } catch { toast.error("Failed"); } };
  const handleBan = async (id) => { try { const { data } = await toggleBan(id); setUsers(u => u.map(user => user._id === id ? { ...user, isBanned: data.isBanned } : user)); toast.success(data.message); } catch { toast.error("Failed"); } };
  const handleDelete = async (id) => { if (!window.confirm("Permanently delete this user?")) return; try { await deleteUser(id); setUsers(u => u.filter(user => user._id !== id)); toast.success("User deleted"); } catch { toast.error("Failed"); } };
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <div style={{ marginBottom: "2rem" }}><h1 className="section-title" style={{ marginBottom: "0.4rem" }}>⚙️ Admin Panel</h1><p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Full platform management & analytics</p></div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        {["overview", "users"].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "0.5rem 1.25rem", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer", textTransform: "capitalize", background: activeTab === tab ? "var(--accent)" : "var(--glass)", color: activeTab === tab ? "#fff" : "var(--text-secondary)" }}>{tab}</button>))}
      </div>
      {activeTab === "overview" && (
        <div>
          {loading ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: "110px", borderRadius: "var(--radius)" }} />)}</div> : <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <StatCard icon={<Users size={20} />} label="Total Users" value={analytics?.totalUsers} color="var(--accent)" sub={analytics?.recentUsers} />
              <StatCard icon={<BookOpen size={20} />} label="Recipes" value={analytics?.totalRecipes} color="#22c55e" sub={analytics?.recentRecipes} />
              <StatCard icon={<Activity size={20} />} label="Pending Review" value={analytics?.pendingRecipes} color="#eab308" />
              <StatCard icon={<MessageSquare size={20} />} label="Comments" value={analytics?.totalComments} color="#3b82f6" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="glass-card" style={{ padding: "1.5rem" }}><h3 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "1rem" }}>📊 Recipes by Category</h3><ResponsiveContainer width="100%" height={220}><BarChart data={analytics?.recipesByCategory?.map(c => ({ name: c._id, count: c.count }))}><XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} /><YAxis tick={{ fontSize: 10, fill: "var(--text-secondary)" }} /><Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0.5rem" }} /><Bar dataKey="count" fill="#f97316" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
              <div className="glass-card" style={{ padding: "1.5rem" }}><h3 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "1rem" }}>👥 Users by Role</h3><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={analytics?.usersByRole?.map(r => ({ name: r._id, value: r.count }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>{analytics?.usersByRole?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
            </div>
          </>}
        </div>
      )}
      {activeTab === "users" && (
        <div>
          <div style={{ marginBottom: "1.25rem" }}><input className="input-field" placeholder="🔍 Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: "360px" }} /></div>
          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "auto" }}>
            <table className="admin-table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
              {loading ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Loading...</td></tr>
              : filteredUsers.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No users found</td></tr>
              : filteredUsers.map(user => (
                <tr key={user._id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}><div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{user.name[0].toUpperCase()}</div><span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{user.name}</span></div></td>
                  <td style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                  <td><select value={user.role} onChange={e => handleRoleChange(user._id, e.target.value)} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.3rem 0.5rem", color: ROLE_COLORS[user.role], fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}><option value="USER">USER</option><option value="SUBADMIN">SUBADMIN</option><option value="ADMIN">ADMIN</option></select></td>
                  <td><span className={`badge ${user.isBanned ? "badge-red" : "badge-green"}`}>{user.isBanned ? "Banned" : "Active"}</span></td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td><div style={{ display: "flex", gap: "0.4rem" }}><button onClick={() => handleBan(user._id)} title={user.isBanned ? "Unban" : "Ban"} style={{ background: user.isBanned ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${user.isBanned ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "0.4rem", padding: "0.35rem", cursor: "pointer", color: user.isBanned ? "#22c55e" : "#ef4444" }}><Ban size={13} /></button><button onClick={() => handleDelete(user._id)} title="Delete user" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.4rem", padding: "0.35rem", cursor: "pointer", color: "#ef4444" }}><Trash2 size={13} /></button></div></td>
                </tr>))}
            </tbody></table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
