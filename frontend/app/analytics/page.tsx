"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AnalyticsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/classes/").then(setClasses).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const load = async () => {
      try {
        const subj = await apiFetch(`/analytics/class/${selectedClass}/subjects-summary`);
        setSubjectData(subj);
        const overviewResp = await apiFetch(`/analytics/class/${selectedClass}/overview`);
        setOverview(overviewResp);
      } catch (err: any) {
        setError(err.message);
      }
    };
    load();
  }, [selectedClass]);

  return (
    <div>
      <h1>Analytics</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="card">
        <label>Select Class</label>
        <select className="input" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">Choose</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {subjectData.length > 0 && (
        <div className="card">
          <h3>Subject Averages</h3>
          <Bar
            data={{
              labels: subjectData.map((s) => s.subject),
              datasets: [
                { label: "Average %", data: subjectData.map((s) => s.average), backgroundColor: "#60a5fa" },
              ],
            }}
          />
        </div>
      )}

      {overview && (
        <div className="card">
          <h3>Class Overview</h3>
          <p>Average: {overview.overview.average}%</p>
          <p>Min: {overview.overview.minimum}% | Max: {overview.overview.maximum}%</p>
          <p>Pass Rate: {overview.overview.pass_rate}%</p>
          <Doughnut
            data={{
              labels: ["Pass", "Fail"],
              datasets: [
                {
                  data: [overview.overview.pass_rate, 100 - overview.overview.pass_rate],
                  backgroundColor: ["#22c55e", "#ef4444"],
                },
              ],
            }}
          />
          <h4>Top Students</h4>
          <ul>
            {overview.top_students.map((s: any) => (
              <li key={s.student_name}>{s.student_name}: {s.average}%</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
