from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from finance_tracker.extensions import db
from finance_tracker.models.user import User
from datetime import datetime, timedelta
import openai
import os

api_bp = Blueprint('api', __name__)

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

def analyze_financial_health(data):
    """Analyze financial health and generate insights using GPT-4."""
    
    # Calculate financial health score (0-100)
    monthly_data = data['monthlyData']
    monthly_trend = data['monthlyTrend']
    categories = data['categoryDistribution']
    
    # Component 1: Savings Rate (0-30 points)
    income = monthly_data['income']
    expenses = monthly_data['expenses']
    savings_rate = ((income - expenses) / income * 100) if income > 0 else 0
    savings_score = min(30, (savings_rate / 20) * 30)  # 20% savings rate = full score
    
    # Component 2: Expense Management (0-30 points)
    expense_ratio = expenses / income if income > 0 else 1
    expense_score = max(0, 30 * (1 - expense_ratio))
    
    # Component 3: Category Balance (0-20 points)
    category_score = 20
    for category in categories:
        if category['percentage'] > 40:  # Penalize if any category is over 40%
            category_score -= 5
    category_score = max(0, category_score)
    
    # Component 4: Income Trend (0-20 points)
    if len(monthly_trend) >= 2:
        latest_income = monthly_trend[-1]['income']
        previous_income = monthly_trend[-2]['income']
        income_growth = ((latest_income - previous_income) / previous_income * 100) if previous_income > 0 else 0
        trend_score = min(20, max(0, 10 + (income_growth / 10) * 10))
    else:
        trend_score = 10

    # Calculate total score
    total_score = round(savings_score + expense_score + category_score + trend_score)
    
    # Generate insights and recommendations
    insights = []
    
    # Savings insights
    if savings_rate < 20:
        insights.append({
            "type": "savings",
            "title": "Improve Your Savings Rate",
            "description": f"Your current savings rate is {savings_rate:.1f}%. Aim for at least 20%.",
            "severity": "high" if savings_rate < 10 else "medium",
            "recommendation": "Consider automating your savings and reviewing non-essential expenses."
        })
    
    # Budget adherence
    high_spending_categories = [cat for cat in categories if cat['percentage'] > 30]
    if high_spending_categories:
        for category in high_spending_categories:
            insights.append({
                "type": "budget",
                "title": f"High Spending in {category['category']}",
                "description": f"Spending in {category['category']} is {category['percentage']}% of your budget.",
                "severity": "high" if category['percentage'] > 40 else "medium",
                "recommendation": f"Try to reduce {category['category']} expenses to below 30% of your budget."
            })
    
    # Financial health status
    health_status = "Excellent" if total_score >= 80 else "Good" if total_score >= 60 else "Fair" if total_score >= 40 else "Needs Improvement"
    insights.append({
        "type": "health",
        "title": "Financial Health Status",
        "description": f"Your financial health score is {total_score}/100 - {health_status}",
        "severity": "low" if total_score >= 60 else "medium" if total_score >= 40 else "high",
        "recommendation": "Focus on building emergency savings and maintaining a balanced budget."
    })
    
    # Monthly comparison
    if len(monthly_trend) >= 2:
        latest_expenses = monthly_trend[-1]['expenses']
        previous_expenses = monthly_trend[-2]['expenses']
        expense_change = ((latest_expenses - previous_expenses) / previous_expenses * 100) if previous_expenses > 0 else 0
        
        if expense_change > 10:
            insights.append({
                "type": "budget",
                "title": "Spending Increase Alert",
                "description": f"Your monthly expenses increased by {expense_change:.1f}%",
                "severity": "high" if expense_change > 20 else "medium",
                "recommendation": "Review your recent expenses and identify areas for reduction."
            })
    
    return {
        "score": total_score,
        "insights": insights
    }

@api_bp.route('/insights', methods=['POST'])
@jwt_required()
def get_insights():
    try:
        data = request.get_json()
        analysis = analyze_financial_health(data)
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Mock dashboard data (replace with real data later)
    dashboard_data = {
        'welcome_message': f'Welcome back, {user.name}',
        'stats': {
            'total_balance': 5000,
            'monthly_income': 3000,
            'monthly_expenses': 2000
        },
        'recent_transactions': [
            {'id': 1, 'description': 'Grocery Shopping', 'amount': -150, 'date': '2023-05-15'},
            {'id': 2, 'description': 'Paycheck', 'amount': 2000, 'date': '2023-05-01'},
            {'id': 3, 'description': 'Rent', 'amount': -1000, 'date': '2023-05-05'}
        ]
    }
    
    return jsonify(dashboard_data)

@api_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200