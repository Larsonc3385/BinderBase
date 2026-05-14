"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [error, setError] = useState(null);
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
      const res = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser.trim(), password: loginPass }),
      });
      const data = await res.json();
      if (!data.valid) throw new Error(data.message || "Invalid credentials.");
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("userid", data.user.id);
      router.push("/deck");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);
    if (!signupUser.trim() || !signupPass) return setError("Please fill in all fields.");
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signupUser.trim(), password: signupPass }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.message || "Signup failed.");
      setTab("login");
      setLoginUser(signupUser.trim());
      setSignupUser("");
      setSignupPass("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ fontFamily: "'Crimson Pro', serif" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--surface)",
          border: "1px solid var(--gold)",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
          position: "relative",
        }}
      >
        {/* Top shimmer line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: 1,
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "2rem 2rem 1.5rem",
            borderBottom: "1px solid var(--gold-dim)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              margin: "0 auto 1rem",
              borderRadius: 6,
              border: "1px solid var(--gold)",
              background: "var(--void)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--gold-bright)",
            }}
          >
            BB
          </div>
          <h1
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--gold-bright)",
              letterSpacing: "0.04em",
              margin: "0 0 4px",
            }}
          >
            BinderBase
          </h1>
          <p style={{ fontStyle: "italic", fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
            Enter, if you dare.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "1.75rem 2rem" }}>
          {error && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.5rem 0.75rem",
                borderRadius: 4,
                border: "1px solid rgba(127,29,29,0.5)",
                background: "rgba(127,29,29,0.2)",
                color: "#f87171",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              border: "1px solid var(--gold-dim)",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: "1.5rem",
            }}
          >
            {["login", "signup"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  border: "none",
                  background: tab === t ? "var(--gold-mid)" : "transparent",
                  color: tab === t ? "var(--gold-light)" : "var(--text-muted)",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin}>
              <FieldGroup label="Username">
                <input
                  type="text"
                  placeholder="Your username"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  autoComplete="username"
                  style={inputStyle}
                />
              </FieldGroup>
              <FieldGroup label="Password">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  autoComplete="current-password"
                  style={inputStyle}
                />
              </FieldGroup>
              <SubmitButton loading={loading} label="Login" loadingLabel="Signing in…" />
            </form>
          )}

          {/* Signup Form */}
          {tab === "signup" && (
            <form onSubmit={handleSignup}>
              <FieldGroup label="Username">
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={signupUser}
                  onChange={(e) => setSignupUser(e.target.value)}
                  autoComplete="username"
                  style={inputStyle}
                />
              </FieldGroup>
              <FieldGroup label="Password">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </FieldGroup>
              <SubmitButton loading={loading} label="Sign Up" loadingLabel="Creating account…" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label
        style={{
          display: "block",
          fontFamily: "'Cinzel', serif",
          fontSize: "0.68rem",
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%",
        padding: "0.55rem 0",
        marginTop: "0.25rem",
        border: "1px solid var(--gold)",
        borderRadius: 4,
        background: "var(--gold-mid)",
        color: "var(--gold-light)",
        fontFamily: "'Cinzel', serif",
        fontSize: "0.72rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.5 : 1,
        transition: "all 0.15s",
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: 4,
  border: "1px solid var(--gold-dim)",
  background: "var(--sunken)",
  color: "var(--text-primary)",
  fontFamily: "'Crimson Pro', serif",
  fontSize: "1rem",
  outline: "none",
};