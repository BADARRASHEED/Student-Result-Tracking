import os
import pathlib
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# When executed directly (e.g., `uvicorn main:app --reload` from the backend folder),
# `__package__` is empty and relative imports fail. Ensure the backend package can be
# resolved before importing internal modules.
if __package__ in (None, ""):
    sys.path.append(str(pathlib.Path(__file__).resolve().parent.parent))
    __package__ = "backend"

from .database import Base, engine
from .seed import ensure_seed_data
from .routers import auth, students, classes, subjects, assessments, marks, analytics, reports

Base.metadata.create_all(bind=engine)
ensure_seed_data()

app = FastAPI(title="Student Result Tracking & Analytics")

origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(classes.router)
app.include_router(subjects.router)
app.include_router(assessments.router)
app.include_router(marks.router)
app.include_router(analytics.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"message": "Student Result Tracking API"}
