import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRecipe } from "../services/api";
import toast from "react-hot-toast";
import { Plus, Trash2, ChefHat, Upload } from "lucide-react";

const CATEGORIES = ["Breakfast","Lunch","Dinner","Snacks","Desserts","Beverages","Vegan","Vegetarian","Non-Vegetarian","Other"];

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "Breakfast", cookingTime: "", servings: "", difficulty: "Easy", tags: "" });
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [steps, setSteps] = useState([{ stepNumber: 1, instruction: "" }]);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleIngredient = (i, field, val) => { const arr = [...ingredients]; arr[i][field] = val; setIngredients(arr); };
  const addIngredient = () => setIngredients(a => [...a, { name: "", quantity: "" }]);
  const removeIngredient = (i) => setIngredients(a => a.filter((_, idx) => idx !== i));
  const handleStep = (i, val) => { const s = [...steps]; s[i].instruction = val; setSteps(s); };
  const addStep = () => setSteps(a => [...a, { stepNumber: a.length + 1, instruction: "" }]);
  const removeStep = (i) => setSteps(a => a.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));
  const handleImage = (e) => { const file = e.target.files[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ingredients.some(i => !i.name || !i.quantity)) return toast.error("Fill all ingredient fields");
    if (steps.some(s => !s.instruction)) return toast.error("Fill all step instructions");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== "tags") fd.append(k, v); });
      fd.append("ingredients", JSON.stringify(ingredients));
      fd.append("steps", JSON.stringify(steps));
      fd.append("tags", JSON.stringify(form.tags.split(",").map(t => t.trim()).filter(Boolean)));
      if (imageFile) fd.append("image", imageFile);
      const { data } = await createRecipe(fd);
      toast.success("Recipe submitted for review!");
      navigate(`/recipes/${data._id}`);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create recipe"); }
    setLoading(false);
  };

  const inputStyle = { display: "flex", flexDirection: "column", gap: "0.4rem" };
  const labelStyle = { fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" };

  return (
    <div className="page-container" style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="section-title" style={{ marginBottom: "0.4rem" }}>🍳 Create Recipe</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Share your culinary masterpiece with the community</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--accent)", fontSize: "1rem" }}>📝 Basic Information</h2>
          <div style={inputStyle}><label style={labelStyle}>Recipe Title *</label><input name="title" required className="input-field" placeholder="e.g. Creamy Butter Chicken" value={form.title} onChange={handleChange} /></div>
          <div style={inputStyle}><label style={labelStyle}>Description *</label><textarea name="description" required rows={3} className="input-field" placeholder="Describe your recipe..." value={form.description} onChange={handleChange} style={{ resize: "vertical" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div style={inputStyle}><label style={labelStyle}>Category *</label><select name="category" className="input-field" value={form.category} onChange={handleChange}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div style={inputStyle}><label style={labelStyle}>Cook Time (mins) *</label><input name="cookingTime" type="number" min="1" required className="input-field" placeholder="30" value={form.cookingTime} onChange={handleChange} /></div>
            <div style={inputStyle}><label style={labelStyle}>Servings *</label><input name="servings" type="number" min="1" required className="input-field" placeholder="4" value={form.servings} onChange={handleChange} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={inputStyle}><label style={labelStyle}>Difficulty</label><select name="difficulty" className="input-field" value={form.difficulty} onChange={handleChange}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
            <div style={inputStyle}><label style={labelStyle}>Tags (comma separated)</label><input name="tags" className="input-field" placeholder="italian, quick, healthy" value={form.tags} onChange={handleChange} /></div>
          </div>
        </div>
        {/* Image Upload */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--accent)", fontSize: "1rem", marginBottom: "1rem" }}>📸 Recipe Photo</h2>
          <label htmlFor="image-upload" style={{ cursor: "pointer" }}>
            <div style={{ border: "2px dashed var(--border)", borderRadius: "0.75rem", padding: "2rem", textAlign: "center", background: imagePreview ? "transparent" : "var(--bg-secondary)", overflow: "hidden" }}>
              {imagePreview ? <img src={imagePreview} alt="preview" style={{ maxHeight: "240px", borderRadius: "0.5rem", objectFit: "cover" }} /> : <><Upload size={32} color="var(--accent)" style={{ margin: "0 auto 0.75rem" }} /><p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Click to upload a photo</p></>}
            </div>
          </label>
          <input id="image-upload" type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
        </div>
        {/* Ingredients */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--accent)", fontSize: "1rem", marginBottom: "1rem" }}>🥕 Ingredients</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {ingredients.map((ing, i) => (
              <div key={i} style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
                <input className="input-field" placeholder="Quantity" value={ing.quantity} onChange={e => handleIngredient(i, "quantity", e.target.value)} style={{ width: "160px", flexShrink: 0 }} />
                <input className="input-field" placeholder="Ingredient name" value={ing.name} onChange={e => handleIngredient(i, "name", e.target.value)} style={{ flex: 1 }} />
                {ingredients.length > 1 && <button type="button" onClick={() => removeIngredient(i)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.5rem", cursor: "pointer", color: "#ef4444" }}><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
          <button type="button" onClick={addIngredient} className="btn-secondary" style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", fontSize: "0.8rem" }}><Plus size={14} /> Add Ingredient</button>
        </div>
        {/* Steps */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--accent)", fontSize: "1rem", marginBottom: "1rem" }}>👨‍🍳 Cooking Steps</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <span style={{ background: "var(--accent)", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0, marginTop: "8px" }}>{step.stepNumber}</span>
                <textarea className="input-field" rows={2} placeholder={`Step ${step.stepNumber}...`} value={step.instruction} onChange={e => handleStep(i, e.target.value)} style={{ flex: 1, resize: "vertical" }} />
                {steps.length > 1 && <button type="button" onClick={() => removeStep(i)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.5rem", cursor: "pointer", color: "#ef4444", marginTop: "8px" }}><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
          <button type="button" onClick={addStep} className="btn-secondary" style={{ marginTop: "0.75rem", padding: "0.5rem 1rem", fontSize: "0.8rem" }}><Plus size={14} /> Add Step</button>
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "0.9rem", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}>
          <ChefHat size={18} /> {loading ? "Submitting..." : "Submit Recipe for Review"}
        </button>
      </form>
    </div>
  );
};

export default CreateRecipe;
