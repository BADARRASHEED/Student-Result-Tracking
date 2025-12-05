from fastapi.testclient import TestClient
from datetime import date

from backend.main import app
from backend.database import SessionLocal
from backend import models

client = TestClient(app)


def setup_module(module):
    db = SessionLocal()
    db.query(models.Mark).delete()
    db.query(models.Assessment).delete()
    db.query(models.Subject).delete()
    db.query(models.Student).delete()
    db.query(models.Class).delete()
    db.query(models.User).delete()
    db.commit()

    cls = models.Class(name="Report Class")
    db.add(cls)
    db.commit()
    student = models.Student(name="Report Student", roll_number="R1", class_id=cls.id)
    subject = models.Subject(name="Science", code="SCI", class_id=cls.id)
    db.add_all([student, subject])
    db.commit()
    assessment = models.Assessment(
        name="Term 1 Exam", type="Exam", maximum_marks=100, term="Term 1", subject_id=subject.id, date=date.today()
    )
    db.add(assessment)
    db.commit()
    mark = models.Mark(student_id=student.id, assessment_id=assessment.id, marks_obtained=85)
    db.add(mark)
    db.commit()
    db.close()


def test_report_pdf():
    resp = client.get("/reports/student/1", params={"term": "Term 1"})
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content[:4] == b"%PDF"
