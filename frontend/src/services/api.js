import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const registerUser   = (data) => API.post("/auth/register", data);
export const loginUser      = (data) => API.post("/auth/login", data);
export const getMe          = ()     => API.get("/auth/me");
export const updateProfile  = (data) => API.put("/auth/profile", data);
export const markNotifRead  = (id)   => API.put(`/auth/notifications/${id}/read`);

// ── Recipes ───────────────────────────────────────────────
export const getRecipes        = (params) => API.get("/recipes", { params });
export const getTrending       = ()        => API.get("/recipes/trending");
export const getRecipeById     = (id)      => API.get(`/recipes/${id}`);
export const getMyRecipes      = ()        => API.get("/recipes/user/myrecipes");
export const getPendingRecipes = ()        => API.get("/recipes/admin/pending");
export const createRecipe      = (data)    => API.post("/recipes", data);
export const updateRecipe      = (id, data)=> API.put(`/recipes/${id}`, data);
export const deleteRecipe      = (id)      => API.delete(`/recipes/${id}`);
export const toggleLike        = (id)      => API.put(`/recipes/${id}/like`);
export const toggleSave        = (id)      => API.put(`/recipes/${id}/save`);
export const rateRecipe        = (id, val) => API.put(`/recipes/${id}/rate`, { value: val });
export const updateStatus      = (id, status) => API.put(`/recipes/${id}/status`, { status });

// ── Comments ──────────────────────────────────────────────
export const getComments   = (recipeId)  => API.get(`/comments/${recipeId}`);
export const addComment    = (id, text)  => API.post(`/comments/${id}`, { text });
export const deleteComment = (id)        => API.delete(`/comments/${id}`);

// ── Admin / Users ─────────────────────────────────────────
export const getAllUsers   = ()           => API.get("/users");
export const getUserById   = (id)         => API.get(`/users/${id}`);
export const createUser    = (data)       => API.post("/users", data);
export const updateUser    = (id, data)   => API.put(`/users/${id}`, data);
export const getAnalytics  = ()           => API.get("/users/analytics");
export const updateRole    = (id, role)   => API.put(`/users/${id}/role`, { role });
export const toggleBan     = (id)         => API.put(`/users/${id}/ban`);
export const deleteUser    = (id)         => API.delete(`/users/${id}`);

export default API;
