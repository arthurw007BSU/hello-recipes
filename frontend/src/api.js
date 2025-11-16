const BASE = import.meta.env.VITE_API_URL;

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = isJson && data?.error ? data.error : data || "request_failed";
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // health (for testing)
  health: () => request(`/healthz`),

  // auth
  signup: (username, password) =>
    request(`/auth/signup`, { method: "POST", body: { username, password } }),
  login: (username, password) =>
    request(`/auth/login`, { method: "POST", body: { username, password } }),

  // recipes
  myRecipes: (token) => request(`/recipes/mine`, { token }),

  createRecipe: (token, payload) =>
    request(`/recipes`, { method: "POST", body: payload, token }),

  // 🔧 UPDATED: id first, token optional
  getRecipe: (id, token) =>
    request(`/recipes/${id}`, token ? { token } : {}),

  updateRecipe: (token, id, b) =>
    request(`/recipes/${id}`, { method: "PUT", body: b, token }),

  deleteRecipe: (token, id) =>
    request(`/recipes/${id}`, { method: "DELETE", token }),

  feed: (sort) => {
    const query = sort ? `?sort=${encodeURIComponent(sort)}` : "";
    return request(`/recipes/feed${query}`);
  },

  likeRecipe: (token, id) =>
    request(`/recipes/${id}/like`, { method: "POST", token }),
};
