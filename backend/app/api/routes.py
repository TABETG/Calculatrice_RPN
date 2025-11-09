"""
REST API routes for the RPN Calculator.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.api.schemas import (
    PushValueRequest,
    StackResponse,
    MessageResponse,
    ErrorResponse,
)
from app.services.stack_service import StackService, get_stack_service
from app.core.exceptions import (
    InsufficientOperandsError,
    DivisionByZeroError,
    InvalidOperationError,
    RPNCalculatorError,
)

router = APIRouter()

# ---------- Helpers ----------
def _stack_response(service: StackService) -> StackResponse:
    calc = service.calculator
    return StackResponse(stack=calc.stack, size=calc.size())

def _raise_400(exc: Exception):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

# ---------- Stack ----------
@router.post(
    "/stack",
    response_model=StackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Push a value onto the stack",
)
def push_value(
    request: PushValueRequest,
    service: StackService = Depends(get_stack_service),
) -> StackResponse:
    service.calculator.push(request.value)
    return _stack_response(service)

@router.get(
    "/stack",
    response_model=StackResponse,
    summary="Get the current stack",
)
def get_stack(
    service: StackService = Depends(get_stack_service),
) -> StackResponse:
    return _stack_response(service)

@router.delete(
    "/stack",
    response_model=MessageResponse,
    summary="Clear the stack",
)
def clear_stack(
    service: StackService = Depends(get_stack_service),
) -> MessageResponse:
    service.calculator.clear()
    return MessageResponse(message="Stack cleared successfully")

# ---------- Basic operations (+, -, *, /) ----------
@router.post("/op/add", response_model=StackResponse, summary="Addition (+)")
def op_add(service: StackService = Depends(get_stack_service)) -> StackResponse:
    try:
        service.calculator.add()
        return _stack_response(service)
    except InsufficientOperandsError as e:
        _raise_400(e)

@router.post("/op/sub", response_model=StackResponse, summary="Subtraction (-)")
def op_sub(service: StackService = Depends(get_stack_service)) -> StackResponse:
    try:
        service.calculator.subtract()
        return _stack_response(service)
    except InsufficientOperandsError as e:
        _raise_400(e)

@router.post("/op/mul", response_model=StackResponse, summary="Multiplication (*)")
def op_mul(service: StackService = Depends(get_stack_service)) -> StackResponse:
    try:
        service.calculator.multiply()
        return _stack_response(service)
    except InsufficientOperandsError as e:
        _raise_400(e)

@router.post("/op/div", response_model=StackResponse, summary="Division (/)")
def op_div(service: StackService = Depends(get_stack_service)) -> StackResponse:
    try:
        service.calculator.divide()
        return _stack_response(service)
    except (InsufficientOperandsError, DivisionByZeroError, RPNCalculatorError) as e:
        _raise_400(e)

# ---------- Advanced operations (sqrt, pow, power, swap, dup, drop) ----------
@router.post("/op/sqrt", response_model=StackResponse, summary="Square root (√)")
def op_sqrt(service: StackService = Depends(get_stack_service)) -> StackResponse:
    try:
        service.calculator.sqrt()
        return _stack_response(service)
    except (InsufficientOperandsError, InvalidOperationError) as e:
        _raise_400(e)

@router.post("/op/pow", response_model=StackResponse, summary="Power (x^y)")
@router.post("/op/power", response_model=StackResponse, summary="Power (x^y) [alias]")
def op_power(service: StackService = Depends(get_stack_service)) -> StackResponse:
    try:
        service.calculator.power()
        return _stack_response(service)
    except (InsufficientOperandsError, InvalidOperationError) as e:
        _raise_400(e)

@router.post("/op/swap", response_model=StackResponse, summary="Swap top 2")
def op_swap(service: StackService = Depends(get_stack_service)) -> StackResponse:
    try:
        service.calculator.swap()
        return _stack_response(service)
    except InsufficientOperandsError as e:
        _raise_400(e)

@router.post("/op/dup", response_model=StackResponse, summary="Duplicate top")
def op_dup(service: StackService = Depends(get_stack_service)) -> StackResponse:
    try:
        service.calculator.dup()
        return _stack_response(service)
    except InsufficientOperandsError as e:
        _raise_400(e)

@router.post("/op/drop", response_model=StackResponse, summary="Drop top")
def op_drop(service: StackService = Depends(get_stack_service)) -> StackResponse:
    try:
        service.calculator.drop()
        return _stack_response(service)
    except RPNCalculatorError as e:
        _raise_400(e)
