import { useEffect, useState } from "react";
import { api } from "../api";

export default function RecipesList() {
  const [recipes, setRecipes] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    api.myRecipes(token)
      .then(setRecipes)
      .catch(err => setMsg(err.message));
  }, []);

  return (
    <div style={{ maxWidth: 720 }}>
      <h2>My Recipes</h2>
      {msg && <p style={{ color: "crimson" }}>❌ {msg}</p>}
      {recipes.length === 0 ? (
        <p>No recipes yet.</p>
      ) : (
        <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
          {recipes.map(r => (
            <li key={r._id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img src={r.imageUrl} alt={r.title} width="80" height="80" style={{ objectFit: "cover", borderRadius: 8 }} />
              <div>
                <div style={{ fontWeight: 600 }}>{r.title}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{r.ingredients?.length || 0} ingredients</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
