import sys
import os

# Ensure repository root is present in sys.path for root module imports (profit_leakage, forecasting, simulator, agent)
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
