import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";
import { ChefHat, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  const { login, register, loading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loginRole, setLoginRole] = useState("USER");

  const handleRoleChange = (role) => {
    setLoginRole(role);
    if (isLogin) {
      if (role === "ADMIN") setForm({ ...form, email: "admin@recipehub.com", password: "adminpassword123" });
      else if (role === "SUBADMIN") setForm({ ...form, email: "subadmin@recipehub.com", password: "subadminpassword123" });
      else setForm({ ...form, email: "user@recipehub.com", password: "userpassword123" });
    }
  };

  const handleChange = (e) => {
    clearError();
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = isLogin
      ? await login({ email: form.email, password: form.password })
      : await register(form);

    if (result.success) {
      toast.success(isLogin ? "Welcome back!" : "Account created!");
      const targetPath = location.state?.from?.pathname;
      if (targetPath) {
        navigate(targetPath);
      } else {
        if (result.user?.role === "ADMIN") navigate("/admin/dashboard");
        else if (result.user?.role === "SUBADMIN") navigate("/subadmin/dashboard");
        else navigate("/dashboard");
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at top left, rgba(249,115,22,0.15) 0%, transparent 60%), var(--bg-primary)",
      padding: "2rem 1rem"
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            borderRadius: "14px", padding: "14px", marginBottom: "1rem"
          }}>
            <ChefHat size={28} color="#fff" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {isLogin ? "Welcome Back" : "Join RecipeHub"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
            {isLogin ? "Sign in to continue your culinary journey" : "Create an account to start sharing recipes"}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: "2rem" }}>
          {/* Role Selection Tabs for Login */}
          {isLogin && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: "var(--bg-secondary)", padding: "0.25rem", borderRadius: "0.75rem" }}>
              {["USER", "SUBADMIN", "ADMIN"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  style={{
                    flex: 1, padding: "0.5rem", borderRadius: "0.5rem", border: "none",
                    background: loginRole === role ? "var(--accent)" : "transparent",
                    color: loginRole === role ? "#fff" : "var(--text-secondary)",
                    fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {role === "SUBADMIN" ? "SUB-ADMIN" : role}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Name (Register only) */}
            {!isLogin && (
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                  <input id="register-name" name="name" type="text" required placeholder="Gordon Ramsay"
                    className="input-field" style={{ paddingLeft: "38px" }}
                    value={form.name} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input id="auth-email" name="email" type="email" required placeholder="chef@example.com"
                  className="input-field" style={{ paddingLeft: "38px" }}
                  value={form.email} onChange={handleChange} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input id="auth-password" name="password" type={showPass ? "text" : "password"}
                  required placeholder="••••••••" minLength={6}
                  className="input-field" style={{ paddingLeft: "38px", paddingRight: "40px" }}
                  value={form.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)"
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.6rem", padding: "0.65rem 0.9rem", fontSize: "0.85rem", color: "#f87171" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "0.8rem", fontSize: "0.95rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle */}
          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link to={isLogin ? "/register" : "/login"}
              style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div style={{ marginTop: "1rem", textAlign: "center", background: "var(--accent-light)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
          <p style={{ fontSize: "0.78rem", color: "var(--accent)", fontWeight: 600, marginBottom: "0.25rem" }}>Demo Credentials</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Admin: admin@recipehub.com / adminpassword123</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Sub-Admin: subadmin@recipehub.com / subadminpassword123</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>User: user@recipehub.com / userpassword123</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
