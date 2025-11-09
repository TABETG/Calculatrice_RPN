"""
RPN Calculator domain logic - Pure Python, framework-agnostic.
"""
import math
from typing import List, Optional
from app.core.exceptions import (
    InsufficientOperandsError,
    DivisionByZeroError,
    EmptyStackError,
    InvalidOperationError,
)

class RPNCalculator:
    def __init__(self) -> None:
        self._stack: List[float] = []

    @property
    def stack(self) -> List[float]:
        return self._stack.copy()

    def push(self, value: float) -> None:
        self._stack.append(float(value))

    def pop(self) -> float:
        if not self._stack:
            raise EmptyStackError("Cannot pop from an empty stack")
        return self._stack.pop()

    def clear(self) -> None:
        self._stack.clear()

    def size(self) -> int:
        return len(self._stack)

    def _ensure_operands(self, count: int = 2) -> None:
        if len(self._stack) < count:
            raise InsufficientOperandsError(
                f"Operation requires {count} operands, but only {len(self._stack)} available"
            )

    def add(self) -> float:
        self._ensure_operands(2)
        b = self._stack.pop()
        a = self._stack.pop()
        result = a + b
        self._stack.append(result)
        return result

    def subtract(self) -> float:
        self._ensure_operands(2)
        b = self._stack.pop()
        a = self._stack.pop()
        result = a - b
        self._stack.append(result)
        return result

    def multiply(self) -> float:
        self._ensure_operands(2)
        b = self._stack.pop()
        a = self._stack.pop()
        result = a * b
        self._stack.append(result)
        return result

    def divide(self) -> float:
        self._ensure_operands(2)
        b = self._stack.pop()
        a = self._stack.pop()
        if b == 0:
            # remettre l'état si erreur
            self._stack.append(a)
            self._stack.append(b)
            raise DivisionByZeroError("Cannot divide by zero")
        result = a / b
        self._stack.append(result)
        return result

    def sqrt(self) -> float:
        self._ensure_operands(1)
        a = self._stack.pop()
        if a < 0:
            self._stack.append(a)
            raise InvalidOperationError("Cannot compute square root of negative number")
        result = math.sqrt(a)
        self._stack.append(result)
        return result

    def power(self) -> float:
        self._ensure_operands(2)
        b = self._stack.pop()
        a = self._stack.pop()
        try:
            result = math.pow(a, b)
            if math.isinf(result) or math.isnan(result):
                self._stack.append(a); self._stack.append(b)
                raise InvalidOperationError("Power operation resulted in invalid number")
        except (ValueError, OverflowError) as e:
            self._stack.append(a); self._stack.append(b)
            raise InvalidOperationError(f"Invalid power operation: {e}")
        self._stack.append(result)
        return result

    def swap(self) -> None:
        self._ensure_operands(2)
        b = self._stack.pop()
        a = self._stack.pop()
        self._stack.append(b)
        self._stack.append(a)

    def dup(self) -> None:
        self._ensure_operands(1)
        value = self._stack[-1]
        self._stack.append(value)

    def drop(self) -> float:
        if not self._stack:
            raise EmptyStackError("Cannot drop from an empty stack")
        return self._stack.pop()

    def peek(self) -> Optional[float]:
        return self._stack[-1] if self._stack else None
