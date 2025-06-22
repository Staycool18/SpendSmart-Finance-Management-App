from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path
import os
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import timedelta

# Initialize extensions
from .extensions import db, jwt, migrate

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure database with absolute path
    instance_path = Path(__file__).parent.parent / "instance"
    instance_path.mkdir(exist_ok=True)
    db_path = instance_path / "finance_tracker.db"
    
    # Unified configuration
    app.config.update(
        SECRET_KEY=os.getenv('SECRET_KEY', 'your-secret-key-here'),
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key'),
        SQLALCHEMY_DATABASE_URI=f'sqlite:///{db_path.as_posix()}',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=1)
    )

    # Initialize CORS with specific configurations
    CORS(app, resources={
    r"/auth/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    },
    r"/api/*": {
        "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.api import api_bp
    from .routes.savings import savings_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(savings_bp, url_prefix='/api/savings')

    # Initialize database
    with app.app_context():
        try:
            db.create_all()
            print(f"Database initialized at: {db_path}")
        except Exception as e:
            print(f"Database initialization error: {str(e)}")

    return app