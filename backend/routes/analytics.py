from flask import Blueprint, request, jsonify
from models import db, ModerationRecord, Feedback, Template
from sqlalchemy import func
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        total = ModerationRecord.query.count()
        
        # 1. Verdict breakdown
        verdict_counts = {'ALLOW': 0, 'NEEDS_REVIEW': 0, 'REJECT': 0}
        verdict_grouped = db.session.query(
            ModerationRecord.verdict, 
            func.count(ModerationRecord.id)
        ).group_by(ModerationRecord.verdict).all()
        
        for v_type, count in verdict_grouped:
            if v_type in verdict_counts:
                verdict_counts[v_type] = count
                
        # 2. Averages
        avg_conf = db.session.query(func.avg(ModerationRecord.confidence_score)).scalar()
        avg_confidence = round(float(avg_conf) * 100, 1) if avg_conf is not None else 0.0
        
        avg_time = db.session.query(func.avg(ModerationRecord.response_time_ms)).scalar()
        avg_response_time = round(float(avg_time), 1) if avg_time is not None else 0.0
        
        # 3. Category frequency
        categories = ["Positive", "Neutral", "Constructive", "Abusive", "Hate Speech", "Defamation", "Political Inflammatory", "Spam", "Borderline"]
        flag_freq = {cat: 0 for cat in categories}
        
        cat_grouped = db.session.query(
            ModerationRecord.category, 
            func.count(ModerationRecord.id)
        ).group_by(ModerationRecord.category).all()
        
        for cat_name, count in cat_grouped:
            if cat_name in flag_freq:
                flag_freq[cat_name] = count
            else:
                flag_freq[cat_name] = flag_freq.get(cat_name, 0) + count
                    
        # 4. Daily Volume (last 14 days)
        daily_volume = []
        today = datetime.utcnow().date()
        for i in range(13, -1, -1):
            d = today - timedelta(days=i)
            d_str = d.strftime('%d/%m')  # Matching x-axis dates (DD/MM)
            count = db.session.query(func.count(ModerationRecord.id)).filter(
                func.date(ModerationRecord.created_at) == d
            ).scalar() or 0
            daily_volume.append({'date': d_str, 'count': count})
            
        # 5. Quality Trend / Avg Rating (last 14 days)
        quality_trend = []
        for i in range(13, -1, -1):
            d = today - timedelta(days=i)
            d_str = d.strftime('%d/%m')
            avg_val = db.session.query(func.avg(Feedback.rating)).filter(
                func.date(Feedback.created_at) == d
            ).scalar()
            quality_trend.append({
                'date': d_str,
                'avg_rating': round(float(avg_val), 1) if avg_val is not None else 0.0
            })
            
        # 6. Allow Rate (Card 2)
        allow_count = verdict_counts.get('ALLOW', 0)
        allow_rate = round((allow_count / total) * 100, 1) if total > 0 else 0.0
        
        # 7. Pending editor decisions
        pending_editor_decisions = ModerationRecord.query.filter(
            (ModerationRecord.verdict == 'NEEDS_REVIEW') & 
            (ModerationRecord.editor_verdict.is_(None))
        ).count()
        
        return jsonify({
            'total_comments_moderated': total,
            'verdict_breakdown': verdict_counts,
            'average_confidence_score': avg_confidence,
            'average_response_time_ms': avg_response_time,
            'flag_category_frequency': flag_freq,
            'daily_volume': daily_volume,
            'quality_trend': quality_trend,
            'safe_to_publish_rate': allow_rate,
            'pending_editor_decisions': pending_editor_decisions
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve analytics: {str(e)}'}), 500


@analytics_bp.route('/templates', methods=['GET'])
def get_templates():
    try:
        templates = Template.query.order_by(Template.created_at.desc()).all()
        return jsonify([t.to_dict() for t in templates]), 200
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
        template = Template(
            name=name,
            article_title=article_title,
            sample_comment=sample_comment,
            category=category
        )
        db.session.add(template)
        db.session.commit()
        return jsonify(template.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create template: {str(e)}'}), 500
