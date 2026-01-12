"""
Script to update all API route files from logging to loguru
"""

import os
import re
from pathlib import Path

def update_file_logging(file_path):
    """Update a single file to use loguru instead of logging"""

    with open(file_path, 'r') as f:
        content = f.read()

    # Track if file was modified
    modified = False
    original_content = content

    # Replace logging import with loguru
    if 'import logging' in content and 'from loguru import logger' not in content:
        # Check if it's standalone or part of other imports
        if re.search(r'^import logging\s*$', content, re.MULTILINE):
            content = re.sub(r'^import logging\s*$', 'from loguru import logger', content, flags=re.MULTILINE)
            modified = True
        elif re.search(r'^import logging', content, re.MULTILINE):
            # Add loguru import before or after logging
            lines = content.split('\n')
            new_lines = []
            logging_found = False
            for line in lines:
                new_lines.append(line)
                if 'import logging' in line and not logging_found:
                    new_lines.append('from loguru import logger')
                    logging_found = True
            content = '\n'.join(new_lines)
            modified = True

    # Remove logger = logging.getLogger(__name__) lines
    if 'logger = logging.getLogger(' in content:
        content = re.sub(r'logger\s*=\s*logging\.getLogger\([^\)]*\)\s*\n?', '', content)
        modified = True

    # Save if modified
    if modified:
        with open(file_path, 'w') as f:
            f.write(content)
        return True

    return False

def main():
    # Get API directory
    api_dir = Path(__file__).parent / 'app' / 'api'

    if not api_dir.exists():
        print(f"API directory not found: {api_dir}")
        return

    # Update all Python files in API directory
    updated_files = []
    for py_file in api_dir.glob('*.py'):
        if py_file.name == '__init__.py':
            continue

        if update_file_logging(py_file):
            updated_files.append(py_file.name)
            print(f"✓ Updated: {py_file.name}")
        else:
            print(f"  Skipped: {py_file.name} (no changes needed)")

    # Also update auth.py in app directory
    auth_file = Path(__file__).parent / 'app' / 'auth.py'
    if auth_file.exists() and update_file_logging(auth_file):
        updated_files.append('auth.py')
        print(f"✓ Updated: auth.py")

    # Also update database.py if it has logging
    db_file = Path(__file__).parent / 'app' / 'database.py'
    if db_file.exists() and update_file_logging(db_file):
        updated_files.append('database.py')
        print(f"✓ Updated: database.py")

    print(f"\n✅ Updated {len(updated_files)} files with loguru")
    print(f"Files: {', '.join(updated_files)}")

if __name__ == '__main__':
    main()
