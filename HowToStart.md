# Backend Setup (macOS/Linux)
// virtual environment setup
cd backend/
python3 -m venv venv
source .venv/bin/activate
pip install -r requirements.txt

// to run the server
flask run

(or)

python app.py

// to exit venv
deactivate