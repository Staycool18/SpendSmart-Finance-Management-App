from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from finance_tracker.extensions import db
from finance_tracker.models.user import User
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity,
    JWTManager
)
import logging
from datetime import datetime, timedelta
from plaid.api import plaid_api
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.configuration import Configuration
from plaid.api_client import ApiClient
from plaid.exceptions import ApiException

auth_bp = Blueprint('auth', __name__)

# Initialize JWT
jwt = JWTManager()

# Initialize Plaid client
configuration = Configuration(
     host=Configuration(host="sandbox.plaid.com"),  # Or .Development/.Production
    api_key={
        'clientId': 'your_plaid_client_id',
        'secret': 'your_plaid_secret',
    }
)
api_client = ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        if not all(field in data for field in required_fields):
            missing = [f for f in required_fields if f not in data]
            return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

        # Normalize email
        email = data['email'].strip().lower()
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 409

        # Validate password
        if len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400

        # Create user - password will be hashed automatically
        user = User(
            name=data['name'].strip(),
            email=email
        )
        user.password = data['password']  # This triggers the hashing
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email
            }
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        logging.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
        
    try:
        # Ensure request has JSON data
        if not request.is_json:
            return jsonify({
                "status": "error",
                "message": "Request must be JSON",
                "error": "invalid_request"
            }), 400

        data = request.get_json()
        
        # Validate required fields
        email = data.get('email', '').strip().lower()
        password = str(data.get('password', '')).strip()

        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password are required",
                "error": "missing_credentials"
            }), 400

        # Find user and verify password
        user = User.query.filter_by(email=email).first()
        if not user or not user.verify_password(password):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password",
                "error": "invalid_credentials"
            }), 401

        # Create token with additional claims
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "email": user.email,
                "name": user.name
            }
        )

        # Construct complete response
        response_data = {
            "status": "success",
            "data": {
                "access_token": access_token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email
                }
            }
        }
        
        return jsonify(response_data), 200

    except Exception as e:
        logging.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "error": "server_error"
        }), 500

@auth_bp.route('/api/dashboard', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_dashboard():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
        
    try:
        # Get identity as string
        user_id = str(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Check Plaid integration
        if not hasattr(user, 'plaid_access_token') or not user.plaid_access_token:
            return jsonify({
                "error": "Plaid integration not complete",
                "solution": "Complete Plaid link flow"
            }), 422

        # Demo data - replace with actual implementation
        dashboard_data = {
            "welcome_message": f"Welcome back, {user.name}",
            "stats": {
                "total_balance": 12543.21,
                "monthly_income": 5432.10,
                "monthly_expenses": 3210.54,
                "net_worth": 93210.87
            },
            "recent_transactions": [
                {
                    "id": 1,
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "description": "Sample Transaction",
                    "amount": -125.50,
                    "category": "Food"
                }
            ],
            "accounts": [
                {
                    "id": "sample_account",
                    "name": "Sample Account",
                    "balance": 1103.42,
                    "type": "checking"
                }
            ]
        }

        return jsonify(dashboard_data), 200

    except Exception as e:
        logging.error(f"Dashboard error: {str(e)}")
        return jsonify({"error": "Failed to load dashboard data"}), 500

@auth_bp.route('/api/plaid/exchange_token', methods=['POST', 'OPTIONS'])
@jwt_required()
def exchange_plaid_token():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
        
    try:
        public_token = request.json.get('public_token')
        if not public_token:
            return jsonify({"error": "Missing public token"}), 400

        user_id = str(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Create and execute Plaid request
        request_obj = ItemPublicTokenExchangeRequest(
            public_token=public_token
        )
        response = plaid_client.item_public_token_exchange(request_obj)
        
        # Store tokens
        user.plaid_access_token = response.access_token
        user.plaid_item_id = response.item_id
        db.session.commit()
        
        return jsonify({"status": "success"}), 200
        
    except ApiException as e:
        logging.error(f"Plaid API error: {str(e)}")
        return jsonify({
            "error": "Plaid API error",
            "details": e.body
        }), 422
    except Exception as e:
        logging.error(f"Token exchange error: {str(e)}")
        return jsonify({"error": "Failed to exchange Plaid token"}), 422

def _build_cors_preflight_response():
    response = jsonify({'message': 'CORS preflight'})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    return response