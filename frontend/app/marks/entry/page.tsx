"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, clearAuth } from "../../lib/api";

type Student = {
  id: number;
  name: string;
  roll_number: string;
  class_id?: number;
};

type Assessment = {
  id: number;
  name: string;
  term: string;
  maximum_marks: number;
  subject?: {
    name?: string;
  } | null;
};

const DEFAULT_STATUS = "Ready";

export default function MarksEntry() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [marks, setMarks] = useState<string>("");
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [loading, setLoading] = useState({ students: false, assessments: false });
  const [isSaving, setIsSaving] = useState(false);

  const resetSelections = useCallback((studentList: Student[], assessmentList: Assessment[]) => {
    setSelectedStudent((prev) => {
      if (prev && studentList.some((s) => String(s.id) === String(prev))) return prev;
      return studentList.length > 0 ? String(studentList[0].id) : "";
    });
    setSelectedAssessment((prev) => {
      if (prev && assessmentList.some((a) => String(a.id) === String(prev))) return prev;
      return assessmentList.length > 0 ? String(assessmentList[0].id) : "";
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoading({ students: true, assessments: true });
    setStatus("Syncing data...");
    try {
      const [studentData, assessmentData] = await Promise.all([
        apiFetch("/students/"),
        apiFetch("/assessments/"),
      ]);

      setStudents(studentData);
      setAssessments(assessmentData);
      resetSelections(studentData, assessmentData);

      if (!assessmentData.length) {
        setStatus("No assessments available. Run the seed script to generate demo data.");
      } else {
        setStatus("Data synced. Ready to save marks.");
      }
    } catch (err: any) {
      const detail = err?.message || "Unable to load marks entry data.";
      if (err?.status === 401) {
        clearAuth();
        setStatus("Session expired. Please sign in again.");
      } else {
        setStatus(`Failed to load data: ${detail}`);
      }
      setStudents([]);
      setAssessments([]);
      setSelectedStudent("");
      setSelectedAssessment("");
    } finally {
      setLoading({ students: false, assessments: false });
    }
  }, [resetSelections]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedAssessmentRecord = useMemo(
    () => assessments.find((a) => String(a.id) === selectedAssessment),
    [assessments, selectedAssessment],
  );

  const selectedStudentName = useMemo(
    () => students.find((s) => String(s.id) === selectedStudent)?.name,
    [students, selectedStudent],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving mark...");

    const numericMarks = Number(marks);
    if (Number.isNaN(numericMarks)) {
      setStatus("Please enter a valid number for marks obtained.");
      return;
    }

    if (selectedAssessmentRecord && numericMarks > selectedAssessmentRecord.maximum_marks) {
      setStatus(`Marks cannot exceed ${selectedAssessmentRecord.maximum_marks}.`);
      return;
    }

    setIsSaving(true);
    try {
      await apiFetch("/marks/", {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(selectedStudent),
          assessment_id: Number(selectedAssessment),
          marks_obtained: numericMarks,
        }),
      });
      const subjectName = selectedAssessmentRecord?.subject?.name
        ? `${selectedAssessmentRecord.subject.name} `
        : "";
      setStatus(`Mark saved for ${subjectName}${selectedAssessmentRecord?.name || "assessment"} (${selectedStudentName}).`);
      setMarks("");
    } catch (err: any) {
      if (err?.status === 401) {
        clearAuth();
        setStatus("Session expired. Please sign in again.");
      } else {
        setStatus(err?.message || "Unable to save mark. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const disableActions =
    loading.students || loading.assessments || !selectedStudent || !selectedAssessment || isSaving;

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
            <div className={`pill ${status !== DEFAULT_STATUS ? "pill-strong" : ""}`} aria-live="polite">
              {status}
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

        <form onSubmit={handleSubmit} className="form-card">
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
            <button
              className="button secondary"
              type="button"
              onClick={loadData}
              disabled={loading.students || loading.assessments}
            >
              Reload data
            </button>
            <button className="button" type="submit" disabled={disableActions}>
              {isSaving ? "Saving..." : "Save mark"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
