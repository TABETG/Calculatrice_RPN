"""
Unit tests for RPN Calculator domain logic.

These tests validate the core business logic independently of the web framework.
"""
import pytest
from app.domain.rpn_calculator import RPNCalculator
from app.core.exceptions import (
    InsufficientOperandsError,
    DivisionByZeroError,
    EmptyStackError,
)


class TestRPNCalculatorBasics:
    """Test basic stack operations."""

    def test_new_calculator_has_empty_stack(self):
        """A new calculator should start with an empty stack."""
        calc = RPNCalculator()
        assert calc.stack == []
        assert calc.size() == 0

    def test_push_single_value(self):
        """Pushing a value should add it to the stack."""
        calc = RPNCalculator()
        calc.push(42)
        assert calc.stack == [42.0]
        assert calc.size() == 1

    def test_push_multiple_values(self):
        """Pushing multiple values should maintain order."""
        calc = RPNCalculator()
        calc.push(10)
        calc.push(20)
        calc.push(30)
        assert calc.stack == [10.0, 20.0, 30.0]
        assert calc.size() == 3

    def test_push_converts_to_float(self):
        """Push should accept integers and convert to float."""
        calc = RPNCalculator()
        calc.push(5)
        assert calc.stack == [5.0]
        assert isinstance(calc.stack[0], float)

    def test_push_negative_values(self):
        """Pushing negative values should work."""
        calc = RPNCalculator()
        calc.push(-17.5)
        assert calc.stack == [-17.5]

    def test_pop_returns_and_removes_top_value(self):
        """Pop should return and remove the top value."""
        calc = RPNCalculator()
        calc.push(10)
        calc.push(20)
        value = calc.pop()
        assert value == 20.0
        assert calc.stack == [10.0]
        assert calc.size() == 1

    def test_pop_from_empty_stack_raises_error(self):
        """Popping from empty stack should raise EmptyStackError."""
        calc = RPNCalculator()
        with pytest.raises(EmptyStackError, match="Cannot pop from an empty stack"):
            calc.pop()

    def test_clear_empties_stack(self):
        """Clear should remove all values from the stack."""
        calc = RPNCalculator()
        calc.push(1)
        calc.push(2)
        calc.push(3)
        calc.clear()
        assert calc.stack == []
        assert calc.size() == 0

    def test_clear_on_empty_stack(self):
        """Clearing an already empty stack should work."""
        calc = RPNCalculator()
        calc.clear()
        assert calc.stack == []


class TestRPNAddition:
    """Test addition operation."""

    def test_add_two_values(self):
        """Adding two values should return their sum."""
        calc = RPNCalculator()
        calc.push(5)
        calc.push(3)
        result = calc.add()
        assert result == 8.0
        assert calc.stack == [8.0]
        assert calc.size() == 1

    def test_add_negative_numbers(self):
        """Addition should work with negative numbers."""
        calc = RPNCalculator()
        calc.push(-5)
        calc.push(-3)
        result = calc.add()
        assert result == -8.0
        assert calc.stack == [-8.0]

    def test_add_with_more_than_two_values(self):
        """Add should only use the top two values."""
        calc = RPNCalculator()
        calc.push(1)
        calc.push(2)
        calc.push(3)
        result = calc.add()
        assert result == 5.0
        assert calc.stack == [1.0, 5.0]

    def test_add_with_insufficient_operands(self):
        """Adding with fewer than 2 operands should raise error."""
        calc = RPNCalculator()
        calc.push(5)
        with pytest.raises(
            InsufficientOperandsError, match="Operation requires 2 operands"
        ):
            calc.add()

    def test_add_with_empty_stack(self):
        """Adding with empty stack should raise error."""
        calc = RPNCalculator()
        with pytest.raises(
            InsufficientOperandsError, match="Operation requires 2 operands"
        ):
            calc.add()


class TestRPNSubtraction:
    """Test subtraction operation."""

    def test_subtract_two_values(self):
        """Subtracting should compute a - b correctly."""
        calc = RPNCalculator()
        calc.push(10)
        calc.push(3)
        result = calc.subtract()
        assert result == 7.0
        assert calc.stack == [7.0]

    def test_subtract_resulting_in_negative(self):
        """Subtraction can result in negative values."""
        calc = RPNCalculator()
        calc.push(3)
        calc.push(10)
        result = calc.subtract()
        assert result == -7.0
        assert calc.stack == [-7.0]

    def test_subtract_with_insufficient_operands(self):
        """Subtracting with fewer than 2 operands should raise error."""
        calc = RPNCalculator()
        calc.push(5)
        with pytest.raises(
            InsufficientOperandsError, match="Operation requires 2 operands"
        ):
            calc.subtract()


class TestRPNMultiplication:
    """Test multiplication operation."""

    def test_multiply_two_values(self):
        """Multiplying two values should return their product."""
        calc = RPNCalculator()
        calc.push(5)
        calc.push(3)
        result = calc.multiply()
        assert result == 15.0
        assert calc.stack == [15.0]

    def test_multiply_by_zero(self):
        """Multiplying by zero should work."""
        calc = RPNCalculator()
        calc.push(42)
        calc.push(0)
        result = calc.multiply()
        assert result == 0.0
        assert calc.stack == [0.0]

    def test_multiply_negative_numbers(self):
        """Multiplying negative numbers should work correctly."""
        calc = RPNCalculator()
        calc.push(-5)
        calc.push(-3)
        result = calc.multiply()
        assert result == 15.0

    def test_multiply_with_insufficient_operands(self):
        """Multiplying with fewer than 2 operands should raise error."""
        calc = RPNCalculator()
        with pytest.raises(
            InsufficientOperandsError, match="Operation requires 2 operands"
        ):
            calc.multiply()


class TestRPNDivision:
    """Test division operation."""

    def test_divide_two_values(self):
        """Dividing should compute a / b correctly."""
        calc = RPNCalculator()
        calc.push(10)
        calc.push(2)
        result = calc.divide()
        assert result == 5.0
        assert calc.stack == [5.0]

    def test_divide_resulting_in_float(self):
        """Division can result in float values."""
        calc = RPNCalculator()
        calc.push(7)
        calc.push(2)
        result = calc.divide()
        assert result == 3.5
        assert calc.stack == [3.5]

    def test_divide_by_zero_raises_error(self):
        """Dividing by zero should raise DivisionByZeroError."""
        calc = RPNCalculator()
        calc.push(10)
        calc.push(0)
        with pytest.raises(DivisionByZeroError, match="Cannot divide by zero"):
            calc.divide()

    def test_divide_by_zero_preserves_stack(self):
        """Failed division by zero should preserve the stack."""
        calc = RPNCalculator()
        calc.push(10)
        calc.push(0)
        try:
            calc.divide()
        except DivisionByZeroError:
            pass
        assert calc.stack == [10.0, 0.0]

    def test_divide_with_insufficient_operands(self):
        """Dividing with fewer than 2 operands should raise error."""
        calc = RPNCalculator()
        calc.push(5)
        with pytest.raises(
            InsufficientOperandsError, match="Operation requires 2 operands"
        ):
            calc.divide()


class TestRPNComplexScenarios:
    """Test complex calculation scenarios."""

    def test_chained_operations(self):
        """Multiple operations can be chained together."""
        calc = RPNCalculator()
        calc.push(5)
        calc.push(3)
        calc.add()
        calc.push(2)
        calc.multiply()
        assert calc.stack == [16.0]

    def test_rpn_expression_5_3_plus_2_mul(self):
        """Test RPN: 5 3 + 2 * = (5+3)*2 = 16."""
        calc = RPNCalculator()
        calc.push(5)
        calc.push(3)
        calc.add()
        calc.push(2)
        calc.multiply()
        assert calc.stack == [16.0]

    def test_rpn_expression_15_7_1_plus_mul_3_div(self):
        """Test RPN: 15 7 1 + 1 + / 3 - = 15/(7+1+1)-3 = 15/9-3 = 1.666... - 3."""
        calc = RPNCalculator()
        calc.push(15)
        calc.push(7)
        calc.push(1)
        calc.add()
        calc.push(1)
        calc.add()
        calc.divide()
        calc.push(3)
        calc.subtract()
        result = calc.stack[0]
        assert abs(result - (15 / 9 - 3)) < 0.0001

    def test_large_numbers(self):
        """Calculator should handle large numbers."""
        calc = RPNCalculator()
        calc.push(1000000)
        calc.push(2000000)
        calc.add()
        assert calc.stack == [3000000.0]

    def test_very_small_numbers(self):
        """Calculator should handle very small numbers."""
        calc = RPNCalculator()
        calc.push(0.000001)
        calc.push(0.000002)
        calc.add()
        assert abs(calc.stack[0] - 0.000003) < 1e-10

    def test_stack_isolation(self):
        """Getting stack should return a copy, not affect internal state."""
        calc = RPNCalculator()
        calc.push(1)
        calc.push(2)
        stack_copy = calc.stack
        stack_copy.append(999)
        assert calc.stack == [1.0, 2.0]
        assert 999 not in calc.stack
