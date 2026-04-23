import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";
import CreateRecipe from "./pages/CreateRecipe";
import AdminPanel from "./pages/AdminPanel";
import SubAdminPanel from "./pages/SubAdminPanel";
import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";

// Components
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";

import useAuthStore from "./store/useAuthStore";

function App() {
  const { refreshUser, token } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (token) refreshUser();
  }, [token]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }
      }} />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main style={{ minHeight: "calc(100vh - 64px)" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />

          {/* Protected Routes (Any logged-in user) */}
          <Route path="/recipes/create" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />

          {/* Dashboards based on role */}
          <Route path="/dashboard" element={<ProtectedRoute roles={["USER"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/subadmin/dashboard" element={<ProtectedRoute roles={["SUBADMIN"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute roles={["ADMIN"]}><Dashboard /></ProtectedRoute>} />

          {/* Admin & Sub-Admin Routes */}
          <Route path="/users" element={<ProtectedRoute roles={["ADMIN", "SUBADMIN"]}><UserManagement /></ProtectedRoute>} />
          <Route path="/subadmin" element={<ProtectedRoute roles={["ADMIN", "SUBADMIN"]}><SubAdminPanel /></ProtectedRoute>} />

          {/* Admin Only Route */}
          <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminPanel /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
