import { useEffect, useState } from "react";
import { api } from "../api";

export default function Home() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.feed().then(setItems).catch(e => setErr(e.message));
  }, []);

  return (
    <div style={{ maxWidth: 720 }}>
      <h2>All Recipes</h2>
      {err && <p style={{ color: "crimson" }}>❌ {err}</p>}
      {items.length === 0 ? (
        <p>No recipes yet.</p>
      ) : (
        <ul style={{ display: "grid", gap: 12, padding: 0, listStyle: "none" }}>
          {items.map(r => (
            <li key={r._id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <img
                src={r.imageUrl}
                alt={r.title}
                width="80"
                height="80"
                style={{ objectFit: "cover", borderRadius: 8 }}
                onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/80?text=img"; }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{r.title}</div>

                {/* show ingredients */}
                {Array.isArray(r.ingredients) && r.ingredients.length > 0 ? (
                  <ul style={{ margin: "6px 0", paddingLeft: "18px" }}>
                    {r.ingredients.map((ing, i) => (
                      <li key={i}>
                        {ing?.name ?? ""}
                        {ing?.quantity ? ` — ${ing.quantity}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: 12, opacity: 0.7 }}>No ingredients listed</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
