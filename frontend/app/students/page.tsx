"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/students/");
        setStudents(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1>Students</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {students.map((s) => (
        <div key={s.id} className="card">
          <h3>
            <Link href={`/students/${s.id}`}>{s.name}</Link>
          </h3>
          <p>Roll: {s.roll_number} | Class ID: {s.class_id}</p>
        </div>
      ))}
    </div>
  );
}
