"use client";
import { useEffect, useState } from "react";
import { apiFetch, getRole } from "../lib/api";

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>({});
  const [error, setError] = useState("");

  useEffect(() => {
    setRole(getRole());
    const fetchCounts = async () => {
      try {
        const students = await apiFetch("/students/");
        const classes = await apiFetch("/classes/");
        const subjects = await apiFetch("/subjects/");
        setSummary({ students: students.length, classes: classes.length, subjects: subjects.length });
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="card">
        <h3>Welcome {role}</h3>
        {role === "ADMIN" && <p>Manage users, classes, subjects and monitor system metrics.</p>}
        {role === "TEACHER" && <p>Enter marks, view analytics, and generate reports for your class.</p>}
        {role === "STUDENT" && <p>Track your progress and download your report card.</p>}
      </div>
      <div className="card">
        <h3>System Overview</h3>
        <p>Students: {summary.students || 0}</p>
        <p>Classes: {summary.classes || 0}</p>
        <p>Subjects: {summary.subjects || 0}</p>
      </div>
    </div>
  );
}
