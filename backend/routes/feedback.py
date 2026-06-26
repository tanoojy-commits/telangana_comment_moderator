from flask import Blueprint, request, jsonify
from models import db, Feedback, ModerationRecord
from sqlalchemy import func

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json() or {}
    
    record_id = data.get('record_id')
    rating = data.get('rating')
    comment = data.get('comment', '').strip()
    
    # Validation
    if not record_id:
        return jsonify({'error': 'Record ID is required.'}), 400
    if rating is None:
        return jsonify({'error': 'Rating is required.'}), 400
    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            raise ValueError()
    except ValueError:
        return jsonify({'error': 'Rating must be an integer between 1 and 5.'}), 400
        
    # Check if record exists
    record = ModerationRecord.query.get(record_id)
    if not record:
        return jsonify({'error': 'Moderation record not found.'}), 404
        
    try:
        # Create Feedback
        feedback = Feedback(
            record_id=record_id,
            rating=rating,
            comment=comment if comment else None
        )
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback submitted successfully.',
            'feedback': feedback.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save feedback: {str(e)}'}), 500


@feedback_bp.route('/feedback/summary', methods=['GET'])
def get_feedback_summary():
    try:
        total = Feedback.query.count()
        if total == 0:
            return jsonify({
                'average_rating': 0.0,
                'total_feedback': 0,
                'rating_distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            }), 200
            
        avg_rating_query = db.session.query(func.avg(Feedback.rating)).scalar()
        average_rating = round(float(avg_rating_query), 2) if avg_rating_query else 0.0
        
        # Build rating distribution
        dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        counts = db.session.query(Feedback.rating, func.count(Feedback.id)).group_by(Feedback.rating).all()
        for rating, count in counts:
            if rating in dist:
                dist[rating] = count
                
        return jsonify({
            'average_rating': average_rating,
            'total_feedback': total,
            'rating_distribution': dist
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve feedback summary: {str(e)}'}), 500
