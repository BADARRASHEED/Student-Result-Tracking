from datetime import date
from fastapi.testclient import TestClient

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

    cls = models.Class(name="Test Class")
    db.add(cls)
    db.commit()

    student = models.Student(name="Student One", roll_number="S1", class_id=cls.id)
    subject = models.Subject(name="Math", code="MATH", class_id=cls.id)
    db.add_all([student, subject])
    db.commit()

    assessment = models.Assessment(
        name="Quiz", type="Exam", maximum_marks=100, term="Term 1", subject_id=subject.id, date=date.today()
    )
    db.add(assessment)
    db.commit()
    mark = models.Mark(student_id=student.id, assessment_id=assessment.id, marks_obtained=80)
    db.add(mark)
    db.commit()
    db.close()


def test_student_trend():
    resp = client.get("/analytics/student/1/trend")
    assert resp.status_code == 200
    data = resp.json()
    assert data["student_id"] == 1
    assert len(data["trend"]) == 1


def test_class_overview():
    resp = client.get("/analytics/class/1/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert data["overview"]["average"] >= 0
