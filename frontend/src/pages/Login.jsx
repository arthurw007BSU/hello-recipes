import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { auth } from "../auth";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const { token } = await api.login(username, password);
      auth.token = token;           // save JWT
      nav("/recipes");              // we'll add this route soon
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <h2>Login</h2>

      <label>
        Username
        <input value={username} onChange={(e)=>setU(e.target.value)} required />
      </label>

      <label>
        Password
        <input type="password" value={password} onChange={(e)=>setP(e.target.value)} required />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>

      {msg && <p>{msg}</p>}
      <p>Need an account? <Link to="/signup">Signup</Link></p>
    </form>
  );
}
