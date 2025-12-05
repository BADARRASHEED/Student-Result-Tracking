from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..auth import AdminOnly, TeacherOnly, get_current_user
from ..database import get_db
from ..services.analytics import calculate_percentage

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/", response_model=List[schemas.StudentOut])
def list_students(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Student).all()


@router.post("/", response_model=schemas.StudentOut, dependencies=[Depends(TeacherOnly)])
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = models.Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@router.get("/{student_id}", response_model=schemas.StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("/{student_id}/profile", response_model=schemas.StudentProfileResponse)
def get_student_profile(student_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    marks = []
    for mark in student.marks:
        percentage = calculate_percentage(mark.marks_obtained, mark.assessment.maximum_marks)
        marks.append(
            {
                "assessment": mark.assessment.name,
                "subject": mark.assessment.subject.name if mark.assessment.subject else "",
                "term": mark.assessment.term,
                "maximum": mark.assessment.maximum_marks,
                "score": mark.marks_obtained,
                "percentage": percentage,
            }
        )

    return {
        "id": student.id,
        "name": student.name,
        "roll_number": student.roll_number,
        "class_id": student.class_id,
        "class_name": student.class_obj.name if student.class_obj else None,
        "marks": marks,
    }


@router.put("/{student_id}", response_model=schemas.StudentOut, dependencies=[Depends(TeacherOnly)])
def update_student(student_id: int, payload: schemas.StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", dependencies=[Depends(AdminOnly)])
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"detail": "Deleted"}
