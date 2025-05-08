# backend/program.py
from flask import Blueprint, request, jsonify
from db import supabase # Import the initialized Supabase client from db.py

# Create a Blueprint instance
# 'program_api' is the name of the blueprint.
# __name__ helps Flask locate the blueprint.
# url_prefix will prefix all routes defined in this blueprint with /api/programs.
program_bp = Blueprint('program_api', __name__, url_prefix='/api/programs')

# --- Program CRUD Endpoints ---

# CREATE: Add a new program
@program_bp.route('', methods=['POST'])
def create_program():
    """
    Creates a new program.
    Expects JSON data in the request body:
    {
        "title": "string (required)",
        "total_sessions": "integer (optional)",
        "status": "string (optional)"
    }
    """
    data = request.get_json()

    if not data or not data.get('title'):
        return jsonify({"error": "Title is a required field"}), 400

    try:
        new_program_data = {
            "title": data.get('title'),
            "total_sessions": data.get('total_sessions'), # Supabase handles type conversion or use int()
            "status": data.get('status')
        }
        # Filter out None values if you don't want to insert NULLs explicitly for optional fields
        new_program_data = {k: v for k, v in new_program_data.items() if v is not None}


        response = supabase.table('programs').insert(new_program_data).execute()

        if hasattr(response, 'error') and response.error:
            print(f"Supabase error (create_program): {response.error}")
            return jsonify({"error": response.error.message, "details": str(response.error)}), 500
        
        created_program = response.data[0] if response.data else None
        if not created_program:
            return jsonify({"error": "Failed to create program or retrieve data after creation"}), 500
            
        return jsonify(created_program), 201

    except Exception as e:
        print(f"Exception in create_program: {e}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

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

# READ: Get a single program by its ID
@program_bp.route('/<int:program_id>', methods=['GET'])
def get_program(program_id):
    """
    Retrieves a specific program by its ID.
    """
    try:
        response = supabase.table('programs').select('*').eq('id', program_id).maybe_single().execute()

        if hasattr(response, 'error') and response.error:
            print(f"Supabase error (get_program for ID {program_id}): {response.error}")
            return jsonify({"error": response.error.message, "details": str(response.error)}), 500

        if not response.data:
            return jsonify({"error": "Program not found"}), 404
        
        return jsonify(response.data), 200
    except Exception as e:
        print(f"Exception in get_program for ID {program_id}: {e}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

# UPDATE: Modify an existing program by its ID
@program_bp.route('/<int:program_id>', methods=['PUT', 'PATCH']) # Support both PUT and PATCH
def update_program(program_id):
    """
    Updates an existing program.
    Expects JSON data with fields to update.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    try:
        # Construct payload with only the fields provided in the request
        update_payload = {}
        if 'title' in data:
            update_payload['title'] = data['title']
        if 'total_sessions' in data:
            update_payload['total_sessions'] = data['total_sessions'] # Add int() conversion if needed
        if 'status' in data:
            update_payload['status'] = data['status']
        
        if not update_payload: # No valid fields were provided to update
            return jsonify({"error": "No valid fields to update were provided"}), 400

        response = supabase.table('programs').update(update_payload).eq('id', program_id).execute()

        if hasattr(response, 'error') and response.error:
            print(f"Supabase error (update_program for ID {program_id}): {response.error}")
            return jsonify({"error": response.error.message, "details": str(response.error)}), 500

        if not response.data: # No rows updated, could be due to RLS or program not found
            # Check if the program actually exists to give a more specific error
            check_exists = supabase.table('programs').select('id').eq('id', program_id).maybe_single().execute()
            if not check_exists.data:
                return jsonify({"error": "Program not found"}), 404
            return jsonify({"message": "Program data unchanged or update restricted (e.g., RLS)"}), 200 # Or 403 if RLS is the cause

        return jsonify(response.data[0]), 200
    except Exception as e:
        print(f"Exception in update_program for ID {program_id}: {e}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

# DELETE: Remove a program by its ID
@program_bp.route('/<int:program_id>', methods=['DELETE'])
def delete_program(program_id):
    """
    Deletes a program by its ID.
    """
    try:
        # Optional: Check if program exists first to provide a 404 if not found
        # before attempting delete. Supabase delete itself won't error if ID not found,
        # but will return an empty data array.
        check_response = supabase.table('programs').select('id').eq('id', program_id).maybe_single().execute()
        if not check_response.data:
             return jsonify({"error": "Program not found"}), 404

        response = supabase.table('programs').delete().eq('id', program_id).execute()

        if hasattr(response, 'error') and response.error:
            print(f"Supabase error (delete_program for ID {program_id}): {response.error}")
            return jsonify({"error": response.error.message, "details": str(response.error)}), 500
        
        # If delete was successful and data was returned (the deleted record)
        if response.data:
            return jsonify({"message": "Program deleted successfully", "deleted_record": response.data[0]}), 200
        else:
            # This case could mean the record was already deleted, or RLS prevented deletion without an error.
            return jsonify({"message": "Program deletion command executed. Record might have been already deleted or RLS prevented it."}), 200

    except Exception as e:
        print(f"Exception in delete_program for ID {program_id}: {e}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500