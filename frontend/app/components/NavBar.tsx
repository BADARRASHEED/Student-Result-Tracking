"use client";
import Link from "next/link";
import { clearAuth, getName, getRole } from "../lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setName(getName());
    setRole(getRole());
  }, []);

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-title">Sajana – Student Result Tracking &amp; Performance Analytics System</span>
        <span className="brand-subtitle">Sajana Analytics · Designed and Developed by Sajana</span>
      </div>
      <div className="user-chip">
        <div>
          <div style={{ fontWeight: 600 }}>{name || "Guest"}</div>
          <div className="pill">{role || "No role"}</div>
        </div>
        <Link href="/dashboard" className="button inline secondary">Dashboard</Link>
        <button className="button inline" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
