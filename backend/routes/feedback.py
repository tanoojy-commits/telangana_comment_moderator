from flask import Blueprint, request, jsonify
from firebase_store import create_feedback, get_feedback_summary_data, get_moderation_record

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
    record = get_moderation_record(record_id)
    if not record:
        return jsonify({'error': 'Moderation record not found.'}), 404

    try:
        feedback = create_feedback(record_id, rating, comment if comment else None)
        return jsonify({
            'message': 'Feedback submitted successfully.',
            'feedback': feedback
        }), 201
    except Exception as e:
        return jsonify({'error': f'Failed to save feedback: {str(e)}'}), 500


@feedback_bp.route('/feedback/summary', methods=['GET'])
def get_feedback_summary():
    try:
        average_rating, total, dist = get_feedback_summary_data()
        return jsonify({
            'average_rating': average_rating,
            'total_feedback': total,
            'rating_distribution': dist
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve feedback summary: {str(e)}'}), 500
