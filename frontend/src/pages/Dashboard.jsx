import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyRecipes, deleteRecipe, getAnalytics } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { PlusCircle, Trash2, BookOpen, Clock, ChefHat, Users, TrendingUp, ArrowRight, UserCheck, Layout, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";

const PIE_COLORS = ["#f97316", "#22c55e", "#3b82f6", "#fbbf24", "#a855f7"];

const StatusBadge = ({ status }) => {
  const config = { approved: { cls: "badge-green", label: "✓ Approved" }, pending: { cls: "badge-yellow", label: "⏳ Pending" }, rejected: { cls: "badge-red", label: "✗ Rejected" } };
  const c = config[status] || config.pending;
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
};

const StatCard = ({ icon, label, value, color, sub, prefix = "" }) => (
  <div className="glass-card" style={{ padding: "1.5rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)" }}>{prefix}{value}</p>
        {sub !== undefined && <p style={{ fontSize: "0.75rem", color: "#22c55e", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><TrendingUp size={12} /> +{sub} new</p>}
      </div>
      <div style={{ background: `${color}22`, borderRadius: "0.75rem", padding: "0.75rem", color }}>{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, refreshUser } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [myRecipes, setMyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    refreshUser();
    if (isAdmin) { fetchAdminData(); } else { fetchUserData(); }
  }, [user?.role]);

  const fetchUserData = async () => {
    try { const { data } = await getMyRecipes(); setMyRecipes(data); } catch { toast.error("Failed to load your recipes"); }
    setLoading(false);
  };
  const fetchAdminData = async () => {
    try { const { data } = await getAnalytics(); setAnalytics(data); } catch { toast.error("Failed to load analytics"); }
    setLoading(false);
  };
  const handleDeleteRecipe = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    try { await deleteRecipe(id); setMyRecipes(r => r.filter(recipe => recipe._id !== id)); toast.success("Recipe deleted!"); } catch { toast.error("Failed to delete recipe"); }
  };

  if (isAdmin) {
    if (loading) return <div className="page-container"><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "var(--radius)" }} />)}</div></div>;
    return (
      <div className="page-container">
        <div style={{ marginBottom: "2rem" }}><h1 className="section-title" style={{ marginBottom: "0.4rem" }}>📊 Platform Overview</h1><p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Real-time statistics and platform health</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          <StatCard icon={<Users size={20} />} label="Total Users" value={analytics?.totalUsers || 0} color="#f97316" sub={analytics?.recentUsers} />
          <StatCard icon={<UserCheck size={20} />} label="Active Users" value={analytics?.activeUsers || 0} color="#3b82f6" />
          <StatCard icon={<BookOpen size={20} />} label="Recipes" value={analytics?.totalRecipes || 0} color="#22c55e" sub={analytics?.recentRecipes} />
          <StatCard icon={<DollarSign size={20} />} label="Total Revenue" value={analytics?.revenue || 0} color="#10b981" prefix="$" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}><h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Recipes by Category</h3><Layout size={18} color="var(--text-secondary)" /></div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.recipesByCategory?.map(c => ({ name: c._id, count: c.count })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0.75rem" }} /><Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1.5rem" }}>User Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={analytics?.usersByRole?.map(r => ({ name: r._id, value: r.count })) || []} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">{analytics?.usersByRole?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36} /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}><h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Recent Activity</h3><Link to="/admin" style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>View All <ArrowRight size={14} /></Link></div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table"><thead><tr><th>Activity</th><th>Type</th><th>Date</th><th>Status/Role</th></tr></thead><tbody>
              {analytics?.recentActivity?.users?.map(u => (<tr key={u._id}><td><div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>U</div><span>New User: <strong>{u.name}</strong></span></div></td><td>User Signup</td><td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{new Date(u.createdAt).toLocaleDateString()}</td><td><span className="badge badge-blue">{u.role}</span></td></tr>))}
              {analytics?.recentActivity?.recipes?.map(r => (<tr key={r._id}><td><div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>R</div><span>New Recipe: <strong>{r.title}</strong></span></div></td><td>Recipe Submission</td><td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{new Date(r.createdAt).toLocaleDateString()}</td><td><StatusBadge status={r.status} /></td></tr>))}
            </tbody></table>
          </div>
        </div>
      </div>
    );
  }

  const filtered = myRecipes.filter(r => activeTab === "all" || r.status === activeTab);
  const userStats = [
    { label: "Total Recipes", value: myRecipes.length, icon: <BookOpen size={20} color="var(--accent)" /> },
    { label: "Approved", value: myRecipes.filter(r => r.status === "approved").length, icon: <span style={{ fontSize: "1.25rem" }}>✅</span> },
    { label: "Pending Review", value: myRecipes.filter(r => r.status === "pending").length, icon: <Clock size={20} color="#eab308" /> },
    { label: "Saved Recipes", value: user?.savedRecipes?.length || 0, icon: <span style={{ fontSize: "1.25rem" }}>🔖</span> },
  ];

  return (
    <div className="page-container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: "#fff", fontWeight: 800 }}>{user?.name?.[0]?.toUpperCase()}</div>
          <div><h1 style={{ fontWeight: 800, fontSize: "1.4rem" }}>Welcome back, {user?.name?.split(" ")[0]}!</h1><p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}><span className={`badge ${user?.role === "ADMIN" ? "badge-red" : user?.role === "SUBADMIN" ? "badge-blue" : "badge-green"}`}>{user?.role}</span></p></div>
        </div>
        <Link to="/recipes/create" className="btn-primary"><PlusCircle size={16} /> New Recipe</Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        {userStats.map((s, i) => (<div key={i} className="glass-card" style={{ padding: "1.25rem" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>{s.icon}</div><div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>{s.value}</div><div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{s.label}</div></div>))}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>My Recipes</h2>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {["all", "approved", "pending", "rejected"].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "0.4rem 0.85rem", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer", textTransform: "capitalize", background: activeTab === tab ? "var(--accent)" : "var(--glass)", color: activeTab === tab ? "#fff" : "var(--text-secondary)" }}>{tab}</button>))}
          </div>
        </div>
        {loading ? <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "1rem" }} />)}</div>
        : filtered.length === 0 ? <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}><ChefHat size={48} color="var(--text-secondary)" style={{ margin: "0 auto 1rem" }} /><h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>No recipes yet</h3><Link to="/recipes/create" className="btn-primary"><PlusCircle size={16} /> Create Recipe</Link></div>
        : <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filtered.map(recipe => (
              <div key={recipe._id} className="glass-card" style={{ padding: "1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <img src={recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop"} alt={recipe.title} style={{ width: "72px", height: "72px", borderRadius: "0.75rem", objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}><h3 style={{ fontWeight: 700, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{recipe.title}</h3><StatusBadge status={recipe.status} /></div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{recipe.category} • {recipe.cookingTime} mins</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link to={`/recipes/${recipe._id}`} className="btn-secondary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>View</Link>
                  <button onClick={() => handleDeleteRecipe(recipe._id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.6rem", padding: "0.4rem 0.6rem", cursor: "pointer", color: "#ef4444" }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
};

export default Dashboard;
