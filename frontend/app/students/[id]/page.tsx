"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch, API_BASE } from "../../lib/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StudentDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [error, setError] = useState("");

  const gradeFromPercentage = (pct: number) => {
    if (pct >= 85) return "A";
    if (pct >= 70) return "B";
    if (pct >= 55) return "C";
    if (pct >= 40) return "D";
    return "E";
  };

  const summary = (() => {
    if (!profile) return null;
    const percentages = profile.marks.map((m: any) => m.percentage);
    const overall = percentages.length
      ? Number((percentages.reduce((a: number, b: number) => a + b, 0) / percentages.length).toFixed(2))
      : 0;
    const assessments = profile.marks.length;
    const subjectTotals: Record<string, number[]> = {};
    profile.marks.forEach((m: any) => {
      if (!subjectTotals[m.subject]) subjectTotals[m.subject] = [];
      subjectTotals[m.subject].push(m.percentage);
    });
    const subjectAverages = Object.entries(subjectTotals).map(([subject, scores]) => ({
      subject,
      average: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
    }));
    const bestSubject = subjectAverages.sort((a, b) => b.average - a.average)[0];

    return {
      overall,
      assessments,
      grade: gradeFromPercentage(overall),
      bestSubject,
    };
  })();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [p, t] = await Promise.all([
          apiFetch(`/students/${id}/profile`),
          apiFetch(`/analytics/student/${id}/trend`),
        ]);
        setProfile(p);
        setTrend(t);
      } catch (err: any) {
        setError(err.message);
      }
    };
    load();
  }, [id]);

  const downloadReport = () => {
    window.open(`${API_BASE}/reports/student/${id}?term=Term 1`, "_blank");
  };

  return (
    <div className="student-page">
      <div className="profile-banner">
        <div className="banner-main">
          <p className="tag subtle">Student snapshot</p>
          <h1 className="hero-title">{profile?.name || "Student Detail"}</h1>
          <p className="hero-subtitle">
            A consolidated view of class performance, assessment history, and a downloadable report card.
          </p>
          {profile && (
            <div className="badge-row">
              <span className="pill soft">Roll {profile.roll_number}</span>
              <span className="pill subtle">Class {profile.class_name}</span>
              <span className="pill muted">{profile.marks.length} assessments</span>
            </div>
          )}
        </div>
        <div className="banner-actions">
          <div className="pill strong">Term 1 Report</div>
          <button className="button inline" onClick={downloadReport}>
            Download PDF
          </button>
        </div>
      </div>

      {error && <p style={{ color: "#f97316" }}>{error}</p>}

      {summary && (
        <div className="stat-grid">
          <div className="stat-card accent">
            <div className="stat-card-heading">
              <p className="metric-label">Overall percentage</p>
              <span className="pill strong">Grade {summary.grade}</span>
            </div>
            <div className="stat-card-value">{summary.overall}%</div>
            <p className="metric-sub">Weighted average across all recorded assessments.</p>
          </div>

          <div className="stat-card">
            <p className="metric-label">Assessments logged</p>
            <div className="stat-card-value">{summary.assessments}</div>
            <p className="metric-sub">Includes quizzes, midterms, and consolidated exams.</p>
          </div>

          <div className="stat-card soft">
            <p className="metric-label">Top subject</p>
            <div className="stat-card-value small">
              <span>{summary.bestSubject?.subject || "–"}</span>
              {summary.bestSubject && <span className="pill subtle">{summary.bestSubject.average}% avg</span>}
            </div>
            <p className="metric-sub">Highest performing subject based on term scores.</p>
          </div>
        </div>
      )}

      {profile && (
        <div className="grid grid-2 stretch">
          <div className="card profile-panel">
            <div className="panel-heading">
              <div>
                <p className="metric-label">Student information</p>
                <h3 className="panel-title">{profile.name}</h3>
              </div>
              {summary && <span className="badge success">On track</span>}
            </div>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Roll number</span>
                <span className="info-value">{profile.roll_number}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Class</span>
                <span className="info-value">{profile.class_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Report email</span>
                <span className="info-value muted">
                  {profile.name.toLowerCase().split(" ").join(".")}@example.com
                </span>
              </div>
            </div>
          </div>
          {trend && (
            <div className="card chart-card">
              <div className="panel-heading">
                <div>
                  <p className="metric-label">Performance trend</p>
                  <h3 className="panel-title">Recent assessments</h3>
                </div>
                <span className="pill subtle">Percentage</span>
              </div>
              <Line
                data={{
                  labels: trend.trend.map((p: any) => p.assessment),
                  datasets: [
                    {
                      label: "Percentage",
                      data: trend.trend.map((p: any) => p.percentage),
                      borderColor: "#2563eb",
                      backgroundColor: "rgba(37, 99, 235, 0.16)",
                      tension: 0.35,
                    },
                  ],
                }}
              />
            </div>
          )}
        </div>
      )}

      {profile && (
        <div className="card table-card">
          <div className="panel-heading">
            <div>
              <p className="metric-label">Assessment breakdown</p>
              <h3 className="panel-title">Term 1 performance</h3>
            </div>
            <p className="metric-sub">Sorted by assessment order.</p>
          </div>
          <table className="table modern-table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Subject</th>
                <th>Term</th>
                <th>Score</th>
                <th className="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {profile.marks.map((m: any, idx: number) => (
                <tr key={`${m.assessment}-${idx}`}>
                  <td>{m.assessment}</td>
                  <td>{m.subject}</td>
                  <td>{m.term}</td>
                  <td>
                    {m.score}/{m.maximum}
                  </td>
                  <td className="text-right">{m.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
