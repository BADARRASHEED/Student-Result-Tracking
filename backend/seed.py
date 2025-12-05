"""Seed script to populate demo data into SQLite."""
from datetime import date
from sqlalchemy.orm import Session

from .database import Base, engine, SessionLocal
from . import models
from .auth import get_password_hash


Base.metadata.create_all(bind=engine)


def seed():
    db: Session = SessionLocal()
    db.query(models.Mark).delete()
    db.query(models.Assessment).delete()
    db.query(models.Subject).delete()
    db.query(models.Student).delete()
    db.query(models.Class).delete()
    db.query(models.User).delete()
    db.commit()

    admin = models.User(name="Admin User", email="admin@example.com", hashed_password=get_password_hash("admin123"), role="ADMIN")
    teacher = models.User(name="Alice Teacher", email="teacher@example.com", hashed_password=get_password_hash("teach123"), role="TEACHER")
    teacher2 = models.User(name="Bob Teacher", email="teacher2@example.com", hashed_password=get_password_hash("teach123"), role="TEACHER")
    db.add_all([admin, teacher, teacher2])
    db.commit()

    class_a = models.Class(name="Grade 8 - A", teacher_id=teacher.id)
    class_b = models.Class(name="Grade 9 - B", teacher_id=teacher2.id)
    db.add_all([class_a, class_b])
    db.commit()

    students = [
        models.Student(name="John Doe", roll_number="8A001", class_id=class_a.id),
        models.Student(name="Jane Smith", roll_number="8A002", class_id=class_a.id),
        models.Student(name="Sam Lee", roll_number="9B001", class_id=class_b.id),
    ]
    db.add_all(students)
    db.commit()

    subjects = [
        models.Subject(name="Mathematics", code="MATH", class_id=class_a.id),
        models.Subject(name="Science", code="SCI", class_id=class_a.id),
        models.Subject(name="Mathematics", code="MATH9", class_id=class_b.id),
    ]
    db.add_all(subjects)
    db.commit()

    assessments = [
        models.Assessment(name="Mid Term", type="Exam", maximum_marks=100, term="Term 1", subject_id=subjects[0].id, date=date(2024, 3, 1)),
        models.Assessment(name="Project", type="Project", maximum_marks=50, term="Term 1", subject_id=subjects[1].id, date=date(2024, 3, 15)),
        models.Assessment(name="Final Exam", type="Exam", maximum_marks=100, term="Term 2", subject_id=subjects[0].id, date=date(2024, 6, 20)),
        models.Assessment(name="Mid Term", type="Exam", maximum_marks=100, term="Term 1", subject_id=subjects[2].id, date=date(2024, 3, 1)),
    ]
    db.add_all(assessments)
    db.commit()

    marks = [
        models.Mark(student_id=students[0].id, assessment_id=assessments[0].id, marks_obtained=82),
        models.Mark(student_id=students[1].id, assessment_id=assessments[0].id, marks_obtained=76),
        models.Mark(student_id=students[0].id, assessment_id=assessments[1].id, marks_obtained=40),
        models.Mark(student_id=students[1].id, assessment_id=assessments[1].id, marks_obtained=35),
        models.Mark(student_id=students[0].id, assessment_id=assessments[2].id, marks_obtained=88),
        models.Mark(student_id=students[2].id, assessment_id=assessments[3].id, marks_obtained=90),
    ]
    db.add_all(marks)
    db.commit()
    db.close()
    print("Seed data inserted")


if __name__ == "__main__":
    seed()
