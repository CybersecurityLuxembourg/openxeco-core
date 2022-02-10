import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'venv', 'lib', 'python3.8', 'site-packages'))

# pylint: disable=wrong-import-position
from app import app
assert app  # nosec
