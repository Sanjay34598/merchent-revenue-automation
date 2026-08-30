import sys
import os
import pytest

# Ensure backend and root directory are in sys.path for test execution
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_dir = os.path.join(root_dir, "backend")
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal, Base, engine
from app.models.models import Store
from scripts.generate_data import SyntheticDataGenerator

@pytest.fixture(scope="session", autouse=True)
def ensure_database_seeded():
    """Ensure database schema and synthetic dataset exist for test suite execution on clean checkouts."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        store_count = db.query(Store).count()
        if store_count == 0:
            print("\n[pytest setup] Database empty. Generating synthetic seed data for test suite...")
            generator = SyntheticDataGenerator(seed=42)
            generator.generate()
            print("[pytest setup] Synthetic seed data generated successfully.")
    finally:
        db.close()
