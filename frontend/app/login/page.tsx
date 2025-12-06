"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, saveAuth } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const body = new URLSearchParams();
      body.append("username", email);
      body.append("password", password);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) {
        let message = "Invalid credentials";
        try {
          const payload = await res.json();
          message = payload?.detail || payload?.message || message;
        } catch (parseError) {
          const fallback = await res.text();
          message = fallback || message;
        }
        throw new Error(message);
      }
      const data = await res.json();
      saveAuth(data.access_token, data.role || "", data.name || "");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-panel">
          <div className="eyebrow">Student Result Tracking Suite</div>
          <div className="auth-header">
            <h1>Admin console access</h1>
            <p className="muted">Sign in to manage results, users, and oversight workflows.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-row">
              <label className="label" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@school.edu"
                autoComplete="username"
                required
              />
            </div>

            <div className="input-row">
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="alert" role="status" aria-live="polite">
                {error}
              </div>
            )}

            <button className="button full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
