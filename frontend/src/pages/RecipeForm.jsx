import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function RecipeForm() {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  function setIng(i, key, val) {
    setIngredients(arr => arr.map((it, idx) => idx === i ? { ...it, [key]: val } : it));
  }
  function addIng() { setIngredients(arr => [...arr, { name: "", quantity: "" }]); }
  function delIng(i) { setIngredients(arr => arr.filter((_, idx) => idx !== i)); }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await api.createRecipe(token, { title, imageUrl, ingredients });
      nav("/recipes"); // go see it in My Recipes
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <h2>New Recipe</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={e=>setTitle(e.target.value)}
        required
      />

      <input
        placeholder="Image URL (http…)"
        value={imageUrl}
        onChange={e=>setImageUrl(e.target.value)}
        required
      />

      <div>
        <h3>Ingredients</h3>
        {ingredients.map((ing, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              placeholder="Name"
              value={ing.name}
              onChange={e=>setIng(i, "name", e.target.value)}
              required
            />
            <input
              placeholder="Quantity"
              value={ing.quantity}
              onChange={e=>setIng(i, "quantity", e.target.value)}
              required
            />
            <button type="button" onClick={()=>delIng(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addIng}>+ Add ingredient</button>
      </div>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Create"}
      </button>

      {msg && <p style={{ color: "crimson" }}>❌ {msg}</p>}
    </form>
  );
}
