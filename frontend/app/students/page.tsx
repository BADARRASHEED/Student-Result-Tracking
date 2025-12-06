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

      <div className="card table-card">
        <div className="table-toolbar">
          <div className="toolbar-left">
            <div>
              <p className="label">Roster</p>
              <h3 className="table-title">All students</h3>
              <p className="hero-subtitle">Organized list of every student with quick profile access.</p>
            </div>
            <div className="pill subtle">{filtered.length} students</div>
          </div>
          <div className="toolbar-filters">
            <div className="input-with-label">
              <label className="label">Search</label>
              <input
                className="input"
                placeholder="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="input-with-label">
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

        <div className="table-wrapper">
          <table className="table data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No.</th>
                <th>Class</th>
                <th style={{ textAlign: "right" }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="table-name">
                      <div className="avatar-circle">{s.name.substring(0, 1)}</div>
                      <div>
                        <div className="student-name">{s.name}</div>
                        <div className="muted small">ID: {s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.roll_number}</td>
                  <td>
                    <span className="pill subtle">{classes.find((c) => c.id === s.class_id)?.name || `Class ${s.class_id}`}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/students/${s.id}`} className="button inline ghost">
                      View profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
