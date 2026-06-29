import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key-123456')
    DEBUG = True

    # Gemini API Key
    gemini_key = os.environ.get('GEMINI_API_KEY', '')
    GEMINI_API_KEY = gemini_key.strip() if gemini_key else None

    # Firebase / Firestore
    DATABASE_ENGINE = 'firebase'
    
    firebase_project_id = os.environ.get('FIREBASE_PROJECT_ID', '')
    FIREBASE_PROJECT_ID = firebase_project_id.strip() if firebase_project_id else None
    
    firebase_credentials_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', '')
    FIREBASE_CREDENTIALS_PATH = firebase_credentials_path.strip() if firebase_credentials_path else None
    
    firebase_service_account_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON', '')
    FIREBASE_SERVICE_ACCOUNT_JSON = firebase_service_account_json.strip() if firebase_service_account_json else None
