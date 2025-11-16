import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";

import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import RecipesList from "./pages/RecipesList.jsx";
import Protected from "./Protected.jsx";
import Home from "./pages/Home.jsx";
import RecipeForm from "./pages/RecipeForm.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx"; // ⬅️ NEW

import { auth } from "./auth";

function Shell({ children }) {
  const nav = useNavigate();
  const authed = !!localStorage.getItem("token");

  function signOut() {
    auth.logout(); // clear token
    nav("/login", { replace: true });
  }

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <header
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        <h1 style={{ marginRight: "auto" }}>🍲 Recipes</h1>
        <Link to="/">Home</Link>
        <Link to="/recipes">My Recipes</Link>
        {authed ? (
          <>
            <Link to="/recipes/new">New</Link>
            <button onClick={signOut}>Sign out</button>
          </>
        ) : (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </header>
      {children}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/recipes"
            element={
              <Protected>
                <RecipesList />
              </Protected>
            }
          />

          <Route
            path="/recipes/new"
            element={
              <Protected>
                <RecipeForm />
              </Protected>
            }
          />

          {/* NEW: recipe detail route */}
          <Route
            path="/recipes/:id"
            element={
              <Protected>
                <RecipeDetail />
              </Protected>
            }
          />
        </Routes>
      </Shell>
    </BrowserRouter>
  </React.StrictMode>
);
