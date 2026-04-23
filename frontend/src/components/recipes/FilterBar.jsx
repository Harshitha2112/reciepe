const CATEGORIES = [
  "All", "Breakfast", "Lunch", "Dinner", "Snacks",
  "Desserts", "Beverages", "Vegan", "Vegetarian", "Non-Vegetarian", "Other"
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Latest" },
  { value: "popular",   label: "Most Liked" },
  { value: "rating",    label: "Top Rated" },
  { value: "trending",  label: "Trending" },
];

const DIFFICULTY = ["All", "Easy", "Medium", "Hard"];

const FilterBar = ({ filters, onChange }) => {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "1rem 1.25rem",
      display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.75rem"
    }}>
      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search recipes, ingredients..."
        className="input-field"
        style={{ maxWidth: "280px", flex: 1 }}
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
      />

      {/* Category */}
      <select
        className="input-field"
        style={{ maxWidth: "160px" }}
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value === "All" ? "" : e.target.value, page: 1 })}
      >
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Difficulty */}
      <select
        className="input-field"
        style={{ maxWidth: "140px" }}
        value={filters.difficulty}
        onChange={(e) => onChange({ ...filters, difficulty: e.target.value === "All" ? "" : e.target.value, page: 1 })}
      >
        {DIFFICULTY.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Sort */}
      <select
        className="input-field"
        style={{ maxWidth: "150px" }}
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value, page: 1 })}
      >
        {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </div>
  );
};

export default FilterBar;
