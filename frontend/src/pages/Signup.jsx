import { useState } from "react";
import { api } from "../api";

export default function Signup() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await api.signup(username, password); // POST /auth/signup
      setMsg("✅ Signup successful. You can log in next.");
      setU(""); setP("");
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <h2>Signup</h2>

      <label>
        Username
        <input
          value={username}
          onChange={(e) => setU(e.target.value)}
          placeholder="e.g. chefjane"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setP(e.target.value)}
          placeholder="••••••••"
          required
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </button>

      {msg && <p>{msg}</p>}
    </form>
  );
}
