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

# Browsers will reject credentialed requests when the server responds with
# `Access-Control-Allow-Origin: *`. That resulted in the frontend failing with a
# generic "Failed to fetch" error on pages like Marks Entry. Use a concrete set
# of allowed origins by default so local development works without extra envs.
default_origins = "http://localhost:3000,http://127.0.0.1:3000"
origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", default_origins).split(",") if origin.strip()]
allow_credentials = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"

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
