"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function MarksEntry() {
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [marks, setMarks] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState({ students: true, assessments: true });

  useEffect(() => {
    const load = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setMessage("Please sign in as the admin to load students and assessments.");
        setLoading({ students: false, assessments: false });
        return;
      }
      try {
        const [studentsResponse, assessmentsResponse] = await Promise.all([
          apiFetch("/students/"),
          apiFetch("/assessments/"),
        ]);
        setStudents(studentsResponse);
        setAssessments(assessmentsResponse);
        if (studentsResponse.length > 0) setSelectedStudent(String(studentsResponse[0].id));
        if (assessmentsResponse.length > 0) setSelectedAssessment(String(assessmentsResponse[0].id));
        if (assessmentsResponse.length === 0) {
          setMessage("No assessments available. Run the seed script to generate demo data.");
        } else {
          setMessage("Data synced. Ready to save marks.");
        }
      } catch (err: any) {
        setStudents([]);
        setAssessments([]);
        setMessage(err.message || "Failed to load marks entry data.");
      } finally {
        setLoading({ students: false, assessments: false });
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
        body: JSON.stringify({
          student_id: Number(selectedStudent),
          assessment_id: Number(selectedAssessment),
          marks_obtained: Number(marks),
        }),
      });
      setMessage("Mark saved and synced.");
      setMarks("");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="page-narrow">
      <div className="card simple-card">
        <div className="section-header">
          <div>
            <p className="tag">Marks Entry</p>
            <h1 className="compact-title">Update marks</h1>
            <p className="muted">Load a student and assessment, enter marks, and save.</p>
          </div>
          <div className="status-box">
            <div className="label">Status</div>
            <div className={`pill ${message ? "pill-strong" : ""}`} aria-live="polite">
              {message || "Ready"}
            </div>
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat-chip">
            <div className="stat-label">Students</div>
            <div className="stat-value">{loading.students ? "Loading" : students.length || "0"}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-label">Assessments</div>
            <div className="stat-value">{loading.assessments ? "Loading" : assessments.length || "0"}</div>
          </div>
        </div>

        <form onSubmit={submit} className="form-card">
          <div className="form-grid">
            <div className="input-row">
              <label className="label">Student</label>
              <select
                className="input"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
                disabled={loading.students}
              >
                <option value="" disabled>
                  {loading.students ? "Loading students..." : "Select student"}
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Roll {s.roll_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-row">
              <label className="label">Assessment</label>
              <select
                className="input"
                value={selectedAssessment}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                required
                disabled={loading.assessments}
              >
                <option value="" disabled>
                  {loading.assessments ? "Loading assessments..." : "Select assessment"}
                </option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} - {a.term} (Max {a.maximum_marks})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-row">
              <label className="label">Marks Obtained</label>
              <input
                className="input"
                type="number"
                min={0}
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="Enter marks"
                required
              />
            </div>
          </div>

          <div className="form-actions simple-actions">
            <button className="button secondary" type="button" onClick={() => window.location.reload()}>
              Reload data
            </button>
            <button className="button" type="submit" disabled={!selectedStudent || !selectedAssessment || marks === ""}>
              Save mark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
