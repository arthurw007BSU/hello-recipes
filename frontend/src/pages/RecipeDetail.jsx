// frontend/src/pages/RecipeDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function RecipeDetail() {
  const { id } = useParams(); // matches :id in /recipes/:id
  const [recipe, setRecipe] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErr("");
        const data = await api.getRecipe(id); // we'll add this next
        setRecipe(data);
      } catch (e) {
        setErr(e.message || "Failed to load recipe");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      load();
    }
  }, [id]);

  if (err) {
    return (
      <p style={{ color: "crimson", marginTop: 16 }}>
        ❌ {err}
      </p>
    );
  }

  if (loading || !recipe) {
    return <p style={{ marginTop: 16 }}>Loading recipe…</p>;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>{recipe.title}</h2>

      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          style={{
            maxWidth: "100%",
            maxHeight: 320,
            objectFit: "cover",
            borderRadius: 8,
            marginBottom: 16,
          }}
          onError={(e) => {
            e.currentTarget.src =
              "https://cdn.pixabay.com/photo/2012/04/24/13/19/exclamation-40026_1280.png";
          }}
        />
      )}

      {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
        <>
          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                {ing?.name ?? ""}
                {ing?.quantity ? ` — ${ing.quantity}` : ""}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ fontSize: 14, opacity: 0.7 }}>No ingredients listed.</p>
      )}
    </div>
  );
}
