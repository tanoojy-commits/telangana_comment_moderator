from flask import Blueprint, request, jsonify
from firebase_store import (
    delete_moderation_record,
    get_moderation_record,
    list_feedback,
    list_moderation_records,
    save_editor_decision,
)
import math

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['GET'])
def get_history():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    verdict_filter = request.args.get('verdict', '').strip()
    search_query = request.args.get('search', '').strip()

    items, total = list_moderation_records(page, limit, verdict_filter, search_query)
    pages = math.ceil(total / limit) if total > 0 else 1

    return jsonify({
        'items': items,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': pages
    }), 200


@history_bp.route('/history/<record_id>', methods=['GET'])
def get_history_detail(record_id):
    record = get_moderation_record(record_id)
    if not record:
        return jsonify({'error': 'Moderation record not found.'}), 404

    record['feedback'] = list_feedback(record_id)
    return jsonify(record), 200


@history_bp.route('/history/<record_id>', methods=['DELETE'])
def delete_history_item(record_id):
    deleted = delete_moderation_record(record_id)
    if not deleted:
        return jsonify({'error': 'Moderation record not found.'}), 404

    return jsonify({'message': f'Record {record_id} successfully deleted.'}), 200


@history_bp.route('/history/<record_id>/editor-decision', methods=['POST'])
def save_editor_decision(record_id):
    record = get_moderation_record(record_id)
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
        updated = save_editor_decision(record_id, editor_verdict, editor_decision_note)
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({'error': f'Failed to save editor decision: {str(e)}'}), 500
