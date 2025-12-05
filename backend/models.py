from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, Float
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    classes = relationship("Class", back_populates="teacher")


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    teacher = relationship("User", back_populates="classes")
    students = relationship("Student", back_populates="class_obj", cascade="all, delete")
    subjects = relationship("Subject", back_populates="class_obj", cascade="all, delete")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    roll_number = Column(String, unique=True, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"))
    extra_info = Column(String, nullable=True)

    class_obj = relationship("Class", back_populates="students")
    marks = relationship("Mark", back_populates="student", cascade="all, delete")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)

    class_obj = relationship("Class", back_populates="subjects")
    assessments = relationship("Assessment", back_populates="subject", cascade="all, delete")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    maximum_marks = Column(Integer, nullable=False)
    term = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    date = Column(Date, nullable=True)

    subject = relationship("Subject", back_populates="assessments")
    marks = relationship("Mark", back_populates="assessment", cascade="all, delete")


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    marks_obtained = Column(Float, nullable=False)

    student = relationship("Student", back_populates="marks")
    assessment = relationship("Assessment", back_populates="marks")
