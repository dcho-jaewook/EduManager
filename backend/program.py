# backend/program.py
from flask import Blueprint, request, jsonify
from db import supabase # Import the initialized Supabase client from db.py

# Create a Blueprint instance
# 'program_api' is the name of the blueprint.
# __name__ helps Flask locate the blueprint.
# url_prefix will prefix all routes defined in this blueprint with /api/programs.
program_bp = Blueprint('program_api', __name__, url_prefix='/api/programs')

# --- Program CRUD Endpoints ---

# READ: Get all programs
@program_bp.route('', methods=['GET'])
def get_all_programs():
    """
    Retrieves a list of all programs, ordered by creation date descending.
    """
    try:
        response = supabase.table('programs').select('*').order('created_at', desc=True).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Supabase error (get_all_programs): {response.error}")
            return jsonify({"error": response.error.message, "details": str(response.error)}), 500

        return jsonify(response.data if response.data else []), 200
    except Exception as e:
        print(f"Exception in get_all_programs: {e}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

# CREATE: Create a program
# @program_bp.route('', methods=['POST'])
# def create_program():
#     print(request)
#     return