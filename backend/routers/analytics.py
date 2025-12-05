from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..services import analytics as analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/student/{student_id}/trend", response_model=schemas.StudentTrendResponse)
def student_trend(student_id: int, db: Session = Depends(get_db)):
    result = analytics_service.student_trend(db, student_id)
    if not result:
        raise HTTPException(status_code=404, detail="Student not found")
    return result


@router.get("/class/{class_id}/subjects-summary")
def subject_summary(class_id: int, db: Session = Depends(get_db)):
    return analytics_service.class_subject_summary(db, class_id)


@router.get("/class/{class_id}/overview", response_model=schemas.ClassOverviewResponse)
def class_overview(class_id: int, db: Session = Depends(get_db)):
    result = analytics_service.class_overview(db, class_id)
    if not result:
        raise HTTPException(status_code=404, detail="Class not found")
    return result
