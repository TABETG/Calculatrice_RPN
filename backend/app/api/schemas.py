"""
Pydantic models for request/response validation and OpenAPI documentation.
"""
from typing import List
from pydantic import BaseModel, Field

class PushValueRequest(BaseModel):
    value: float = Field(..., description="Numeric value to push onto the stack")

class StackResponse(BaseModel):
    stack: List[float]
    size: int

class OperationResponse(BaseModel):
    result: float
    stack: List[float]

class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str
