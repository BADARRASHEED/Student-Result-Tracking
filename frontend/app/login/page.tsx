"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, saveAuth } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
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
    <div className="container" style={{ maxWidth: 480 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="card">
        <label>Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button className="button" type="submit">Sign In</button>
      </form>
      <p>Use seeded accounts: admin@example.com / admin123 or teacher@example.com / teach123</p>
    </div>
  );
}
