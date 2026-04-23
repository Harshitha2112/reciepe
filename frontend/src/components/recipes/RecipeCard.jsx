import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Clock, Users, Heart } from "lucide-react";

const CATEGORY_COLORS = {
  Breakfast: "badge-yellow",
  Lunch: "badge-green",
  Dinner: "badge-blue",
  Desserts: "badge-orange",
  Snacks: "badge-orange",
  Vegan: "badge-green",
  default: "badge-blue",
};

const StarRating = ({ rating }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={12}
        className={s <= Math.round(rating) ? "star-filled" : "star-empty"}
        fill={s <= Math.round(rating) ? "#fbbf24" : "none"}
      />
    ))}
    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginLeft: "4px" }}>
      {rating?.toFixed(1) || "0.0"}
    </span>
  </div>
);

const RecipeCard = ({ recipe }) => {
  const badgeClass = CATEGORY_COLORS[recipe.category] || CATEGORY_COLORS.default;

  return (
    <Link to={`/recipes/${recipe._id}`} style={{ textDecoration: "none" }}>
      <div className="recipe-card animate-fadeInUp">
        {/* Image */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
            alt={recipe.title}
            onError={(e) => (e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop")}
          />
          {/* Category badge overlay */}
          <div style={{ position: "absolute", top: "12px", left: "12px" }}>
            <span className={`badge ${badgeClass}`}>{recipe.category}</span>
          </div>
          {/* Difficulty */}
          <div style={{ position: "absolute", top: "12px", right: "12px" }}>
            <span className="badge" style={{
              background: "rgba(0,0,0,0.6)", color: "#fff",
              backdropFilter: "blur(8px)"
            }}>{recipe.difficulty}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "1rem" }}>
          <h3 style={{
            fontWeight: 700, fontSize: "1rem",
            color: "var(--text-primary)", marginBottom: "0.4rem",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {recipe.title}
          </h3>

          <p style={{
            fontSize: "0.8rem", color: "var(--text-secondary)",
            marginBottom: "0.75rem",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {recipe.description}
          </p>

          {/* Rating */}
          <StarRating rating={recipe.averageRating} />

          {/* Meta row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: "0.75rem", paddingTop: "0.75rem",
            borderTop: "1px solid var(--border)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.77rem", color: "var(--text-secondary)" }}>
                <Clock size={12} /> {recipe.cookingTime}m
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.77rem", color: "var(--text-secondary)" }}>
                <Users size={12} /> {recipe.servings}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.77rem", color: "var(--text-secondary)" }}>
                <Heart size={12} /> {recipe.likesCount || 0}
              </span>
            </div>
            {/* Author */}
            {recipe.createdBy && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", color: "#fff", fontWeight: 700, flexShrink: 0
                }}>
                  {recipe.createdBy.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  {recipe.createdBy.name?.split(" ")[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export { StarRating };
export default RecipeCard;
