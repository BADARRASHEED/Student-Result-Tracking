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
        <div className="brand-mark">RT</div>
        <div className="brand-copy">
          <span className="brand-title">Result Tracking Workspace</span>
          <span className="brand-subtitle">Curated dashboards, insights, and actions in one flow</span>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="status-chip">
          <span className="pulse-dot" aria-hidden /> Synced workspace
        </div>
        <div className="user-chip">
          <div className="user-meta">
            <div className="user-name">{name || "Admin Console"}</div>
            <div className="pill strong">{role || "Admin only access"}</div>
          </div>
          <div className="user-actions">
            <Link href="/dashboard" className="button inline ghost">
              Dashboard
            </Link>
            <button className="button inline" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
