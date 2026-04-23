import { useState, useEffect } from "react";
import { getMe, toggleSave } from "../services/api";
import RecipeCard from "../components/recipes/RecipeCard";
import { Bookmark } from "lucide-react";
import toast from "react-hot-toast";

const Bookmarks = () => {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try { const { data } = await getMe(); setSaved(data.savedRecipes || []); }
      catch { toast.error("Failed to load bookmarks"); }
      setLoading(false);
    };
    fetchSaved();
  }, []);

  const handleRemove = async (id) => {
    try { await toggleSave(id); setSaved(s => s.filter(r => r._id !== id)); toast.success("Removed from bookmarks"); }
    catch { toast.error("Failed to remove"); }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Bookmark size={24} color="var(--accent)" />
        <div>
          <h1 className="section-title" style={{ fontSize: "1.6rem" }}>Bookmarks</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{saved.length} saved recipe{saved.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {loading ? (
        <div className="recipe-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
              <div className="skeleton" style={{ height: "220px" }} />
              <div style={{ padding: "1rem", background: "var(--bg-card)" }}>
                <div className="skeleton" style={{ height: "18px", marginBottom: "8px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <Bookmark size={48} color="var(--text-secondary)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>No bookmarks yet</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Save recipes by clicking the Bookmark button on any recipe.</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {saved.map(r => (
            <div key={r._id} style={{ position: "relative" }}>
              <RecipeCard recipe={r} />
              <button onClick={() => handleRemove(r._id)}
                style={{ position: "absolute", top: "12px", right: "52px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "0.5rem", padding: "4px 8px", cursor: "pointer", color: "#f87171", fontSize: "0.75rem", fontWeight: 600, backdropFilter: "blur(8px)", zIndex: 10 }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
