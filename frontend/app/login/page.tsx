"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, saveAuth } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gami.com");
  const [password, setPassword] = useState("admin123");
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
        const message = await res.text();
        throw new Error(message || "Invalid credentials");
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
          <div className="eyebrow">Student Result Platform</div>
          <div className="auth-header">
            <h1>Secure entry for administrators</h1>
            <p className="muted">
              Sign in to orchestrate classes, students, and assessments with a streamlined workspace built for clarity.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-row">
              <label className="label" htmlFor="email">
                Work Email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
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
                placeholder="Secure password"
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
              {isSubmitting ? "Signing in..." : "Access Console"}
            </button>
          </form>

          <div className="auth-footer" style={{ borderTop: "none", paddingTop: 0 }}>
            <div>
              <p className="muted">After signing in you can jump straight to dashboards or update marks.</p>
              <div className="list-inline">
                <span className="pill">Fast navigation</span>
                <span className="pill">Modern layout</span>
                <span className="pill">Clear typography</span>
              </div>
            </div>
            <div className="auth-hint">
              <div className="pill">Optimized for admin focus</div>
              <span className="muted">Minimal clutter, maximum visibility.</span>
            </div>
          </div>
        </div>

        <div className="auth-aside">
          <div className="stat-board">
            <div className="stat-chip">
              <span className="stat-label">Students ready</span>
              <span className="stat-value">15 tracked profiles</span>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Assessment health</span>
              <span className="stat-value">Pass rates in real time</span>
            </div>
            <div className="stat-chip">
              <span className="stat-label">Navigation</span>
              <span className="stat-value">Dashboards &amp; analytics one click away</span>
            </div>
          </div>

          <ul className="feature-list">
            <li>
              <span className="feature-dot" />
              <span>Balanced dark theme for long review sessions.</span>
            </li>
            <li>
              <span className="feature-dot" />
              <span>Student cards and analytics refreshed with glassmorphism.</span>
            </li>
            <li>
              <span className="feature-dot" />
              <span>Consistent spacing, rounded corners, and legible labels.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
