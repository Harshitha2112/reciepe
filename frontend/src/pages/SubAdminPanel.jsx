import { useState, useEffect } from "react";
import { getPendingRecipes, updateStatus, deleteRecipe } from "../services/api";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

const SubAdminPanel = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPending(); }, []);
  const fetchPending = async () => {
    try { const { data } = await getPendingRecipes(); setPending(data); }
    catch { toast.error("Failed to load pending recipes"); }
    setLoading(false);
  };
  const handleStatus = async (id, status) => {
    try { await updateStatus(id, status); setPending(p => p.filter(r => r._id !== id)); toast.success(`Recipe ${status}!`); }
    catch { toast.error("Action failed"); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe permanently?")) return;
    try { await deleteRecipe(id); setPending(p => p.filter(r => r._id !== id)); toast.success("Recipe deleted"); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="section-title" style={{ marginBottom: "0.4rem" }}>🛡️ Moderation Panel</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Review and manage user-submitted content</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="glass-card" style={{ padding: "1.25rem", borderLeft: "3px solid #eab308" }}>
          <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{pending.length}</div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Pending Reviews</div>
        </div>
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "var(--radius)" }} />)}
        </div>
      ) : pending.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <CheckCircle size={48} color="#22c55e" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>All caught up!</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>No pending recipes to review.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {pending.map(recipe => (
            <div key={recipe._id} className="glass-card" style={{ padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <img src={recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"} alt={recipe.title}
                style={{ width: "90px", height: "90px", borderRadius: "0.75rem", objectFit: "cover", flexShrink: 0 }}
                onError={e => e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>{recipe.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  By <strong>{recipe.createdBy?.name}</strong> • {recipe.category} • {recipe.cookingTime} mins
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {recipe.description}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                <button onClick={() => handleStatus(recipe._id, "approved")} className="btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={() => handleStatus(recipe._id, "rejected")}
                  style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.6rem", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600 }}>
                  <XCircle size={14} /> Reject
                </button>
                <button onClick={() => handleDelete(recipe._id)}
                  style={{ padding: "0.45rem 0.7rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.6rem", cursor: "pointer", color: "#ef4444" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubAdminPanel;
