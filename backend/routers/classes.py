from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import AdminOnly, TeacherOnly
from ..database import get_db

router = APIRouter(prefix="/classes", tags=["Classes"])


@router.get("/", response_model=List[schemas.ClassOut])
def list_classes(db: Session = Depends(get_db)):
    return db.query(models.Class).all()


@router.post("/", response_model=schemas.ClassOut, dependencies=[Depends(AdminOnly)])
def create_class(cls: schemas.ClassCreate, db: Session = Depends(get_db)):
    db_class = models.Class(**cls.dict())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


@router.put("/{class_id}", response_model=schemas.ClassOut, dependencies=[Depends(AdminOnly)])
def update_class(class_id: int, payload: schemas.ClassCreate, db: Session = Depends(get_db)):
    cls = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    for key, value in payload.dict().items():
        setattr(cls, key, value)
    db.commit()
    db.refresh(cls)
    return cls


@router.delete("/{class_id}", dependencies=[Depends(AdminOnly)])
def delete_class(class_id: int, db: Session = Depends(get_db)):
    cls = db.query(models.Class).filter(models.Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(cls)
    db.commit()
    return {"detail": "Deleted"}
