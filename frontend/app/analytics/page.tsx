"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function AnalyticsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [studentTrend, setStudentTrend] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/classes/")
      .then((data) => {
        setClasses(data);
        if (data[0]) setSelectedClass(String(data[0].id));
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!selectedClass) return;
      try {
        const subj = await apiFetch(`/analytics/class/${selectedClass}/subjects-summary`);
        setSubjectData(subj);
        const overviewResp = await apiFetch(`/analytics/class/${selectedClass}/overview`);
        setOverview(overviewResp);
        const gradeResp = await apiFetch(`/analytics/class/${selectedClass}/grades`);
        setGrades(gradeResp);
        // pull a sample student trend from the first student in the class
        const students = await apiFetch(`/students/`);
        const classStudents = students.filter((s: any) => s.class_id === Number(selectedClass));
        if (classStudents[0]) {
          const trend = await apiFetch(`/analytics/student/${classStudents[0].id}/trend`);
          setStudentTrend({ ...trend, studentName: classStudents[0].name });
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    load();
  }, [selectedClass]);

  return (
    <div>
      <div className="section-header">
        <div className="hero">
          <p className="tag">Analytics</p>
          <h1 className="hero-title">Insightful performance visuals</h1>
          <p className="hero-subtitle">Live demo data powers charts for classes, subjects, and students.</p>
        </div>
      </div>
      {error && <p style={{ color: "#f87171" }}>{error}</p>}
      <div className="card">
        <label className="label">Select Class</label>
        <select className="input" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">Choose</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-2">
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
                <li key={s.student_name}>
                  {s.student_name}: {s.average}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-2">
        {grades.length > 0 && (
          <div className="card">
            <h3>Grade Distribution</h3>
            <Doughnut
              data={{
                labels: grades.map((g) => g.grade),
                datasets: [
                  {
                    label: "Students",
                    data: grades.map((g) => g.count),
                    backgroundColor: ["#60a5fa", "#22c55e", "#fbbf24", "#f97316", "#ef4444"],
                  },
                ],
              }}
              options={{ plugins: { legend: { position: "bottom" } } }}
            />
          </div>
        )}

        {studentTrend && (
          <div className="card">
            <h3>Trend for {studentTrend.studentName}</h3>
            <Line
              data={{
                labels: studentTrend.trend.map((p: any) => p.assessment),
                datasets: [
                  {
                    label: "Percentage",
                    data: studentTrend.trend.map((p: any) => p.percentage),
                    borderColor: "#1d4ed8",
                    backgroundColor: "rgba(29, 78, 216, 0.25)",
                  },
                ],
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
