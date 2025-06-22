from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from finance_tracker.extensions import db

def to_dict(self):
    return {
        'id': self.id,
        'name': self.name,
        'email': self.email,
        'created_at': self.created_at.isoformat()
    }

class User(db.Model):
    __tablename__ = 'users'  # Explicit table name
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)  # Make sure this exists
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        """Create hashed password with default werkzeug parameters"""
        if not password:
            raise ValueError('Password cannot be empty')
        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters')
        # Use default werkzeug hashing (pbkdf2:sha256)
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        """Check hashed password"""
        return check_password_hash(self.password_hash, password)
        
    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        """Serialize user object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
