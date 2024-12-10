from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ShopDto(BaseModel):
    name: str
    image: str
    grid_x: int
    grid_y: int
    grid_z: int

    class Config:
        orm_mode = True


class BuildingDto(BaseModel):
    name: str
    coordinate_x: float
    coordinate_y: float
    created: datetime = Field(default_factory=datetime.now)
    shops: List[ShopDto] = Field(default_factory=list)

    class Config:
        orm_mode = True


class Response(BaseModel):
    response: str
    viewModel: object
    status: bool