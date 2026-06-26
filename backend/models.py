from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class ModerationRecord(db.Model):
    __tablename__ = 'moderation_record'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    article_title = db.Column(db.Text, nullable=False)
    reader_name = db.Column(db.String(255), nullable=False)
    comment_text = db.Column(db.Text, nullable=False)
    prompt_version = db.Column(db.String(20), default='v5')
    
    # Strictly ALLOW, NEEDS_REVIEW, REJECT
    verdict = db.Column(
        db.Enum('ALLOW', 'NEEDS_REVIEW', 'REJECT', name='verdict_enum'),
        nullable=False
    )
    
    category = db.Column(db.String(100), nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    problematic_phrases = db.Column(db.JSON, nullable=False) # Stores array of strings
    safe_to_publish = db.Column(db.Boolean, nullable=False)
    
    editor_note = db.Column(db.Text, nullable=True)
    suggested_edit = db.Column(db.Text, nullable=True)
    
    # Human decisions
    editor_verdict = db.Column(db.String(20), nullable=True) # ALLOW or REJECT
    editor_decision_note = db.Column(db.Text, nullable=True)
    decided_at = db.Column(db.DateTime, nullable=True)
    
    response_time_ms = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to feedback
    feedbacks = db.relationship('Feedback', backref='record', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'article_title': self.article_title,
            'reader_name': self.reader_name,
            'comment_text': self.comment_text,
            'prompt_version': self.prompt_version,
            'verdict': self.verdict,
            'category': self.category,
            'confidence_score': self.confidence_score,
            'reason': self.reason,
            'problematic_phrases': self.problematic_phrases,
            'safe_to_publish': self.safe_to_publish,
            'editor_note': self.editor_note,
            'suggested_edit': self.suggested_edit,
            'editor_verdict': self.editor_verdict,
            'editor_decision_note': self.editor_decision_note,
            'decided_at': (self.decided_at.isoformat() + 'Z') if self.decided_at else None,
            'response_time_ms': self.response_time_ms,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None
        }


class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    record_id = db.Column(db.Integer, db.ForeignKey('moderation_record.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'record_id': self.record_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None
        }


class Template(db.Model):
    __tablename__ = 'template'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    article_title = db.Column(db.Text, nullable=False)
    sample_comment = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'article_title': self.article_title,
            'sample_comment': self.sample_comment,
            'category': self.category,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None
        }
