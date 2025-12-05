"""Seed script to populate rich demo data into SQLite."""
from __future__ import annotations
import os
import pathlib
import sys
from datetime import date
from random import Random
from typing import List

if __package__ in (None, ""):
    sys.path.append(str(pathlib.Path(__file__).resolve().parent.parent))
    __package__ = "backend"

from .database import Base, SessionLocal, engine
from . import models
from .auth import get_password_hash


DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@gmail.com")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
DEFAULT_ADMIN_NAME = os.getenv("DEFAULT_ADMIN_NAME", "Admin User")


# Ensure tables exist before attempting to seed
Base.metadata.create_all(bind=engine)


def _create_users(db) -> models.User:
    admin_user = models.User(
        name=DEFAULT_ADMIN_NAME,
        email=DEFAULT_ADMIN_EMAIL,
        hashed_password=get_password_hash(DEFAULT_ADMIN_PASSWORD),
        role="ADMIN",
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user


def ensure_default_admin(db):
    """Create or refresh the default admin account for quick logins."""
    default_admin = db.query(models.User).filter(models.User.email == DEFAULT_ADMIN_EMAIL).first()
    hashed_password = get_password_hash(DEFAULT_ADMIN_PASSWORD)

    if default_admin:
        default_admin.role = "ADMIN"
        default_admin.name = default_admin.name or DEFAULT_ADMIN_NAME
        default_admin.hashed_password = hashed_password
        db.commit()
        db.refresh(default_admin)
        return default_admin

    admin_user = models.User(
        name=DEFAULT_ADMIN_NAME,
        email=DEFAULT_ADMIN_EMAIL,
        hashed_password=hashed_password,
        role="ADMIN",
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user


def _create_classes(db, admin_user: models.User):
    class_records = [
        {"name": "Grade 8 - A"},
        {"name": "Grade 9 - B"},
        {"name": "Grade 10 - A"},
    ]
    classes: List[models.Class] = []
    for record in class_records:
        cls = models.Class(name=record["name"], teacher_id=admin_user.id)
        db.add(cls)
        classes.append(cls)
    db.commit()
    return classes


def _create_students(db, classes: List[models.Class]):
    students_data = [
        {"name": "Amelia Green", "roll": "8A-001", "class": classes[0]},
        {"name": "Benjamin Ross", "roll": "8A-002", "class": classes[0]},
        {"name": "Chloe Martin", "roll": "8A-003", "class": classes[0]},
        {"name": "Daniel Carter", "roll": "8A-004", "class": classes[0]},
        {"name": "Ella Johnson", "roll": "8A-005", "class": classes[0]},
        {"name": "Felix Grant", "roll": "9B-001", "class": classes[1]},
        {"name": "Grace Lee", "roll": "9B-002", "class": classes[1]},
        {"name": "Hannah Moore", "roll": "9B-003", "class": classes[1]},
        {"name": "Ian Clarke", "roll": "9B-004", "class": classes[1]},
        {"name": "Jasmine Patel", "roll": "9B-005", "class": classes[1]},
        {"name": "Kai Anderson", "roll": "10A-001", "class": classes[2]},
        {"name": "Luna Davis", "roll": "10A-002", "class": classes[2]},
        {"name": "Mason Brown", "roll": "10A-003", "class": classes[2]},
        {"name": "Nora Williams", "roll": "10A-004", "class": classes[2]},
        {"name": "Owen Parker", "roll": "10A-005", "class": classes[2]},
    ]

    students: List[models.Student] = []
    for record in students_data:
        student = models.Student(
            name=record["name"],
            roll_number=record["roll"],
            class_id=record["class"].id,
            extra_info="Mapped user: {}".format(record["name"]),
        )
        db.add(student)
        students.append(student)
    db.commit()
    return students


def _create_subjects(db, classes: List[models.Class]):
    subjects_config = {
        classes[0].id: [
            ("Mathematics", "MATH8"),
            ("English", "ENG8"),
            ("Science", "SCI8"),
            ("History", "HIST8"),
        ],
        classes[1].id: [
            ("Mathematics", "MATH9"),
            ("English", "ENG9"),
            ("Biology", "BIO9"),
            ("Computer Science", "CS9"),
        ],
        classes[2].id: [
            ("Advanced Mathematics", "MATH10"),
            ("Physics", "PHY10"),
            ("Chemistry", "CHEM10"),
            ("Computer Science", "CS10"),
        ],
    }

    subjects: List[models.Subject] = []
    for class_id, subject_list in subjects_config.items():
        for name, code in subject_list:
            subject = models.Subject(name=name, code=code, class_id=class_id)
            db.add(subject)
            subjects.append(subject)
    db.commit()
    return subjects


def _create_assessments(db, subjects: List[models.Subject]):
    randomizer = Random(42)
    assessments: List[models.Assessment] = []
    template = [
        {"name": "Quiz 1", "type": "Quiz", "maximum_marks": 25, "term": "Term 1", "month": 2, "day": 15},
        {"name": "Midterm", "type": "Exam", "maximum_marks": 100, "term": "Term 1", "month": 3, "day": 18},
        {"name": "Project", "type": "Project", "maximum_marks": 50, "term": "Term 2", "month": 6, "day": 5},
        {"name": "Final Exam", "type": "Exam", "maximum_marks": 100, "term": "Term 2", "month": 10, "day": 20},
    ]

    for subject in subjects:
        for idx, tmpl in enumerate(template):
            assessment = models.Assessment(
                name=f"{subject.name} {tmpl['name']}",
                type=tmpl["type"],
                maximum_marks=tmpl["maximum_marks"],
                term=tmpl["term"],
                subject_id=subject.id,
                date=date(2024, tmpl["month"], tmpl["day"] + randomizer.randint(0, 3) + idx),
            )
            db.add(assessment)
            assessments.append(assessment)
    db.commit()
    return assessments


def _create_marks(db, students: List[models.Student], assessments: List[models.Assessment]):
    rng = Random(99)
    assessments_by_subject: Dict[int, List[models.Assessment]] = {}
    for assessment in assessments:
        assessments_by_subject.setdefault(assessment.subject_id, []).append(assessment)

    marks: List[models.Mark] = []
    for student in students:
        # Determine subjects for the student's class
        class_subjects = [s for s in db.query(models.Subject).filter(models.Subject.class_id == student.class_id).all()]
        for subject in class_subjects:
            for assessment in assessments_by_subject.get(subject.id, []):
                base_pct = rng.randint(55, 95) if student.roll_number.endswith("1") else rng.randint(45, 90)
                adjustment = rng.randint(-8, 8)
                pct_score = max(25, min(98, base_pct + adjustment))
                score = round((pct_score / 100) * assessment.maximum_marks, 1)
                mark = models.Mark(student_id=student.id, assessment_id=assessment.id, marks_obtained=score)
                db.add(mark)
                marks.append(mark)
    db.commit()
    return marks


def seed(reset: bool = False):
    """Populate the SQLite database with rich demo data.

    Args:
        reset: If True, drops existing tables and recreates them before inserting demo data.
    """

    if reset:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if not reset and db.query(models.User).count() > 0:
            ensure_default_admin(db)
            return

        # Clean existing rows when not doing a full drop to avoid duplicates
        if not reset:
            db.query(models.Mark).delete()
            db.query(models.Assessment).delete()
            db.query(models.Subject).delete()
            db.query(models.Student).delete()
            db.query(models.Class).delete()
            db.query(models.User).delete()
            db.commit()

        admin_user = _create_users(db)
        classes = _create_classes(db, admin_user)
        students = _create_students(db, classes)
        subjects = _create_subjects(db, classes)
        assessments = _create_assessments(db, subjects)
        _create_marks(db, students, assessments)
        ensure_default_admin(db)
    finally:
        db.close()


def ensure_seed_data():
    """Ensure demo data exists without wiping existing environments."""
    seed(reset=False)


if __name__ == "__main__":
    seed(reset=True)
    print("Demo database seeded with sample data.")
