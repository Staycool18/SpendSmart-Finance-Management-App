from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from finance_tracker.models.user import User

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
                
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Authentication required'}), 401
            
    return decorated_function 