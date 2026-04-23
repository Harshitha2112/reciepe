import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipeById, toggleLike, toggleSave, rateRecipe, getComments, addComment, deleteComment } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import { StarRating } from "../components/recipes/RecipeCard";
import toast from "react-hot-toast";
import { Heart, Bookmark, Clock, Users, ChefHat, Trash2, Send, Star, ArrowLeft } from "lucide-react";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();

  const [recipe, setRecipe]   = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchRecipe();
    fetchComments();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const { data } = await getRecipeById(id);
      setRecipe(data);
      if (user) {
        const existing = data.ratings?.find(r => r.user?._id === user._id || r.user === user._id);
        if (existing) setUserRating(existing.value);
      }
    } catch { toast.error("Recipe not found"); navigate("/recipes"); }
    setLoading(false);
  };

  const fetchComments = async () => {
    try { const { data } = await getComments(id); setComments(data); } catch {}
  };

  const handleLike = async () => {
    if (!isLoggedIn()) return toast.error("Please login to like recipes");
    try {
      const { data } = await toggleLike(id);
      setRecipe(r => ({
        ...r,
        likes: data.liked ? [...(r.likes || []), user._id] : (r.likes || []).filter(l => l !== user._id),
        likesCount: data.likesCount
      }));
    } catch { toast.error("Failed to like"); }
  };

  const handleSave = async () => {
    if (!isLoggedIn()) return toast.error("Please login to save recipes");
    try {
      await toggleSave(id);
      toast.success("Updated bookmarks!");
    } catch { toast.error("Failed to save"); }
  };

  const handleRate = async (val) => {
    if (!isLoggedIn()) return toast.error("Please login to rate recipes");
    try {
      await rateRecipe(id, val);
      setUserRating(val);
      toast.success(`Rated ${val} stars!`);
      fetchRecipe();
    } catch { toast.error("Failed to rate"); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) return toast.error("Please login to comment");
    if (!comment.trim()) return;
    try {
      const { data } = await addComment(id, comment);
      setComments(c => [data, ...c]);
      setComment("");
    } catch { toast.error("Failed to post comment"); }
  };

  const handleDeleteComment = async (cid) => {
    try {
      await deleteComment(cid);
      setComments(c => c.filter(cm => cm._id !== cid));
      toast.success("Comment deleted");
    } catch { toast.error("Failed to delete comment"); }
  };

  const isLiked = recipe?.likes?.includes(user?._id);

  if (loading) return (
    <div className="page-container">
      <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius)", marginBottom: "1.5rem" }} />
      <div className="skeleton" style={{ height: "30px", width: "50%", marginBottom: "1rem" }} />
      <div className="skeleton" style={{ height: "20px", width: "80%" }} />
    </div>
  );

  if (!recipe) return null;

  return (
    <div className="page-container" style={{ maxWidth: "900px" }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: "1.5rem", padding: "0.5rem 1rem" }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero Image */}
      <div style={{ borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "2rem", position: "relative", height: "380px" }}>
        <img src={recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=400&fit=crop"} alt={recipe.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=400&fit=crop"} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
        <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem" }}>
          <span className="badge badge-orange" style={{ marginBottom: "0.5rem", display: "inline-block" }}>{recipe.category}</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.4rem, 4vw, 2rem)", color: "#fff", fontWeight: 800, lineHeight: 1.2 }}>
            {recipe.title}
          </h1>
        </div>
      </div>

      {/* Meta + Actions */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <Clock size={16} color="var(--accent)" /> {recipe.cookingTime} minutes
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <Users size={16} color="var(--accent)" /> {recipe.servings} servings
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <ChefHat size={16} color="var(--accent)" /> {recipe.difficulty}
          </div>
          <StarRating rating={recipe.averageRating} />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleLike} className={isLiked ? "btn-primary" : "btn-secondary"} style={{ padding: "0.5rem 1rem" }}>
            <Heart size={16} fill={isLiked ? "#fff" : "none"} /> {recipe.likesCount || 0}
          </button>
          <button onClick={handleSave} className="btn-secondary" style={{ padding: "0.5rem 1rem" }}>
            <Bookmark size={16} /> Save
          </button>
        </div>
      </div>

      {/* Author */}
      {recipe.createdBy && (
        <div className="glass-card" style={{ padding: "1rem 1.25rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
            {recipe.createdBy.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{recipe.createdBy.name}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Recipe Author</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* Ingredients */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem", color: "var(--accent)" }}>🥕 Ingredients</h2>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {recipe.ingredients?.map((ing, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", color: "var(--text-primary)" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                <strong>{ing.quantity}</strong>&nbsp;{ing.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Rating widget */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem", color: "var(--accent)" }}>⭐ Rate This Recipe</h2>
          <div style={{ display: "flex", gap: "8px", marginBottom: "0.75rem" }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => handleRate(s)}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                <Star size={28} fill={s <= (hoveredStar || userRating) ? "#fbbf24" : "none"} color={s <= (hoveredStar || userRating) ? "#fbbf24" : "var(--text-secondary)"} />
              </button>
            ))}
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Average: {recipe.averageRating?.toFixed(1)} ({recipe.ratings?.length || 0} ratings)
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem", color: "var(--accent)" }}>👨‍🍳 Instructions</h2>
        <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {recipe.steps?.map((step) => (
            <li key={step.stepNumber} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <span style={{ background: "var(--accent)", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                {step.stepNumber}
              </span>
              <p style={{ color: "var(--text-primary)", lineHeight: 1.65, fontSize: "0.9rem", paddingTop: "4px" }}>{step.instruction}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Tags */}
      {recipe.tags?.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {recipe.tags.map((tag, i) => (
              <span key={i} className="badge badge-blue">#{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div>
        <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: "1.25rem" }}>
          💬 Comments ({comments.length})
        </h2>

        {isLoggedIn() && (
          <form onSubmit={handleComment} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <input className="input-field" placeholder="Share your thoughts..." value={comment} onChange={e => setComment(e.target.value)} />
            <button type="submit" className="btn-primary" style={{ flexShrink: 0, padding: "0.65rem 1rem" }}>
              <Send size={16} />
            </button>
          </form>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {comments.map(c => (
            <div key={c._id} className="glass-card" style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                {c.user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{c.user?.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.3rem" }}>{c.text}</p>
              </div>
              {(user?._id === c.user?._id || ["ADMIN","SUBADMIN"].includes(user?.role)) && (
                <button onClick={() => handleDeleteComment(c._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
