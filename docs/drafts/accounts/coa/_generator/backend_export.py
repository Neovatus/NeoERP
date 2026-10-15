"""Export approved 2026.2 only; published 2026.1 resources are immutable inputs.

Run python3 _generator/backend_export.py [target-directory].
The migration owner supplies target/schema.sql before this command.
"""
import sys
from pack_2026_2 import export

if __name__ == '__main__':
    export(sys.argv[1] if len(sys.argv) > 1 else None)
