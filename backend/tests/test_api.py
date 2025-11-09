"""
Integration tests for the RPN Calculator REST API.

These tests validate the API endpoints and their HTTP behavior.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.stack_service import get_stack_service


@pytest.fixture(autouse=True)
def reset_stack():
    """Reset the stack before each test."""
    service = get_stack_service()
    service.reset()
    yield
    service.reset()


client = TestClient(app)


class TestHealthEndpoint:
    """Test the health check endpoint."""

    def test_root_returns_api_info(self):
        """Root endpoint should return API information."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "running"


class TestStackEndpoints:
    """Test stack management endpoints."""

    def test_get_empty_stack(self):
        """GET /stack should return empty stack initially."""
        response = client.get("/stack")
        assert response.status_code == 200
        data = response.json()
        assert data["stack"] == []
        assert data["size"] == 0

    def test_push_single_value(self):
        """POST /stack should add a value to the stack."""
        response = client.post("/stack", json={"value": 42})
        assert response.status_code == 201
        data = response.json()
        assert data["stack"] == [42.0]
        assert data["size"] == 1

    def test_push_multiple_values(self):
        """Pushing multiple values should work."""
        client.post("/stack", json={"value": 10})
        client.post("/stack", json={"value": 20})
        response = client.post("/stack", json={"value": 30})

        assert response.status_code == 201
        data = response.json()
        assert data["stack"] == [10.0, 20.0, 30.0]
        assert data["size"] == 3

    def test_push_float_value(self):
        """Pushing float values should work."""
        response = client.post("/stack", json={"value": 3.14159})
        assert response.status_code == 201
        data = response.json()
        assert data["stack"] == [3.14159]

    def test_push_negative_value(self):
        """Pushing negative values should work."""
        response = client.post("/stack", json={"value": -17.5})
        assert response.status_code == 201
        data = response.json()
        assert data["stack"] == [-17.5]

    def test_push_invalid_value_type(self):
        """Pushing non-numeric value should fail validation."""
        response = client.post("/stack", json={"value": "not_a_number"})
        assert response.status_code == 422

    def test_push_missing_value(self):
        """Pushing without value should fail validation."""
        response = client.post("/stack", json={})
        assert response.status_code == 422

    def test_get_stack_after_pushes(self):
        """GET /stack should reflect pushed values."""
        client.post("/stack", json={"value": 5})
        client.post("/stack", json={"value": 10})

        response = client.get("/stack")
        assert response.status_code == 200
        data = response.json()
        assert data["stack"] == [5.0, 10.0]
        assert data["size"] == 2

    def test_clear_stack(self):
        """DELETE /stack should clear all values."""
        client.post("/stack", json={"value": 1})
        client.post("/stack", json={"value": 2})

        response = client.delete("/stack")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data

        response = client.get("/stack")
        data = response.json()
        assert data["stack"] == []
        assert data["size"] == 0

    def test_clear_empty_stack(self):
        """Clearing an empty stack should work."""
        response = client.delete("/stack")
        assert response.status_code == 200


class TestAdditionOperation:
    """Test addition endpoint."""

    def test_add_two_values(self):
        """POST /op/add should add two values."""
        client.post("/stack", json={"value": 5})
        client.post("/stack", json={"value": 3})

        response = client.post("/op/add")
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 8.0
        assert data["stack"] == [8.0]

    def test_add_with_one_value_fails(self):
        """Adding with only one value should fail."""
        client.post("/stack", json={"value": 5})

        response = client.post("/op/add")
        assert response.status_code == 400
        data = response.json()
        assert "operands" in data["detail"].lower()

    def test_add_with_empty_stack_fails(self):
        """Adding with empty stack should fail."""
        response = client.post("/op/add")
        assert response.status_code == 400

    def test_add_leaves_result_on_stack(self):
        """After addition, result should be on stack."""
        client.post("/stack", json={"value": 10})
        client.post("/stack", json={"value": 20})
        client.post("/op/add")

        response = client.get("/stack")
        data = response.json()
        assert data["stack"] == [30.0]


class TestSubtractionOperation:
    """Test subtraction endpoint."""

    def test_subtract_two_values(self):
        """POST /op/sub should subtract correctly."""
        client.post("/stack", json={"value": 10})
        client.post("/stack", json={"value": 3})

        response = client.post("/op/sub")
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 7.0
        assert data["stack"] == [7.0]

    def test_subtract_resulting_in_negative(self):
        """Subtraction can result in negative."""
        client.post("/stack", json={"value": 3})
        client.post("/stack", json={"value": 10})

        response = client.post("/op/sub")
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == -7.0

    def test_subtract_with_insufficient_operands_fails(self):
        """Subtracting with < 2 values should fail."""
        client.post("/stack", json={"value": 5})

        response = client.post("/op/sub")
        assert response.status_code == 400


class TestMultiplicationOperation:
    """Test multiplication endpoint."""

    def test_multiply_two_values(self):
        """POST /op/mul should multiply correctly."""
        client.post("/stack", json={"value": 5})
        client.post("/stack", json={"value": 3})

        response = client.post("/op/mul")
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 15.0
        assert data["stack"] == [15.0]

    def test_multiply_by_zero(self):
        """Multiplying by zero should work."""
        client.post("/stack", json={"value": 42})
        client.post("/stack", json={"value": 0})

        response = client.post("/op/mul")
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 0.0

    def test_multiply_with_insufficient_operands_fails(self):
        """Multiplying with < 2 values should fail."""
        response = client.post("/op/mul")
        assert response.status_code == 400


class TestDivisionOperation:
    """Test division endpoint."""

    def test_divide_two_values(self):
        """POST /op/div should divide correctly."""
        client.post("/stack", json={"value": 10})
        client.post("/stack", json={"value": 2})

        response = client.post("/op/div")
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 5.0
        assert data["stack"] == [5.0]

    def test_divide_resulting_in_float(self):
        """Division can result in float."""
        client.post("/stack", json={"value": 7})
        client.post("/stack", json={"value": 2})

        response = client.post("/op/div")
        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 3.5

    def test_divide_by_zero_fails(self):
        """Dividing by zero should return 400 error."""
        client.post("/stack", json={"value": 10})
        client.post("/stack", json={"value": 0})

        response = client.post("/op/div")
        assert response.status_code == 400
        data = response.json()
        assert "zero" in data["detail"].lower()

    def test_divide_with_insufficient_operands_fails(self):
        """Dividing with < 2 values should fail."""
        client.post("/stack", json={"value": 5})

        response = client.post("/op/div")
        assert response.status_code == 400


class TestComplexScenarios:
    """Test complex API interaction scenarios."""

    def test_rpn_expression_5_3_plus_2_mul(self):
        """Test RPN: 5 3 + 2 * = 16."""
        client.post("/stack", json={"value": 5})
        client.post("/stack", json={"value": 3})
        client.post("/op/add")
        client.post("/stack", json={"value": 2})
        response = client.post("/op/mul")

        assert response.status_code == 200
        data = response.json()
        assert data["result"] == 16.0

    def test_multiple_operations_sequence(self):
        """Test a sequence of multiple operations."""
        client.post("/stack", json={"value": 10})
        client.post("/stack", json={"value": 5})
        client.post("/op/add")

        client.post("/stack", json={"value": 3})
        client.post("/op/sub")

        client.post("/stack", json={"value": 2})
        client.post("/op/mul")

        response = client.get("/stack")
        data = response.json()
        assert data["stack"] == [24.0]

    def test_clear_and_restart(self):
        """Test clearing stack and starting over."""
        client.post("/stack", json={"value": 1})
        client.post("/stack", json={"value": 2})
        client.delete("/stack")

        client.post("/stack", json={"value": 10})
        client.post("/stack", json={"value": 5})
        response = client.post("/op/add")

        data = response.json()
        assert data["result"] == 15.0

    def test_error_recovery(self):
        """Test that errors don't corrupt the stack."""
        client.post("/stack", json={"value": 10})
        client.post("/stack", json={"value": 0})

        response = client.post("/op/div")
        assert response.status_code == 400

        response = client.get("/stack")
        data = response.json()
        assert data["stack"] == [10.0, 0.0]

    def test_openapi_schema_available(self):
        """OpenAPI schema should be accessible."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        assert "openapi" in schema
        assert "paths" in schema

    def test_swagger_docs_available(self):
        """Swagger UI should be accessible."""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
