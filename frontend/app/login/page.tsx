"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, saveAuth } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("sajana.admin@example.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const body = new URLSearchParams();
      body.append("username", email);
      body.append("password", password);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      saveAuth(data.access_token, data.role || "", data.name || "");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div className="card" style={{ maxWidth: 540, width: "100%" }}>
        <div className="hero" style={{ textAlign: "center" }}>
          <p className="tag">Sajana Analytics</p>
          <h1 className="hero-title">Sajana – Student Result Tracking &amp; Performance Analytics System</h1>
          <p className="hero-subtitle">Designed and Developed by Sajana</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: "#f87171", marginTop: "-0.25rem" }}>{error}</p>}
          <button className="button" type="submit" style={{ width: "100%", marginTop: "0.75rem" }}>
            Sign In
          </button>
        </form>
        <p className="footer-note">
          Demo accounts: Admin - sajana.admin@example.com / Admin@123 · Teacher - emma.teacher@example.com / Password@123 ·
          Student - amelia.student@example.com / Password@123
        </p>
      </div>
    </div>
  );
}
