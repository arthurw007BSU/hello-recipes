import { useEffect, useState, useCallback } from "react";
import { api } from "../api";

export default function Home() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [liking, setLiking] = useState({}); // map of recipeId -> true while liking
  const [sort, setSort] = useState(""); // "" | "popular"

  const loadFeed = useCallback(async (currentSort = sort) => {
    try {
      setLoading(true);
      setErr("");
      const data = await api.feed(currentSort);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed, sort]);

  async function toggleLike(id) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to like recipes.");
      return;
    }
    try {
      setLiking((m) => ({ ...m, [id]: true }));
      await api.likeRecipe(token, id);
      // ✅ Always refresh feed to get accurate counts & correct sort order
      await loadFeed();
    } catch (e) {
      alert(`Like failed: ${e.message}`);
    } finally {
      setLiking((m) => {
        const { [id]: _, ...rest } = m;
        return rest;
      });
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>All Recipes</h2>

        {/* Sort control (supports rubric: "Sort by the most liked") */}
        <label style={{ fontSize: 14 }}>
          Sort:&nbsp;
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ padding: "4px 6px" }}
            aria-label="Sort recipes"
          >
            <option value="">Newest</option>
            <option value="popular">Most Liked</option>
          </select>
        </label>
      </div>

      {err && (
        <p style={{ color: "crimson", marginTop: 12 }}>
          ❌ {err}
        </p>
      )}

      {loading && <p style={{ opacity: 0.7, marginTop: 12 }}>Loading…</p>}

      {!loading && items.length === 0 && (
        <p style={{ marginTop: 12 }}>No recipes yet.</p>
      )}

      {!loading && items.length > 0 && (
        <ul
          style={{
            display: "grid",
            gap: 12,
            padding: 0,
            listStyle: "none",
            marginTop: 12,
          }}
        >
          {items.map((r) => {
            const count =
              typeof r.likeCount === "number"
                ? r.likeCount
                : Array.isArray(r.likedBy)
                ? r.likedBy.length
                : 0;

            return (
              <li
                key={r._id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <img
                  src={r.imageUrl}
                  alt={r.title}
                  width="80"
                  height="80"
                  style={{ objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                  onError={(e) => {
                    e.currentTarget.src =
                    "https://cdn.pixabay.com/photo/2022/07/15/18/12/cheese-burger-7323672_1280.jpg"
                     //"https://via.placeholder.com/80?text=img";
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.title}</div>

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
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      No ingredients listed
                    </div>
                  )}

                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                    <span aria-label="like count" title="Likes">
                      🔥 {count}
                    </span>
                    <button
                      onClick={() => toggleLike(r._id)}
                      disabled={!!liking[r._id]}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        background: liking[r._id] ? "#f3f4f6" : "#ffffff",
                        cursor: liking[r._id] ? "not-allowed" : "pointer",
                      }}
                    >
                      {liking[r._id] ? "Liking…" : "Like"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
