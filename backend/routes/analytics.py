from flask import Blueprint, request, jsonify
from firebase_store import create_template as save_template
from firebase_store import get_analytics_data, list_templates

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        return jsonify(get_analytics_data()), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve analytics: {str(e)}'}), 500


@analytics_bp.route('/templates', methods=['GET'])
def get_templates():
    try:
        return jsonify(list_templates()), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve templates: {str(e)}'}), 500


@analytics_bp.route('/templates', methods=['POST'])
def create_template():
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    article_title = data.get('article_title', '').strip()
    sample_comment = data.get('sample_comment', '').strip()
    category = data.get('category', '').strip()
    
    # Validation
    if not name:
        return jsonify({'error': 'Template name is required.'}), 400
    if not article_title:
        return jsonify({'error': 'Article title is required.'}), 400
    if not sample_comment:
        return jsonify({'error': 'Sample comment is required.'}), 400
    if not category:
        return jsonify({'error': 'Category is required.'}), 400

    try:
        template = save_template({
            'name': name,
            'article_title': article_title,
            'sample_comment': sample_comment,
            'category': category
        })
        return jsonify(template), 201
    except Exception as e:
        return jsonify({'error': f'Failed to create template: {str(e)}'}), 500
