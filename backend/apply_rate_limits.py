"""
Script to apply rate limiting to all API routes

Rate limit tiers based on endpoint type:
- Listing endpoints (jobs, applications): 60/minute
- Detail endpoints: 120/minute
- Mutation endpoints (create, update, delete): 30/minute
- Apply endpoint: 10/minute (prevent spam)
- Dashboard: 30/minute
"""

import re
from pathlib import Path

RATE_LIMITS = {
    # Jobs API
    'jobs.py': {
        'get_jobs': '60/minute',  # Listing
        'get_job_by_id': '120/minute',  # Detail
        'apply_to_job': '10/minute',  # Apply (prevent spam)
        'create_job': '30/minute',  # Create
        'update_job': '30/minute',  # Update
        'delete_job': '30/minute',  # Delete
        'publish_job': '30/minute',  # Publish
    },
    # Applications API
    'applications.py': {
        'get_applications': '30/minute',
        'get_application_detail': '60/minute',
        'create_application': '10/minute',  # Prevent spam
        'update_application_status': '30/minute',
    },
    # Dashboard API
    'dashboard.py': {
        'get_dashboard_data': '30/minute',
        'get_recent_activities': '60/minute',
    },
    # Candidates API
    'candidates.py': {
        'get_candidate_profile': '60/minute',
        'update_candidate_profile': '30/minute',
        'upload_cv': '10/minute',  # File upload
        'add_experience': '30/minute',
        'add_education': '30/minute',
        'add_skill': '30/minute',
    },
    # Companies API
    'companies.py': {
        'get_companies': '60/minute',
        'get_company': '120/minute',
        'create_company': '10/minute',  # Prevent abuse
        'update_company': '30/minute',
    },
    # Employers API
    'employers.py': {
        'get_employer_profile': '60/minute',
        'update_employer_profile': '30/minute',
    },
    # Notifications API
    'notifications.py': {
        'get_notifications': '60/minute',
        'mark_as_read': '120/minute',  # Quick action
        'mark_all_as_read': '30/minute',
    },
    # Users API
    'users.py': {
        'get_me': '120/minute',
        'update_me': '30/minute',
    },
    # Admin API
    'admin.py': {
        'get_users': '30/minute',
        'get_stats': '60/minute',
    },
}


def add_rate_limit_to_route(content: str, function_name: str, rate_limit: str) -> tuple[str, bool]:
    """
    Add rate limit decorator to a route function

    Returns: (modified_content, was_modified)
    """
    # Pattern to match route decorators and function definition
    # Look for @router.METHOD followed by function def
    pattern = rf'(@router\.(get|post|put|delete|patch)\([^)]*\))\s*\n(\s*)async def {function_name}\('

    match = re.search(pattern, content)
    if not match:
        return content, False

    # Check if rate limit already exists
    decorator = match.group(1)
    indent = match.group(3)

    # Check few lines before for existing limiter decorator
    lines_before_match = content[:match.start()].split('\n')[-5:]
    if any('@limiter.limit' in line for line in lines_before_match):
        # Rate limit already exists
        return content, False

    # Add limiter import if not present
    if 'from app.main import limiter' not in content and 'from slowapi import Limiter' not in content:
        # Find first import and add after it
        import_pattern = r'(from fastapi import [^\n]+\n)'
        content = re.sub(import_pattern, r'\1from app.main import limiter\n', content, count=1)

    # Insert rate limit decorator before route decorator
    rate_limit_decorator = f'{indent}@limiter.limit("{rate_limit}")\n'
    new_content = content[:match.start()] + rate_limit_decorator + content[match.start():]

    return new_content, True


def apply_rate_limits_to_file(file_path: Path, rate_limits: dict) -> int:
    """
    Apply rate limits to all functions in a file

    Returns: Number of functions modified
    """
    with open(file_path, 'r') as f:
        content = f.read()

    modified_count = 0
    for function_name, rate_limit in rate_limits.items():
        content, was_modified = add_rate_limit_to_route(content, function_name, rate_limit)
        if was_modified:
            modified_count += 1
            print(f"  ✓ Added {rate_limit} limit to {function_name}")

    if modified_count > 0:
        with open(file_path, 'w') as f:
            f.write(content)

    return modified_count


def main():
    api_dir = Path(__file__).parent / 'app' / 'api'

    if not api_dir.exists():
        print(f"API directory not found: {api_dir}")
        return

    total_modified = 0

    for file_name, rate_limits in RATE_LIMITS.items():
        file_path = api_dir / file_name

        if not file_path.exists():
            print(f"⚠ File not found: {file_name}")
            continue

        print(f"\nProcessing {file_name}...")
        modified = apply_rate_limits_to_file(file_path, rate_limits)

        if modified > 0:
            print(f"✅ Modified {modified} functions in {file_name}")
            total_modified += modified
        else:
            print(f"  No changes needed in {file_name}")

    print(f"\n✅ Total: Applied rate limits to {total_modified} functions")


if __name__ == '__main__':
    main()
