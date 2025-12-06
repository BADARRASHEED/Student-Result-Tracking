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
    <div className="dashboard-view">
      <div className="hero-surface">
        <div className="hero-heading">
          <p className="tag">Dashboard</p>
          <h1 className="hero-title">Welcome back, {role || "Guest"}</h1>
          <p className="hero-subtitle">
            A refreshed control room with softer surfaces, balanced spacing, and quick-entry actions so you can stay focused.
          </p>
          <div className="hero-meta">
            <span className="pill strong">Role: {role || "Admin"}</span>
            <span className="pill subtle">Secure workspace session</span>
          </div>
        </div>
        <div className="hero-callout">
          <p className="label">Snapshot</p>
          <div className="stat-row">
            <div className="stat-block">
              <span className="label">Students</span>
              <div className="metric-value">{summary?.total_students ?? "--"}</div>
              <p className="hero-subtitle">Across all demo classes</p>
            </div>
            <div className="stat-block">
              <span className="label">Subjects</span>
              <div className="metric-value">{summary?.total_subjects ?? "--"}</div>
              <p className="hero-subtitle">Actively assessed subjects</p>
            </div>
            <div className="stat-block">
              <span className="label">Average score</span>
              <div className="metric-value">{summary?.average_score ?? "--"}%</div>
              <p className="badge soft">Pass rate {summary?.pass_rate ?? "--"}%</p>
            </div>
          </div>
        </div>
      </div>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      <div className="grid grid-3 metrics-grid">
        <div className="metric-card elevated">
          <div className="metric-header">
            <span className="metric-icon">🎓</span>
            <span className="pill subtle">Enrollment</span>
          </div>
          <div className="metric-value">{summary?.total_students ?? "--"}</div>
          <p className="hero-subtitle">Students are evenly distributed across demo classes.</p>
        </div>
        <div className="metric-card elevated">
          <div className="metric-header">
            <span className="metric-icon">📘</span>
            <span className="pill subtle">Subjects</span>
          </div>
          <div className="metric-value">{summary?.total_subjects ?? "--"}</div>
          <p className="hero-subtitle">Core subjects remain active for reporting and analytics.</p>
        </div>
        <div className="metric-card elevated">
          <div className="metric-header">
            <span className="metric-icon">🏆</span>
            <span className="pill subtle">Performance</span>
          </div>
          <div className="metric-value">{summary?.average_score ?? "--"}%</div>
          <p className="hero-subtitle">Pass rate {summary?.pass_rate ?? "--"}% across assessments.</p>
        </div>
      </div>

      <div className="card-grid modern-grid">
        <div className="card modern-card">
          <div className="section-header">
            <div>
              <p className="label">System Overview</p>
              <h3>Ready for your next action</h3>
              <p className="hero-subtitle">
                Prefilled demo data keeps charts meaningful from the first login. Use the shortcuts to jump straight into work.
              </p>
            </div>
            <span className="pill strong">{summary?.total_assessments ?? 0} assessments</span>
          </div>
          <div className="bullet-grid">
            <div className="bullet-item">Clean typography and softer cards elevate the experience.</div>
            <div className="bullet-item">Glassy gradients keep the dashboard airy and bright.</div>
            <div className="bullet-item">Quick navigation stays anchored for rapid switching.</div>
          </div>
          <div className="list-inline quick-actions">
            <Link className="button inline" href="/marks/entry">Enter Marks</Link>
            <Link className="button inline ghost" href="/analytics">
              View Analytics
            </Link>
            <Link className="button inline ghost" href="/students">
              Browse Students
            </Link>
          </div>
        </div>

        <div className="card modern-card">
          <div className="section-header">
            <div>
              <p className="label">Recent Assessments</p>
              <h3>Latest evaluations</h3>
            </div>
            <span className="pill subtle">Sorted by recency</span>
          </div>
          <div className="assessment-grid">
            {(summary?.recent_assessments || []).map((a: string) => (
              <div key={a} className="assessment-chip">
                <span className="metric-icon">🗂️</span>
                {a}
              </div>
            ))}
          </div>
          <p className="footer-note">Stay on top of the latest evaluations with a quick glance.</p>
        </div>
      </div>
    </div>
  );
}
