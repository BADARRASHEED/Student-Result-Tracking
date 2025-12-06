from datetime import date as date_type, datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ClassBase(BaseModel):
    name: str
    teacher_id: Optional[int] = None


class ClassCreate(ClassBase):
    pass


class ClassOut(ClassBase):
    id: int

    class Config:
        orm_mode = True


class StudentBase(BaseModel):
    name: str
    roll_number: str
    class_id: int
    extra_info: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    roll_number: Optional[str] = None
    class_id: Optional[int] = None
    extra_info: Optional[str] = None


class StudentOut(StudentBase):
    id: int

    class Config:
        orm_mode = True


class SubjectBase(BaseModel):
    name: str
    code: str
    class_id: Optional[int] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectOut(SubjectBase):
    id: int

    class Config:
        orm_mode = True


class AssessmentBase(BaseModel):
    name: str
    type: str
    maximum_marks: int
    term: str
    subject_id: int
    # Use an explicit alias for the ``date`` type to avoid the field annotation
    # being interpreted as ``NoneType`` during class creation, which caused
    # Pydantic to expect ``None`` and reject actual ``date`` values returned
    # from the database.
    date: Optional[date_type] = None


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentOut(AssessmentBase):
    id: int

    class Config:
        orm_mode = True


class MarkBase(BaseModel):
    student_id: int
    assessment_id: int
    marks_obtained: float


class MarkCreate(MarkBase):
    pass


class MarkOut(MarkBase):
    id: int

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Optional[str] = None
    name: Optional[str] = None


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# Analytics schemas
class StudentTrendPoint(BaseModel):
    assessment: str
    percentage: float
    term: str


class StudentTrendResponse(BaseModel):
    student_id: int
    student_name: str
    trend: List[StudentTrendPoint]


class SubjectSummary(BaseModel):
    subject: str
    average: float


class ClassOverview(BaseModel):
    class_name: str
    average: float
    minimum: float
    maximum: float
    pass_rate: float


class TopStudent(BaseModel):
    student_name: str
    average: float


class ClassOverviewResponse(BaseModel):
    overview: ClassOverview
    top_students: List[TopStudent]


class DashboardSummary(BaseModel):
    total_students: int
    total_classes: int
    total_subjects: int
    total_assessments: int
    average_score: float
    pass_rate: float
    recent_assessments: List[str]


class StudentMarkDetail(BaseModel):
    assessment: str
    subject: str
    term: str
    maximum: float
    score: float
    percentage: float


class StudentProfileResponse(BaseModel):
    id: int
    name: str
    roll_number: str
    class_id: int
    class_name: Optional[str] = None
    marks: List[StudentMarkDetail]
