from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import TeacherOnly
from ..database import get_db

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.get("/", response_model=List[schemas.AssessmentOut])
def list_assessments(db: Session = Depends(get_db)):
    return db.query(models.Assessment).all()


@router.post("/", response_model=schemas.AssessmentOut, dependencies=[Depends(TeacherOnly)])
def create_assessment(payload: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    assessment = models.Assessment(**payload.dict())
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.put("/{assessment_id}", response_model=schemas.AssessmentOut, dependencies=[Depends(TeacherOnly)])
def update_assessment(assessment_id: int, payload: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    for key, value in payload.dict().items():
        setattr(assessment, key, value)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.delete("/{assessment_id}", dependencies=[Depends(TeacherOnly)])
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(models.Assessment).filter(models.Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(assessment)
    db.commit()
    return {"detail": "Deleted"}
