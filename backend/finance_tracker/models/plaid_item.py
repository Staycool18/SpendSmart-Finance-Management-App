from datetime import datetime
from finance_tracker.extensions import db

class PlaidItem(db.Model):
    __tablename__ = 'plaid_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plaid_item_id = db.Column(db.String(255), unique=True, nullable=False)
    access_token = db.Column(db.String(255), unique=True, nullable=False)
    institution_id = db.Column(db.String(255))
    institution_name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('plaid_items', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plaid_item_id': self.plaid_item_id,
            'institution_id': self.institution_id,
            'institution_name': self.institution_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
