import sys
from pathlib import Path


CYCLE_SERVICE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(CYCLE_SERVICE_ROOT))
