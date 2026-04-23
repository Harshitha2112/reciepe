import { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { updateProfile } from "../services/api";
import toast from "react-hot-toast";
import { User, Mail, Camera, Save, Shield } from "lucide-react";

const Profile = () => {
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "", bio: user?.bio || "" });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || "");

  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) { setAvatar(file); setPreview(URL.createObjectURL(file)); } };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("bio", formData.bio);
    if (avatar) data.append("avatar", avatar);
    try { await updateProfile(data); await refreshUser(); toast.success("Profile updated!"); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to update"); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 className="section-title" style={{ marginBottom: "0.4rem" }}>⚙️ Account Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Update your profile information and preferences</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        <div className="glass-card" style={{ padding: "2rem", textAlign: "center", alignSelf: "start" }}>
          <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 1.5rem" }}>
            <img src={preview || "https://ui-avatars.com/api/?name=" + user?.name} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid var(--accent)" }} />
            <label style={{ position: "absolute", bottom: "0", right: "0", background: "var(--accent)", color: "#fff", padding: "0.5rem", borderRadius: "50%", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
              <Camera size={16} />
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
          <h2 style={{ fontWeight: 800, marginBottom: "0.25rem" }}>{user?.name}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>{user?.email}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            <span className={`badge ${user?.role === "ADMIN" ? "badge-red" : user?.role === "SUBADMIN" ? "badge-blue" : "badge-green"}`}>
              <Shield size={12} style={{ marginRight: "4px" }} /> {user?.role}
            </span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}><User size={14} style={{ display: "inline", marginRight: "6px" }} /> Full Name</label>
              <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your Name" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}><Mail size={14} style={{ display: "inline", marginRight: "6px" }} /> Email Address</label>
              <input className="input-field" value={formData.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
              <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.4rem" }}>Email cannot be changed</p>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Bio / About Me</label>
              <textarea className="input-field" rows="4" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell us about yourself..." style={{ resize: "none" }} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
