import { useState, useEffect, useCallback } from "react";
import { getRecipes } from "../services/api";
import RecipeCard from "../components/recipes/RecipeCard";
import FilterBar from "../components/recipes/FilterBar";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Recipes = () => {
  const [recipes, setRecipes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters]   = useState({
    search: "", category: "", difficulty: "", sort: "createdAt", page: 1
  });

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 12 };
      if (!params.category) delete params.category;
      if (!params.difficulty) delete params.difficulty;
      if (!params.search) delete params.search;
      const { data } = await getRecipes(params);
      setRecipes(data.recipes);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (_) {}
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const goToPage = (p) => setFilters((f) => ({ ...f, page: p }));

  return (
    <div className="page-container">
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 className="section-title" style={{ marginBottom: "0.4rem" }}>All Recipes</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {pagination.total} recipes found
        </p>
      </div>

      <FilterBar filters={filters} onChange={handleFilterChange} />

      <div style={{ marginTop: "2rem" }}>
        {loading ? (
          <div className="recipe-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
                <div className="skeleton" style={{ height: "220px" }} />
                <div style={{ padding: "1rem", background: "var(--bg-card)" }}>
                  <div className="skeleton" style={{ height: "18px", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ height: "14px", width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🍽️</div>
            <h3 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>No recipes found</h3>
            <p style={{ color: "var(--text-secondary)" }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map((r) => <RecipeCard key={r._id} recipe={r} />)}
          </div>
        )}

        {/* ─ Pagination ─ */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "2.5rem" }}>
            <button className="btn-secondary" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}
              style={{ padding: "0.5rem 0.75rem", opacity: pagination.page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={16} />
            </button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => goToPage(i + 1)}
                style={{
                  width: "36px", height: "36px", borderRadius: "0.5rem", border: "1px solid var(--border)",
                  background: pagination.page === i + 1 ? "var(--accent)" : "var(--glass)",
                  color: pagination.page === i + 1 ? "#fff" : "var(--text-primary)",
                  fontWeight: 600, cursor: "pointer", fontSize: "0.85rem"
                }}>
                {i + 1}
              </button>
            ))}
            <button className="btn-secondary" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.pages}
              style={{ padding: "0.5rem 0.75rem", opacity: pagination.page === pagination.pages ? 0.4 : 1 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
