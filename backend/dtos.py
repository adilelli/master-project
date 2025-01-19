from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class UserDb(BaseModel):
    userName: str
    password: str = Field(..., min_length=8, max_length=16, pattern="^[a-zA-Z0-9]*$")  # Alphanumeric 8-16
    attempt: Optional[int] = 0  # FK #max 3
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
    postponeStatus: Optional[str] = "POSTPONED"  # postpone=0, ongoing=1
    examinerId1: Optional[str] = None  # FK AP  P if S/C==P
    examinerId2: Optional[str] = None  # FK
    examinerId3: Optional[str] = None  # FK
    researchTitle: Optional[str] = None
    chairpersonId: Optional[str] = None  # FK AP  P if S/C==P, 4 session
    lockStatus: Optional[bool] = False

    class Config:
        orm_mode = True

class evaluationDto(BaseModel):
    studentId: str  # FK, Non-nullable
    supervisorId: Optional[str] = None  # FK
    coSupervisorId: Optional[str] = None  # FK
    programType: Optional[str] = None
    evaluationType: Optional[str] = None
    semester: Optional[str] = None  
    researchTitle: Optional[str] = None   

# Function to map evaluationDto to evaluationDb
def map_evaluation(dto: evaluationDto) -> evaluationDb:
    # Convert dto to dict and pass it to evaluationDb
    return evaluationDb(**dto.model_dump()) 

class supervisorDto(BaseModel):
    supervisorId: Optional[str] = None  # FK
    coSupervisorId: Optional[str] = None  # FK

class examinerDto(BaseModel):
    examinerId1: Optional[str] = None  # FK AP  P if S/C==P
    examinerId2: Optional[str] = None  # FK
    examinerId3: Optional[str] = None  # FK
    postponeStatus: Optional[str] = "ONGOING"

class chairpersonDto(BaseModel):
    semester: str      
    chairpersonId: str  # FK AP  P if S/C==P, 4 session
    lockStatus: Optional[bool] = False

class ResponseDto(BaseModel):
    response: str
    viewModel: object
    status: bool

class UserDto(BaseModel):
    userName: str
    password: Optional[str] = Field(None, min_length=8, max_length=16, pattern="^[a-zA-Z0-9]*$")  # Alphanumeric 8-16
    userRole: Optional[int] = None  # student=0, OA=1, PC=2, AP=3, P=4


# Define the user roles with Enum for better readability
class UserRole(Enum):
    student = 0
    OA = 1
    PC = 2
    AP = 3
    P = 4

class TokenDto(BaseModel):
    access_token: str
    token_type: str

class LoginDto(BaseModel):
    userName: str
    password: str