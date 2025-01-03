from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class UserDb(BaseModel):
    userName: str
    password: str = Field(..., min_length=8, max_length=16, pattern="^[a-zA-Z0-9]*$")  # Alphanumeric 8-16
    attempt: Optional[int] = None  # FK #max 3
    userRole: int #student=0, OA=1, PC=2, AP=3, P=4
    firstTimer: Optional[bool] = None  # FK

    class Config:
        orm_mode = True

class evaluationDb(BaseModel):
    studentId: str  # FK, Non-nullable
    supervisorId: Optional[str] = None  # FK
    coSupervisorId: Optional[str] = None  # FK
    programType: Optional[str] = None
    evaluationType: Optional[str] = None
    semester: Optional[str] = None      
    postponeStatus: Optional[int] = None  # postpone=0, ongoing=1
    examinerId1: Optional[str] = None  # FK AP  P if S/C==P
    examinerId2: Optional[str] = None  # FK
    examinerId3: Optional[str] = None  # FK
    researchTitle: Optional[str] = None
    chairpersonId: Optional[str] = None  # FK AP  P if S/C==P, 4 session

    class Config:
        orm_mode = True

class supervisorDto(BaseModel):
    supervisorId: Optional[str] = None  # FK
    coSupervisorId: Optional[str] = None  # FK

class examinerDto(BaseModel):
    examinerId1: Optional[str] = None  # FK AP  P if S/C==P
    examinerId2: Optional[str] = None  # FK
    examinerId3: Optional[str] = None  # FK

class Response(BaseModel):
    response: str
    viewModel: object
    status: bool