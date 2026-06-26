import os
import urllib.parse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key-123456')
    DEBUG = True
    
    # Gemini API Key
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    
    DATABASE_URL = os.environ.get('DATABASE_URL')
    USE_MYSQL = os.environ.get('USE_MYSQL', '').lower() in ('1', 'true', 'yes', 'on')

    # MySQL Workbench uses the same MySQL server credentials configured below.
    mysql_host = os.environ.get('MYSQL_HOST', '').strip()
    if USE_MYSQL and not mysql_host:
        mysql_host = 'localhost'
    mysql_pw = os.environ.get('MYSQL_PASSWORD', '')
    mysql_user = os.environ.get('MYSQL_USER', 'root').strip()
    mysql_db = os.environ.get('MYSQL_DB', 'telangana_moderation').strip()
    mysql_port = os.environ.get('MYSQL_PORT', '3306').strip()
    placeholder_passwords = {'your_password', 'your_mysql_password_here'}

    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
        DATABASE_ENGINE = DATABASE_URL.split(':', 1)[0]
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,
            "pool_recycle": 3600
        } if DATABASE_URL.startswith('mysql') else {}
    elif USE_MYSQL or mysql_host:
        MYSQL_HOST = mysql_host
        MYSQL_PORT = mysql_port
        MYSQL_USER = mysql_user
        MYSQL_PASSWORD = '' if mysql_pw in placeholder_passwords else mysql_pw
        MYSQL_DB = mysql_db

        # URL-encode the password to escape special characters like '@'
        encoded_password = urllib.parse.quote_plus(MYSQL_PASSWORD)

        SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{encoded_password}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
        DATABASE_ENGINE = 'mysql'
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,
            "pool_recycle": 3600,
            "pool_size": 10,
            "max_overflow": 20
        }
    else:
        # SQLite fallback: Combines the database directly inside the project folder
        if 'VERCEL' in os.environ or 'AWS_LAMBDA_FUNCTION_NAME' in os.environ:
            db_path = '/tmp/telangana_moderation.db'
        else:
            db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'telangana_moderation.db')
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
        DATABASE_ENGINE = 'sqlite'
        SQLALCHEMY_ENGINE_OPTIONS = {}

    SQLALCHEMY_TRACK_MODIFICATIONS = False
