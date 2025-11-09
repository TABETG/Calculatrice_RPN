"""
Custom exceptions for RPN Calculator business logic.
"""

class RPNCalculatorError(Exception):
    """Base exception for RPN Calculator errors."""
    pass

class InsufficientOperandsError(RPNCalculatorError):
    """Raised when there are not enough operands in the stack for an operation."""
    pass

class DivisionByZeroError(RPNCalculatorError):
    """Raised when attempting to divide by zero."""
    pass

class EmptyStackError(RPNCalculatorError):
    """Raised when attempting to pop from an empty stack."""
    pass

class InvalidOperationError(RPNCalculatorError):
    """Raised when an operation produces an invalid result."""
    pass
