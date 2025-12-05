from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import TeacherOnly
from ..database import get_db

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.get("/", response_model=List[schemas.SubjectOut])
def list_subjects(db: Session = Depends(get_db)):
    return db.query(models.Subject).all()


@router.post("/", response_model=schemas.SubjectOut, dependencies=[Depends(TeacherOnly)])
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    db_subject = models.Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject


@router.put("/{subject_id}", response_model=schemas.SubjectOut, dependencies=[Depends(TeacherOnly)])
def update_subject(subject_id: int, payload: schemas.SubjectCreate, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    for key, value in payload.dict().items():
        setattr(subject, key, value)
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/{subject_id}", dependencies=[Depends(TeacherOnly)])
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"detail": "Deleted"}
