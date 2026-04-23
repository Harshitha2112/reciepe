import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTrending, getRecipes } from "../services/api";
import RecipeCard from "../components/recipes/RecipeCard";
import { ArrowRight, Flame, Star, ChefHat, BookOpen } from "lucide-react";

const StatCard = ({ icon, value, label, color }) => (
  <div className="glass-card" style={{ padding: "1.5rem", textAlign: "center", flex: 1 }}>
    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
    <div style={{ fontSize: "1.75rem", fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{label}</div>
  </div>
);

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [latest, setLatest]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendRes, latestRes] = await Promise.all([
          getTrending(),
          getRecipes({ limit: 8, sort: "createdAt" }),
        ]);
        setTrending(trendRes.data.slice(0, 4));
        setLatest(latestRes.data.recipes.slice(0, 8));
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="hero-bg" style={{ padding: "6rem 1.5rem 5rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--accent-light)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: "999px", padding: "0.35rem 1rem", marginBottom: "1.5rem" }}>
            <Flame size={14} color="var(--accent)" />
            <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600 }}>Discover Trending Recipes</span>
          </div>

          <h1 className="section-title" style={{ marginBottom: "1.25rem" }}>
            Cook, Share &{" "}
            <span className="gradient-text">Inspire</span>
            <br />the World's Recipes
          </h1>

          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 2rem" }}>
            A community-powered recipe platform where food lovers discover, create, and share their best culinary creations.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/recipes" className="btn-primary" style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>
              <BookOpen size={18} /> Explore Recipes
            </Link>
            <Link to="/register" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>
              <ChefHat size={18} /> Join Free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────── */}
      <section style={{ background: "var(--bg-secondary)", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <StatCard icon="🍽️" value="500+" label="Delicious Recipes" color="var(--accent)" />
          <StatCard icon="👨‍🍳" value="1.2k+" label="Active Chefs" color="#22c55e" />
          <StatCard icon="⭐" value="4.8" label="Average Rating" color="#fbbf24" />
          <StatCard icon="🌍" value="50+" label="Cuisines Covered" color="#3b82f6" />
        </div>
      </section>

      {/* ─── Trending ─────────────────────────────────────── */}
      <section className="page-container" style={{ paddingTop: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <Flame size={20} color="var(--accent)" />
              <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Trending Now</span>
            </div>
            <h2 className="section-title">Hot This Week 🔥</h2>
          </div>
          <Link to="/recipes?sort=trending" className="btn-secondary" style={{ whiteSpace: "nowrap" }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="recipe-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
                <div className="skeleton" style={{ height: "220px" }} />
                <div style={{ padding: "1rem", background: "var(--bg-card)" }}>
                  <div className="skeleton" style={{ height: "18px", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ height: "14px", width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="recipe-grid">
            {trending.map((r) => <RecipeCard key={r._id} recipe={r} />)}
          </div>
        )}
      </section>

      {/* ─── Latest Recipes ───────────────────────────────── */}
      <section className="page-container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <Star size={20} color="var(--accent)" />
              <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fresh & New</span>
            </div>
            <h2 className="section-title">Latest Recipes</h2>
          </div>
          <Link to="/recipes" className="btn-secondary" style={{ whiteSpace: "nowrap" }}>
            See All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="recipe-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
                <div className="skeleton" style={{ height: "220px" }} />
                <div style={{ padding: "1rem", background: "var(--bg-card)" }}>
                  <div className="skeleton" style={{ height: "18px", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ height: "14px", width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="recipe-grid">
            {latest.map((r) => <RecipeCard key={r._id} recipe={r} />)}
          </div>
        )}
      </section>

      {/* ─── CTA Banner ───────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem,4vw,2.2rem)", color: "#fff", marginBottom: "1rem" }}>
          Ready to Share Your Recipe?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: "1.75rem", fontSize: "1rem" }}>
          Join thousands of passionate chefs and share your culinary masterpieces.
        </p>
        <Link to="/recipes/create" style={{
          background: "#fff", color: "#ea580c", padding: "0.9rem 2.5rem",
          borderRadius: "0.75rem", fontWeight: 700, fontSize: "1rem",
          textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem",
          transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
        }}>
          <ChefHat size={20} /> Create Your Recipe
        </Link>
      </section>
    </div>
  );
};

export default Home;
