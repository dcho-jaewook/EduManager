# backend/db.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file in the current directory (backend/)
# It's good practice to specify the path to .env explicitly if it's not in the root
# of where Python is executed from, but for a simple backend structure, this is often fine.
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    # Attempt to load from the project root if backend/.env doesn't exist
    # This might be useful if you have a single .env for the whole project
    project_root_dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(project_root_dotenv_path):
        load_dotenv(project_root_dotenv_path)
    else:
        print("Warning: .env file not found in backend/ or project root.")


# Initialize Supabase Client
SUPABASE_URL: str = os.environ.get("SUPABASE_URL")
SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    # This error will stop the application if credentials are not set, which is good.
    raise ValueError("Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are not set in the .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
