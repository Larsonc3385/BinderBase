"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab]         = useState("login");
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [signupUser, setSignupUser] = useState("");
  const [signupPass, setSignupPass] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    if (!loginUser.trim() || !loginPass) return setError("Please fill in all fields.");
    setLoading(true);
    try {
      const res  = await fetch(`${API}/users/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser.trim(), password: loginPass }),
      });
      const data = await res.json();
      if (!data.valid) throw new Error(data.message || "Invalid credentials.");
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("userid", data.user.id);
      router.push("/deck");
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  // ai
  async function handleSignup(e) {
    e.preventDefault();
    setError(null);
    if (!signupUser.trim() || !signupPass) return setError("Please fill in all fields.");
    setLoading(true);
    try {
      const res  = await fetch(`${API}/users/create`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signupUser.trim(), password: signupPass }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.message || "Signup failed.");
      setTab("login");
      setLoginUser(signupUser.trim());
      setSignupUser(""); setSignupPass("");
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
         style={{ background: "radial-gradient(ellipse at top, #2a0a4a 0%, #0d0117 60%)" }}>
      <div className="card border-0 shadow-lg" style={{ width: "100%", maxWidth: 420 }}>
        <div className="card-header text-center py-4 border-0"
             style={{ background: "rgba(111,66,193,0.15)" }}>
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
               style={{ width: 56, height: 56, background: "rgba(111,66,193,0.3)", border: "1px solid #6f42c1" }}>
            <i className="bi bi-stack fs-4 text-info"></i>
          </div>
          <h1 className="h4 mb-0 text-white fw-bold">BinderBase</h1>
          <p className="text-muted small fst-italic mb-0">MTG Deck Builder</p>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <ul className="nav nav-pills nav-justified mb-4">
            {["login","signup"].map(t => (
              <li key={t} className="nav-item">
                <button className={`nav-link ${tab === t ? "active" : ""}`}
                        onClick={() => { setTab(t); setError(null); }}>
                  {t === "login" ? "Sign In" : "Register"}
                </button>
              </li>
            ))}
          </ul>

          {tab === "login" && (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small text-muted">Username</label>
                <input type="text" className="form-control" placeholder="Your username"
                       value={loginUser} onChange={e => setLoginUser(e.target.value)} autoComplete="username" />
              </div>
              <div className="mb-4">
                <label className="form-label small text-muted">Password</label>
                <input type="password" className="form-control" placeholder="••••••••"
                       value={loginPass} onChange={e => setLoginPass(e.target.value)} autoComplete="current-password" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-100">
                {loading ? "Signing in…" : "Login"}
              </button>
            </form>
          )}

          {tab === "signup" && (
            <form onSubmit={handleSignup}>
              <div className="mb-3">
                <label className="form-label small text-muted">Username</label>
                <input type="text" className="form-control" placeholder="Choose a username"
                       value={signupUser} onChange={e => setSignupUser(e.target.value)} autoComplete="username" />
              </div>
              <div className="mb-4">
                <label className="form-label small text-muted">Password</label>
                <input type="password" className="form-control" placeholder="••••••••"
                       value={signupPass} onChange={e => setSignupPass(e.target.value)} autoComplete="new-password" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-100">
                {loading ? "Creating account…" : "Sign Up"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}