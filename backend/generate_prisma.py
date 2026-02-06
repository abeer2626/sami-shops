import os
import sys
import subprocess
from pathlib import Path

# Add the scripts directory to PATH
scripts_path = Path(r"C:\Users\User\AppData\Roaming\Python\Python313\Scripts")
os.environ["PATH"] = str(scripts_path) + os.pathsep + os.environ.get("PATH", "")

# Try to run prisma generate
try:
    result = subprocess.run(
        ["python", "-m", "prisma", "generate"],
        capture_output=True,
        text=True,
        cwd=Path(__file__).parent
    )
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
    print("Return code:", result.returncode)
except Exception as e:
    print(f"Error: {e}")
