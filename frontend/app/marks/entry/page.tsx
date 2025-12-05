"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function MarksEntry() {
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [marks, setMarks] = useState<number>(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setStudents(await apiFetch("/students/"));
        setAssessments(await apiFetch("/assessments/"));
      } catch (err: any) {
        setMessage(err.message);
      }
    };
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      await apiFetch("/marks/", {
        method: "POST",
        body: JSON.stringify({ student_id: Number(selectedStudent), assessment_id: Number(selectedAssessment), marks_obtained: marks }),
      });
      setMessage("Mark saved");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1>Marks Entry</h1>
      <form onSubmit={submit} className="card">
        <label>Student</label>
        <select className="input" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <label>Assessment</label>
        <select className="input" value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)} required>
          <option value="">Select assessment</option>
          {assessments.map((a) => (
            <option key={a.id} value={a.id}>{a.name} - {a.term}</option>
          ))}
        </select>
        <label>Marks Obtained</label>
        <input className="input" type="number" value={marks} onChange={(e) => setMarks(Number(e.target.value))} required />
        <button className="button" type="submit">Save</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
