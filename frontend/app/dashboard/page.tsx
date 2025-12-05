"use client";
import { useEffect, useState } from "react";
import { apiFetch, getRole } from "../lib/api";
import Link from "next/link";

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setRole(getRole());
    const fetchCounts = async () => {
      try {
        const data = await apiFetch("/analytics/dashboard-summary");
        setSummary(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <div className="hero">
        <p className="tag">Dashboard</p>
        <h1 className="hero-title">Welcome back, {role || "Guest"}</h1>
        <p className="hero-subtitle">Sajana – Student Result Tracking &amp; Performance Analytics System</p>
      </div>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      <div className="grid grid-3">
        <div className="metric-card">
          <div className="label">Total Students</div>
          <div className="metric-value">{summary?.total_students ?? "--"}</div>
          <p className="hero-subtitle">Across all demo classes</p>
        </div>
        <div className="metric-card">
          <div className="label">Subjects</div>
          <div className="metric-value">{summary?.total_subjects ?? "--"}</div>
          <p className="hero-subtitle">Actively assessed subjects</p>
        </div>
        <div className="metric-card">
          <div className="label">Average Score</div>
          <div className="metric-value">{summary?.average_score ?? "--"}%</div>
          <p className="badge">Pass rate {summary?.pass_rate ?? "--"}%</p>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="section-header">
            <h3>System Overview</h3>
            <span className="pill">{summary?.total_assessments ?? 0} assessments</span>
          </div>
          <p>
            Sajana Analytics curates three demo classes filled with rich marks data to make dashboards and charts instantly
            meaningful. Use the quick links to jump into day-to-day actions.
          </p>
          <div className="list-inline">
            <Link className="button inline" href="/marks/entry">Enter Marks</Link>
            <Link className="button inline secondary" href="/analytics">View Analytics</Link>
            <Link className="button inline secondary" href="/students">Browse Students</Link>
          </div>
        </div>

        <div className="card">
          <h3>Recent Assessments</h3>
          <ul className="list-inline">
            {(summary?.recent_assessments || []).map((a: string) => (
              <li key={a} className="pill">{a}</li>
            ))}
          </ul>
          <p className="footer-note">Designed and Developed by Sajana</p>
        </div>
      </div>
    </div>
  );
}
