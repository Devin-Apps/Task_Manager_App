from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import RoleEnum, StatusEnum

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum = RoleEnum.member

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: str
    status: StatusEnum = StatusEnum.todo
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    assigned_to: Optional[int] = None

class TaskUpdate(BaseModel):
    status: Optional[StatusEnum] = None
    assigned_to: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: int
    project_id: int
    assigned_to: Optional[int]
    assignee: Optional[UserResponse] = None
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: str

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    owner: UserResponse
    tasks: List[TaskResponse] = []
    members: List[UserResponse] = []
    class Config:
        from_attributes = True

class ProjectMemberAdd(BaseModel):
    user_id: int

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

