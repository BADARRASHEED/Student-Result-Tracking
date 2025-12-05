"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, saveAuth } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("sajana.admin@example.com");
  const [password, setPassword] = useState("Admin@123");
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
        <div className="auth-header">
          <div className="eyebrow">Admin Console</div>
          <h1>Student Results Command Center</h1>
          <p className="muted">
            Secure access to update marks, manage cohorts, and review performance trends without distractions.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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

          {error && (
            <div className="alert" role="status" aria-live="polite">
              {error}
            </div>
          )}

          <button className="button full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <div>
            <p className="muted">Use the seeded admin account to access the dashboard.</p>
            <div className="cred-grid">
              <div className="cred-chip">
                <span className="cred-label">Email</span>
                <span className="cred-value">sajana.admin@example.com</span>
              </div>
              <div className="cred-chip">
                <span className="cred-label">Password</span>
                <span className="cred-value">Admin@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
