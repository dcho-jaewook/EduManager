# backend/app.py
import os
from flask import Flask, jsonify
from flask_cors import CORS # For Cross-Origin Resource Sharing

# Import the Blueprint from program.py
# Ensure program.py is in the same directory (backend/)
from program import program_bp 
# The db.py file handles dotenv and Supabase client initialization,
# so we don't need to import dotenv or supabase client here directly.

# --- Initialize Flask App ---
app = Flask(__name__)

# --- CORS Configuration ---
# This allows requests from any origin. For production, you should restrict this
# to the domain of your frontend application.
# Example: CORS(app, resources={r"/api/*": {"origins": "https://yourfrontenddomain.com"}})
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

# --- Register Blueprints ---
# Register the program Blueprint. All routes defined in program_bp
# will be active and prefixed with /api/programs (as defined in program.py).
app.register_blueprint(program_bp)

# You can register other blueprints here as your application grows:
# from classes import class_bp # Assuming you create class_routes.py
# app.register_blueprint(class_bp, url_prefix='/api/classes')
# from users import user_bp # Assuming you create user_routes.py
# app.register_blueprint(user_bp, url_prefix='/api/users')


# --- Basic Root Route & App-Level Error Handlers ---
@app.route('/')
def home():
    """A simple route to confirm the backend is running."""
    return "EduManager Backend is running! Access API endpoints under /api/..."

@app.errorhandler(404)
def resource_not_found(e):
    """Handles 404 errors with a JSON response."""
    return jsonify(error=str(e), message="The requested resource was not found on the server."), 404

@app.errorhandler(500)
def internal_server_error(e):
    """Handles 500 internal server errors with a JSON response."""
    # It's good practice to log the actual error for debugging on the server side
    print(f"Internal Server Error: {e}")
    return jsonify(error=str(e), message="An internal server error occurred."), 500

@app.errorhandler(Exception) # A catch-all for other unhandled exceptions
def unhandled_exception(e):
    """Handles any other unhandled exceptions with a JSON response."""
    print(f"Unhandled Exception: {e}") # Log the full error
    return jsonify(error=str(e), message="An unexpected error occurred."), 500


# --- Main Execution Block ---
if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get("PORT", 5000))
    
    # Determine debug mode.
    # For development, set FLASK_ENV=development or FLASK_DEBUG=1 in your .env or environment.
    # `flask run` automatically uses FLASK_ENV.
    # If running `python app.py` directly:
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1", "t") or \
                 os.environ.get("FLASK_ENV", "production").lower() == "development"

    # Run the Flask development server.
    # host='0.0.0.0' makes the server accessible from any network interface,
    # which is useful for testing from other devices or in containerized environments.
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
