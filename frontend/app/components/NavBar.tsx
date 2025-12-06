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
      <Link href="/dashboard" className="brand brand-compact">
        <div className="brand-mark">RT</div>
        <div className="brand-copy">
          <span className="brand-title">Result Tracker</span>
          <span className="brand-subtitle">Workspace</span>
        </div>
      </Link>

      <div className="topbar-actions">
        <nav className="main-nav" aria-label="Primary navigation">
          <Link href="/dashboard" className="nav-pill">
            Dashboard
          </Link>
          <Link href="/students" className="nav-pill">
            Students
          </Link>
          <Link href="/marks" className="nav-pill">
            Marks
          </Link>
        </nav>

        <div className="status-chip subtle">
          <span className="pulse-dot" aria-hidden /> Synced
        </div>

        <div className="user-chip">
          <div className="user-avatar" aria-hidden>
            {(name || "Admin").charAt(0).toUpperCase()}
          </div>
          <div className="user-meta">
            <div className="user-name">{name || "Admin"}</div>
            <div className="pill strong">{role || "Administrator"}</div>
          </div>
          <button className="button inline" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
