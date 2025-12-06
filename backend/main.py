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
from .seed_data import ensure_seed_data
from .routers import auth, students, classes, subjects, assessments, marks, analytics, reports

Base.metadata.create_all(bind=engine)
ensure_seed_data()

app = FastAPI(title="Student Result Tracking & Analytics")

default_origins = "*"  # open by default to keep the hosted demo usable
cors_origins = os.getenv("CORS_ORIGINS", default_origins)

# Because wildcard origins cannot be combined with credentialed requests, fall
# back to non-credentialed CORS when "*" is present. When explicit origins are
# set, keep credentials enabled so browsers accept Authorization headers without
# blocking.
origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
allow_credentials = "*" not in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
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
