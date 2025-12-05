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
    <div>
      <div className="section-header">
        <div className="hero">
          <p className="tag">Student</p>
          <h1 className="hero-title">{profile?.name || "Student Detail"}</h1>
          <p className="hero-subtitle">Full profile, recent marks, and a one-click downloadable report.</p>
        </div>
        <button className="button inline" onClick={downloadReport}>
          Download Report Card
        </button>
      </div>
      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      {profile && (
        <div className="grid grid-2">
          <div className="card">
            <h3>Student Information</h3>
            <p className="hero-subtitle">Roll Number: {profile.roll_number}</p>
            <p className="hero-subtitle">Class: {profile.class_name}</p>
            <p className="hero-subtitle">Email mapping: {profile.name.toLowerCase().split(" ").join(".")}@example.com</p>
          </div>
          {trend && (
            <div className="card">
              <h3>Performance Trend</h3>
              <Line
                data={{
                  labels: trend.trend.map((p: any) => p.assessment),
                  datasets: [
                    {
                      label: "Percentage",
                      data: trend.trend.map((p: any) => p.percentage),
                      borderColor: "#60a5fa",
                      backgroundColor: "rgba(96, 165, 250, 0.2)",
                    },
                  ],
                }}
              />
            </div>
          )}
        </div>
      )}

      {profile && (
        <div className="card">
          <h3>Assessments</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Subject</th>
                <th>Term</th>
                <th>Score</th>
                <th>%</th>
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
                  <td>{m.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
