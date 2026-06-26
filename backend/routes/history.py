from flask import Blueprint, request, jsonify
from models import db, ModerationRecord, Feedback
from datetime import datetime
from sqlalchemy import case
import math

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['GET'])
def get_history():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    verdict_filter = request.args.get('verdict', '').strip()
    search_query = request.args.get('search', '').strip()
    
    query = ModerationRecord.query
    
    # Apply filter by verdict if specified
    if verdict_filter:
        v_filter = verdict_filter.upper()
        if v_filter == 'APPROVED':
            v_filter = 'ALLOW'
        elif v_filter == 'REJECTED':
            v_filter = 'REJECT'
        if v_filter in ['ALLOW', 'NEEDS_REVIEW', 'REJECT']:
            query = query.filter(ModerationRecord.verdict == v_filter)
        
    # Apply search filter if specified
    if search_query:
        query = query.filter(
            (ModerationRecord.article_title.like(f"%{search_query}%")) |
            (ModerationRecord.reader_name.like(f"%{search_query}%"))
        )
        
    # Sort order: NEEDS_REVIEW items with no editor decision float to TOP of the list, then newest first
    priority_case = case(
        (
            (ModerationRecord.verdict == 'NEEDS_REVIEW') & 
            (ModerationRecord.editor_verdict.is_(None))
        , 0),
        else_=1
    )
    query = query.order_by(priority_case, ModerationRecord.created_at.desc())
    
    # Manual pagination using limit and offset
    total = query.count()
    offset = (page - 1) * limit
    records = query.limit(limit).offset(offset).all()
    
    items = []
    for r in records:
        items.append({
            'id': r.id,
            'article_title': r.article_title,
            'reader_name': r.reader_name,
            'comment_text': r.comment_text,
            'verdict': r.verdict,
            'category': r.category,
            'confidence_score': r.confidence_score,
            'reason': r.reason,
            'problematic_phrases': r.problematic_phrases,
            'safe_to_publish': r.safe_to_publish,
            'editor_note': r.editor_note,
            'suggested_edit': r.suggested_edit,
            'editor_verdict': r.editor_verdict,
            'editor_decision_note': r.editor_decision_note,
            'decided_at': (r.decided_at.isoformat() + 'Z') if r.decided_at else None,
            'created_at': (r.created_at.isoformat() + 'Z') if r.created_at else None
        })
        
    pages = math.ceil(total / limit) if total > 0 else 1
    
    return jsonify({
        'items': items,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': pages
    }), 200


@history_bp.route('/history/<int:record_id>', methods=['GET'])
def get_history_detail(record_id):
    record = ModerationRecord.query.get(record_id)
    if not record:
        return jsonify({'error': 'Moderation record not found.'}), 404
        
    # Convert to dict and fetch associated feedbacks
    record_dict = record.to_dict()
    
    # Find any feedback associated with this record
    feedbacks = Feedback.query.filter_by(record_id=record_id).all()
    record_dict['feedback'] = [f.to_dict() for f in feedbacks]
    
    return jsonify(record_dict), 200


@history_bp.route('/history/<int:record_id>', methods=['DELETE'])
def delete_history_item(record_id):
    record = ModerationRecord.query.get(record_id)
    if not record:
        return jsonify({'error': 'Moderation record not found.'}), 404
        
    try:
        # Cascade delete is configured on models, so this will delete associated feedback as well
        db.session.delete(record)
        db.session.commit()
        return jsonify({'message': f'Record {record_id} successfully deleted.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete record: {str(e)}'}), 500


@history_bp.route('/history/<int:record_id>/editor-decision', methods=['POST'])
def save_editor_decision(record_id):
    record = ModerationRecord.query.get(record_id)
    if not record:
        return jsonify({'error': 'Moderation record not found.'}), 404
        
    data = request.get_json() or {}
    editor_verdict = data.get('editor_verdict')
    editor_decision_note = data.get('editor_decision_note', '')
    
    if not editor_verdict:
        return jsonify({'error': 'editor_verdict is required.'}), 400
        
    # Validation
    if editor_verdict not in ['ALLOW', 'REJECT']:
        return jsonify({'error': f'Invalid editor_verdict: {editor_verdict}'}), 400
        
    try:
        record.editor_verdict = editor_verdict
        record.editor_decision_note = editor_decision_note
        record.decided_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify(record.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save editor decision: {str(e)}'}), 500
