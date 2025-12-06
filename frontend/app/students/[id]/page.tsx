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
      <div className="result-card">
        <div className="result-header">
          <div className="header-copy">
            <p className="micro-label">Student result card</p>
            <h1 className="result-title">{profile?.name || "Student Detail"}</h1>
            <p className="muted">
              A clean summary of grades, term highlights, and a downloadable report.
            </p>
            {profile && (
              <div className="result-meta">
                <span className="chip">Roll {profile.roll_number}</span>
                <span className="chip subtle">Class {profile.class_name}</span>
                <span className="chip muted">{profile.marks.length} assessments</span>
              </div>
            )}
          </div>

          {summary && (
            <div className="summary-box">
              <p className="label">Overall grade</p>
              <div className="grade-display">{summary.grade}</div>
              <p className="summary-number">{summary.overall}% average</p>
              <button className="button secondary" onClick={downloadReport}>
                Download PDF
              </button>
            </div>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        {summary && (
          <div className="result-stats">
            <div className="stat-tile">
              <p className="metric-label">Overall percentage</p>
              <div className="stat-value">{summary.overall}%</div>
              <p className="metric-sub">Average across recorded assessments.</p>
            </div>
            <div className="stat-tile">
              <p className="metric-label">Assessments</p>
              <div className="stat-value">{summary.assessments}</div>
              <p className="metric-sub">Quizzes, midterms, and exams.</p>
            </div>
            <div className="stat-tile">
              <p className="metric-label">Top subject</p>
              <div className="stat-value small">
                <span>{summary.bestSubject?.subject || "–"}</span>
                {summary.bestSubject && <span className="chip subtle">{summary.bestSubject.average}% avg</span>}
              </div>
              <p className="metric-sub">Highest performing subject for the term.</p>
            </div>
          </div>
        )}

        {profile && (
          <div className="result-grid">
            <div className="result-panel">
              <div className="panel-heading">
                <div>
                  <p className="metric-label">Student information</p>
                  <h3 className="panel-title">{profile.name}</h3>
                </div>
                {summary && <span className="chip success">On track</span>}
              </div>
              <dl className="detail-list">
                <div className="detail-row">
                  <dt>Roll number</dt>
                  <dd>{profile.roll_number}</dd>
                </div>
                <div className="detail-row">
                  <dt>Class</dt>
                  <dd>{profile.class_name}</dd>
                </div>
                <div className="detail-row">
                  <dt>Report email</dt>
                  <dd className="muted">{profile.name.toLowerCase().split(" ").join(".")}@example.com</dd>
                </div>
              </dl>
            </div>

            {trend && (
              <div className="result-panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <p className="metric-label">Performance trend</p>
                    <h3 className="panel-title">Recent assessments</h3>
                  </div>
                  <span className="chip subtle">Percentage</span>
                </div>
                <Line
                  data={{
                    labels: trend.trend.map((p: any) => p.assessment),
                    datasets: [
                      {
                        label: "Percentage",
                        data: trend.trend.map((p: any) => p.percentage),
                        borderColor: "#1f2937",
                        backgroundColor: "rgba(31, 41, 55, 0.08)",
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={{ plugins: { legend: { display: false } } }}
                />
              </div>
            )}
          </div>
        )}

        {profile && (
          <div className="result-panel table-panel">
            <div className="panel-heading">
              <div>
                <p className="metric-label">Assessment breakdown</p>
                <h3 className="panel-title">Term 1 performance</h3>
              </div>
              <p className="metric-sub">Sorted by assessment order.</p>
            </div>
            <table className="table simple-table">
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
    </div>
  );
}
