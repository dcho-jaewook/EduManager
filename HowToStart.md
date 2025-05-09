# Backend Setup (macOS/Linux)
// virtual environment setup
cd backend/
python3 -m venv venv // only once
source venv/bin/activate
pip install -r requirements.txt

// to run the server
flask run

(or)

python app.py

// to exit venv
deactivate

// after installing a module through pip
pip freeze > requirements.txt