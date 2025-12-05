from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import TeacherOnly
from ..database import get_db

router = APIRouter(prefix="/marks", tags=["Marks"])


@router.get("/", response_model=List[schemas.MarkOut])
def list_marks(db: Session = Depends(get_db)):
    return db.query(models.Mark).all()


@router.post("/", response_model=schemas.MarkOut, dependencies=[Depends(TeacherOnly)])
def create_mark(payload: schemas.MarkCreate, db: Session = Depends(get_db)):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == payload.assessment_id).first()
    student = db.query(models.Student).filter(models.Student.id == payload.student_id).first()
    if not assessment or not student:
        raise HTTPException(status_code=400, detail="Invalid student or assessment")
    mark = models.Mark(**payload.dict())
    db.add(mark)
    db.commit()
    db.refresh(mark)
    return mark


@router.put("/{mark_id}", response_model=schemas.MarkOut, dependencies=[Depends(TeacherOnly)])
def update_mark(mark_id: int, payload: schemas.MarkCreate, db: Session = Depends(get_db)):
    mark = db.query(models.Mark).filter(models.Mark.id == mark_id).first()
    if not mark:
        raise HTTPException(status_code=404, detail="Mark not found")
    for key, value in payload.dict().items():
        setattr(mark, key, value)
    db.commit()
    db.refresh(mark)
    return mark


@router.delete("/{mark_id}", dependencies=[Depends(TeacherOnly)])
def delete_mark(mark_id: int, db: Session = Depends(get_db)):
    mark = db.query(models.Mark).filter(models.Mark.id == mark_id).first()
    if not mark:
        raise HTTPException(status_code=404, detail="Mark not found")
    db.delete(mark)
    db.commit()
    return {"detail": "Deleted"}
