import os
import sys

# Add backend directory to Python sys.path so we can import modules from it
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.append(backend_dir)

# Import the initialized Flask app instance
from app import app
