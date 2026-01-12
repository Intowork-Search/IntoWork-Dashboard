# IntoWork Backend Test Suite

Comprehensive test suite for the IntoWork Backend API using pytest and async testing.

## Setup

### 1. Install Test Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Create Test Database

The tests use a separate test database to avoid interfering with development data:

```bash
# Using Docker PostgreSQL
docker exec -it postgres psql -U postgres -c "CREATE DATABASE intowork_test;"

# Or via psql directly
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE intowork_test;"
```

### 3. Configure Test Environment

Create a `.env.test` file or set the `TEST_DATABASE_URL` environment variable:

```bash
export TEST_DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5433/intowork_test"
```

## Running Tests

### Run All Tests

```bash
pytest
```

### Run Specific Test File

```bash
pytest tests/test_auth.py
pytest tests/test_jobs.py
pytest tests/test_applications.py
```

### Run Specific Test

```bash
pytest tests/test_auth.py::test_signup_success
```

### Run with Verbose Output

```bash
pytest -v
```

### Run with Coverage

```bash
pytest --cov=app --cov-report=html
```

### Run in Parallel (faster)

```bash
pip install pytest-xdist
pytest -n auto
```

## Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures and configuration
├── test_auth.py             # Authentication endpoint tests
├── test_jobs.py             # Job CRUD operation tests
└── test_applications.py     # Application workflow tests
```

## Test Coverage

### Authentication Tests (`test_auth.py`)
- User signup (success, duplicate email, weak password)
- User signin (success, invalid credentials, non-existent user)
- Password reset flow (request, reset with valid/invalid token)

### Job Tests (`test_jobs.py`)
- List jobs (authenticated/unauthenticated)
- Get job detail
- Create job (employer only)
- Update job
- Delete job
- Search and filter jobs

### Application Tests (`test_applications.py`)
- Apply to job as candidate
- Prevent duplicate applications
- List applications (candidate and employer views)
- Get application detail
- Update application status (employer only)
- Withdraw application

## Fixtures

### Database Fixtures
- `test_engine`: Async SQLAlchemy engine for tests
- `test_db`: Async database session (isolated per test)
- `client`: HTTP client with database override

### User Fixtures
- `candidate_user`: Pre-created candidate user with profile
- `employer_user`: Pre-created employer user with company
- `auth_headers_candidate`: Authentication headers for candidate
- `auth_headers_employer`: Authentication headers for employer

### Data Fixtures
- `test_job`: Pre-created active job posting

## Best Practices

1. **Isolation**: Each test runs with a fresh database (tables dropped/created)
2. **Async**: All tests use `@pytest.mark.asyncio` decorator
3. **Fixtures**: Use fixtures for common setup to avoid duplication
4. **Assertions**: Use descriptive assertions to make failures clear
5. **Mocking**: Email service is mocked to prevent actual emails in tests

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    cd backend
    pip install -r requirements.txt
    pytest --cov=app --cov-report=xml
```

## Troubleshooting

### Database Connection Issues

If tests fail with connection errors:
1. Verify PostgreSQL is running on port 5433
2. Ensure test database exists
3. Check `TEST_DATABASE_URL` is set correctly

### Import Errors

If you get import errors, ensure you're running tests from the backend directory:

```bash
cd backend
pytest
```

### Async Warnings

If you see async warnings, ensure all test functions are marked with `@pytest.mark.asyncio`.

## Adding New Tests

1. Create test file in `tests/` with `test_` prefix
2. Import required fixtures from `conftest.py`
3. Mark async tests with `@pytest.mark.asyncio`
4. Use descriptive test names: `test_<action>_<expected_result>`
5. Follow AAA pattern: Arrange, Act, Assert

Example:

```python
@pytest.mark.asyncio
async def test_create_resource_success(client: AsyncClient, auth_headers_candidate: dict):
    # Arrange
    data = {"name": "Test Resource"}

    # Act
    response = await client.post("/api/resource", headers=auth_headers_candidate, json=data)

    # Assert
    assert response.status_code == 201
    assert response.json()["name"] == "Test Resource"
```
