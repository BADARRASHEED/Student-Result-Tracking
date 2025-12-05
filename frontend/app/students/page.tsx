"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const [studentData, classData] = await Promise.all([apiFetch("/students/"), apiFetch("/classes/")]);
        setStudents(studentData);
        setClasses(classData);
      } catch (err: any) {
        setError(err.message);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesName = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter ? s.class_id === Number(classFilter) : true;
      return matchesName && matchesClass;
    });
  }, [students, search, classFilter]);

  return (
    <div>
      <div className="section-header">
        <div className="hero">
          <p className="tag">Students</p>
          <h1 className="hero-title">Student Directory</h1>
          <p className="hero-subtitle">Search by name or class to browse the 15 demo students.</p>
        </div>
      </div>
      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      <div className="card">
        <div className="grid grid-2">
          <div>
            <label className="label">Search</label>
            <input className="input" placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="label">Filter by Class</label>
            <select className="input" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-grid">
        {filtered.map((s) => (
          <div key={s.id} className="card">
            <div className="section-header">
              <div>
                <h3 style={{ margin: 0 }}>{s.name}</h3>
                <p className="hero-subtitle">Roll: {s.roll_number}</p>
              </div>
              <span className="pill">{classes.find((c) => c.id === s.class_id)?.name || `Class ${s.class_id}`}</span>
            </div>
            <Link href={`/students/${s.id}`} className="button inline">
              View profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
