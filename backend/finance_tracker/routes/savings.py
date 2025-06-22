from flask import Blueprint, jsonify, request
from finance_tracker import db
from finance_tracker.models.savings import SavingsGoal, SavingsRule
from finance_tracker.utils.auth import login_required
from datetime import datetime

savings_bp = Blueprint('savings', __name__)

@savings_bp.route('/goals', methods=['GET'])
@login_required
def get_goals(current_user):
    goals = SavingsGoal.query.filter_by(user_id=current_user.id).all()
    return jsonify([goal.to_dict() for goal in goals])

@savings_bp.route('/goals', methods=['POST'])
@login_required
def create_goal(current_user):
    data = request.get_json()
    
    if not data.get('name') or not data.get('target_amount'):
        return jsonify({'error': 'Name and target amount are required'}), 400
    
    deadline = None
    if data.get('deadline'):
        try:
            deadline = datetime.fromisoformat(data['deadline'])
        except ValueError:
            return jsonify({'error': 'Invalid deadline format'}), 400
    
    goal = SavingsGoal(
        user_id=current_user.id,
        name=data['name'],
        target_amount=float(data['target_amount']),
        deadline=deadline
    )
    
    db.session.add(goal)
    db.session.commit()
    
    return jsonify(goal.to_dict()), 201

@savings_bp.route('/goals/<int:goal_id>', methods=['PUT'])
@login_required
def update_goal(current_user, goal_id):
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=current_user.id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    
    if data.get('name'):
        goal.name = data['name']
    if data.get('target_amount'):
        goal.target_amount = float(data['target_amount'])
    if data.get('current_amount'):
        goal.current_amount = float(data['current_amount'])
    if data.get('deadline'):
        try:
            goal.deadline = datetime.fromisoformat(data['deadline'])
        except ValueError:
            return jsonify({'error': 'Invalid deadline format'}), 400
    
    db.session.commit()
    return jsonify(goal.to_dict())

@savings_bp.route('/goals/<int:goal_id>', methods=['DELETE'])
@login_required
def delete_goal(current_user, goal_id):
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=current_user.id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    db.session.delete(goal)
    db.session.commit()
    return '', 204

@savings_bp.route('/rules', methods=['GET'])
@login_required
def get_rules(current_user):
    rules = SavingsRule.query.filter_by(user_id=current_user.id).all()
    return jsonify([rule.to_dict() for rule in rules])

@savings_bp.route('/rules', methods=['POST'])
@login_required
def create_rule(current_user):
    data = request.get_json()
    
    if not data.get('type'):
        return jsonify({'error': 'Rule type is required'}), 400
    
    rule_type = data['type']
    if rule_type not in ['round-up', 'percentage', 'fixed']:
        return jsonify({'error': 'Invalid rule type'}), 400
    
    if rule_type == 'percentage' and not data.get('percentage'):
        return jsonify({'error': 'Percentage is required for percentage-based rules'}), 400
    if rule_type == 'fixed' and not data.get('amount'):
        return jsonify({'error': 'Amount is required for fixed rules'}), 400
    
    rule = SavingsRule(
        user_id=current_user.id,
        type=rule_type,
        amount=float(data['amount']) if rule_type == 'fixed' else None,
        percentage=float(data['percentage']) if rule_type == 'percentage' else None,
        is_active=data.get('is_active', True)
    )
    
    db.session.add(rule)
    db.session.commit()
    
    return jsonify(rule.to_dict()), 201

@savings_bp.route('/rules/<int:rule_id>', methods=['PUT'])
@login_required
def update_rule(current_user, rule_id):
    rule = SavingsRule.query.filter_by(id=rule_id, user_id=current_user.id).first()
    if not rule:
        return jsonify({'error': 'Rule not found'}), 404
    
    data = request.get_json()
    
    if data.get('is_active') is not None:
        rule.is_active = data['is_active']
    if data.get('amount') and rule.type == 'fixed':
        rule.amount = float(data['amount'])
    if data.get('percentage') and rule.type == 'percentage':
        rule.percentage = float(data['percentage'])
    
    db.session.commit()
    return jsonify(rule.to_dict())

@savings_bp.route('/rules/<int:rule_id>', methods=['DELETE'])
@login_required
def delete_rule(current_user, rule_id):
    rule = SavingsRule.query.filter_by(id=rule_id, user_id=current_user.id).first()
    if not rule:
        return jsonify({'error': 'Rule not found'}), 404
    
    db.session.delete(rule)
    db.session.commit()
    return '', 204

@savings_bp.route('/calculate', methods=['GET'])
@login_required
def calculate_savings(current_user):
    # Get user's monthly income and expenses
    monthly_data = current_user.get_monthly_data()
    
    # Get active savings rules
    rules = SavingsRule.query.filter_by(user_id=current_user.id, is_active=True).all()
    
    total_savings = 0
    for rule in rules:
        if rule.type == 'round-up':
            # Round up each transaction to nearest dollar
            rounded_expenses = round(monthly_data['expenses'])
            total_savings += rounded_expenses - monthly_data['expenses']
        elif rule.type == 'percentage':
            total_savings += (monthly_data['income'] * rule.percentage) / 100
        elif rule.type == 'fixed':
            total_savings += rule.amount
    
    return jsonify({
        'total_savings': total_savings,
        'monthly_income': monthly_data['income'],
        'monthly_expenses': monthly_data['expenses']
    }) 