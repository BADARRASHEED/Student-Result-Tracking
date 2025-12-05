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
  const [student, setStudent] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const s = await apiFetch(`/students/${id}`);
        setStudent(s);
        const t = await apiFetch(`/analytics/student/${id}/trend`);
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
      <h1>Student Detail</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {student && (
        <div className="card">
          <h3>{student.name}</h3>
          <p>Roll Number: {student.roll_number}</p>
          <p>Class: {student.class_id}</p>
          <button className="button" onClick={downloadReport}>Download Report (Term 1)</button>
        </div>
      )}
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
                  borderColor: "#2563eb",
                },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
