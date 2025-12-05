import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, students, classes, subjects, assessments, marks, analytics, reports

Base.metadata.create_all(bind=engine)

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
