"""
Stack service - Service layer managing RPN calculator with history and undo.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.domain.rpn_calculator import RPNCalculator

class StackHistory:
    def __init__(self, max_history: int = 100) -> None:
        self._history: List[List[float]] = []
        self._max_history = max_history

    def save_state(self, stack: List[float]) -> None:
        self._history.append(stack.copy())
        if len(self._history) > self._max_history:
            self._history.pop(0)

    def get_previous_state(self) -> Optional[List[float]]:
        if len(self._history) < 2:
            return None
        self._history.pop()
        return self._history[-1].copy() if self._history else None

    def clear(self) -> None:
        self._history.clear()

    @property
    def size(self) -> int:
        return len(self._history)

class StackService:
    _instances: Dict[str, "StackService"] = {}

    def __init__(self, session_id: str = "default") -> None:
        self._session_id = session_id
        self._calculator = RPNCalculator()
        self._history = StackHistory()
        self._operation_count = 0
        self._last_operation: Optional[str] = None
        self._created_at = datetime.utcnow()

    @classmethod
    def get_instance(cls, session_id: str = "default") -> "StackService":
        if session_id not in cls._instances:
            cls._instances[session_id] = cls(session_id)
        return cls._instances[session_id]

    @classmethod
    def clear_session(cls, session_id: str) -> bool:
        if session_id in cls._instances:
            del cls._instances[session_id]
            return True
        return False

    def _save_state(self) -> None:
        self._history.save_state(self._calculator.stack)

    def _record_operation(self, operation: str) -> None:
        self._operation_count += 1
        self._last_operation = operation

    def get_state(self) -> Dict[str, Any]:
        stack = self._calculator.stack
        return {
            "stack": stack,
            "size": len(stack),
            "top": stack[-1] if stack else None,
            "session_id": self._session_id,
            "operation_count": self._operation_count,
            "last_operation": self._last_operation,
            "history_size": self._history.size,
        }

    # Mutations
    def push(self, value: float) -> Dict[str, Any]:
        self._save_state()
        self._calculator.push(value)
        self._record_operation(f"push({value})")
        return self.get_state()

    def add(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.add()
        self._record_operation("add")
        return self.get_state()

    def subtract(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.subtract()
        self._record_operation("subtract")
        return self.get_state()

    def multiply(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.multiply()
        self._record_operation("multiply")
        return self.get_state()

    def divide(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.divide()
        self._record_operation("divide")
        return self.get_state()

    def sqrt(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.sqrt()
        self._record_operation("sqrt")
        return self.get_state()

    def power(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.power()
        self._record_operation("power")
        return self.get_state()

    def swap(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.swap()
        self._record_operation("swap")
        return self.get_state()

    def dup(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.dup()
        self._record_operation("dup")
        return self.get_state()

    def drop(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.drop()
        self._record_operation("drop")
        return self.get_state()

    def clear(self) -> Dict[str, Any]:
        self._save_state()
        self._calculator.clear()
        self._record_operation("clear")
        return self.get_state()

    def undo(self) -> Dict[str, Any]:
        previous_state = self._history.get_previous_state()
        if previous_state is None:
            raise ValueError("No history available for undo")
        self._calculator.clear()
        for value in previous_state:
            self._calculator.push(value)
        self._record_operation("undo")
        return self.get_state()

    @property
    def calculator(self) -> RPNCalculator:
        return self._calculator

def get_stack_service(session_id: str = "default") -> StackService:
    return StackService.get_instance(session_id)
