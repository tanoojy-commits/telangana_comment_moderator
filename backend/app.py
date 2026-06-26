from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import logging
import os
import pymysql

from config import Config
from models import db
from routes.generate import generate_bp
from routes.history import history_bp
from routes.feedback import feedback_bp
from routes.analytics import analytics_bp

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def ensure_mysql_database(app):
    if app.config.get('DATABASE_ENGINE') != 'mysql' or not app.config.get('MYSQL_HOST'):
        return

    db_name = app.config.get('MYSQL_DB')
    safe_db_name = db_name.replace('`', '``')

    connection = pymysql.connect(
        host=app.config.get('MYSQL_HOST'),
        port=int(app.config.get('MYSQL_PORT', 3306)),
        user=app.config.get('MYSQL_USER'),
        password=app.config.get('MYSQL_PASSWORD', ''),
        charset='utf8mb4',
        autocommit=True
    )
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{safe_db_name}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
    finally:
        connection.close()

def create_app(config_class=Config):
    # Set up static folder path pointing to Vite's output dist directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.abspath(os.path.join(base_dir, '..', 'frontend', 'dist'))
    
    if os.path.exists(dist_dir):
        app = Flask(__name__, static_folder=dist_dir, static_url_path='')
    else:
        app = Flask(__name__)
        
    app.config.from_object(config_class)
    
    # Enable CORS for development and production domains
    allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
    CORS(app, resources={r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})
    
    # Initialize DB
    try:
        ensure_mysql_database(app)
    except Exception as e:
        logger.error(f"Error preparing MySQL database: {str(e)}")

    db.init_app(app)
    
    # Register blueprints with /api prefix
    app.register_blueprint(generate_bp, url_prefix='/api')
    app.register_blueprint(history_bp, url_prefix='/api')
    app.register_blueprint(feedback_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    
    # Health Check API
    @app.route('/api/health', methods=['GET'])
    def health_check():
        database = {
            'engine': app.config.get('DATABASE_ENGINE', 'unknown'),
            'connected': False
        }
        try:
            db.session.execute(db.select(1))
            database['connected'] = True
        except Exception as e:
            database['error'] = str(e)

        return jsonify({
            'status': 'ok',
            'timestamp': datetime.utcnow().isoformat(),
            'database': database
        }), 200
        
    # Catch-all route to serve React's built static files
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api/'):
            return jsonify({'error': 'API endpoint not found.'}), 404
            
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')
        
    # Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({'error': 'Resource not found.'}), 404
        
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({'error': 'An internal server error occurred.'}), 500
        
    # Initialize Database Tables
    with app.app_context():
        try:
            # Tables are created if they do not exist.
            # Schema alterations have already run, so we can persist all records across restarts.
            db.create_all()
            logger.info("Database tables initialized successfully for v5.")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}")
            
    return app

app = create_app()

if __name__ == '__main__':
    logger.info("Starting combined Telangana Today AI Comment Moderator service...")
    app.run(host='0.0.0.0', port=5000, debug=True)
