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
