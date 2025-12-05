from typing import List
from sqlalchemy.orm import Session

from .. import models


def calculate_percentage(mark: float, maximum: float) -> float:
    return round((mark / maximum) * 100, 2) if maximum else 0.0


def grade_from_percentage(pct: float) -> str:
    if pct >= 85:
        return "A"
    if pct >= 70:
        return "B"
    if pct >= 55:
        return "C"
    if pct >= 40:
        return "D"
    return "E"


def student_trend(db: Session, student_id: int):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        return None
    trend = []
    for mark in student.marks:
        maximum = mark.assessment.maximum_marks
        percentage = calculate_percentage(mark.marks_obtained, maximum)
        trend.append({
            "assessment": mark.assessment.name,
            "percentage": percentage,
            "term": mark.assessment.term,
        })
    return {"student_id": student.id, "student_name": student.name, "trend": trend}


def class_subject_summary(db: Session, class_id: int):
    subjects = db.query(models.Subject).filter(models.Subject.class_id == class_id).all()
    results = []
    for subject in subjects:
        marks = [m for a in subject.assessments for m in a.marks]
        if marks:
            averages = [calculate_percentage(m.marks_obtained, m.assessment.maximum_marks) for m in marks]
            avg = round(sum(averages) / len(averages), 2)
            results.append({"subject": subject.name, "average": avg})
    return results


def class_overview(db: Session, class_id: int):
    students = db.query(models.Student).filter(models.Student.class_id == class_id).all()
    if not students:
        return None
    averages = []
    top_students: List[dict] = []
    for student in students:
        percentages = [
            calculate_percentage(mark.marks_obtained, mark.assessment.maximum_marks) for mark in student.marks
        ]
        avg = round(sum(percentages) / len(percentages), 2) if percentages else 0
        averages.append(avg)
        top_students.append({"student_name": student.name, "average": avg})
    average = round(sum(averages) / len(averages), 2) if averages else 0
    minimum = min(averages) if averages else 0
    maximum = max(averages) if averages else 0
    pass_rate = round(len([a for a in averages if a >= 40]) / len(averages) * 100, 2) if averages else 0
    top_students_sorted = sorted(top_students, key=lambda x: x["average"], reverse=True)[:5]
    return {
        "overview": {
            "class_name": students[0].class_obj.name,
            "average": average,
            "minimum": minimum,
            "maximum": maximum,
            "pass_rate": pass_rate,
        },
        "top_students": top_students_sorted,
    }
