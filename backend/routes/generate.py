from flask import Blueprint, request, jsonify
from models import db, ModerationRecord
from prompt_engine import build_moderation_prompt
from gemini_client import call_gemini
import concurrent.futures

generate_bp = Blueprint('generate', __name__)

def moderate_single_comment_task(comment_data):
    """
    Helper task run inside a ThreadPoolExecutor to moderate a comment in a batch.
    """
    article_title = comment_data.get('article_title', '').strip()
    reader_name = comment_data.get('reader_name', '').strip()
    comment_text = comment_data.get('comment_text', '').strip()
    
    if not article_title or not reader_name or not comment_text:
        return {
            'error': 'Missing fields',
            'comment_data': comment_data
        }
        
    prompt = build_moderation_prompt(article_title, reader_name, comment_text)
    ai_response, response_time_ms = call_gemini(prompt)
    
    return {
        'comment_data': comment_data,
        'ai_response': ai_response,
        'response_time_ms': response_time_ms
    }

@generate_bp.route('/generate', methods=['POST'])
def generate_moderation():
    data = request.get_json() or {}
    
    article_title = data.get('article_title', '').strip()
    reader_name = data.get('reader_name', '').strip()
    comment_text = data.get('comment_text', '').strip()
    
    # Validation
    if not article_title:
        return jsonify({'error': 'Article title is required.'}), 400
    if not reader_name:
        return jsonify({'error': 'Reader name is required.'}), 400
    if not comment_text:
        return jsonify({'error': 'Comment text is required.'}), 400
    if len(comment_text) < 10:
        return jsonify({'error': 'Comment must be at least 10 characters long.'}), 400
        
    # Build prompt
    prompt = build_moderation_prompt(article_title, reader_name, comment_text)
    
    # Call AI
    ai_res, response_time_ms = call_gemini(prompt)
    
    try:
        # Save record to database
        record = ModerationRecord(
            article_title=article_title,
            reader_name=reader_name,
            comment_text=comment_text,
            prompt_version='v5',
            verdict=ai_res.get('verdict', 'NEEDS_REVIEW'),
            category=ai_res.get('category', 'Borderline'),
            confidence_score=ai_res.get('confidence_score', 0.0),
            reason=ai_res.get('reason', ''),
            problematic_phrases=ai_res.get('problematic_phrases', []),
            safe_to_publish=ai_res.get('safe_to_publish', False),
            editor_note=ai_res.get('editor_note'),
            suggested_edit=ai_res.get('suggested_edit'),
            response_time_ms=response_time_ms
        )
        db.session.add(record)
        db.session.commit()
        
        # Build response matching spec
        result = {
            'id': record.id,
            'verdict': record.verdict,
            'category': record.category,
            'confidence_score': record.confidence_score,
            'reason': record.reason,
            'problematic_phrases': record.problematic_phrases,
            'safe_to_publish': record.safe_to_publish,
            'editor_note': record.editor_note,
            'suggested_edit': record.suggested_edit,
            'response_time_ms': response_time_ms
        }
        return jsonify(result), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database save failed: {str(e)}'}), 500


@generate_bp.route('/generate/batch', methods=['POST'])
def generate_moderation_batch():
    data = request.get_json() or {}
    comments = data.get('comments', [])
    
    if not comments:
        return jsonify({'error': 'No comments provided.'}), 400
    if len(comments) > 10:
        return jsonify({'error': 'Batch size exceeds maximum limit of 10.'}), 400
        
    results = []
    
    # Run API calls in parallel using ThreadPoolExecutor
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(comments), 5)) as executor:
        futures = [executor.submit(moderate_single_comment_task, c) for c in comments]
        thread_results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
    # Process and save results in main thread
    for t_res in thread_results:
        if 'error' in t_res:
            results.append(t_res)
            continue
            
        c_data = t_res['comment_data']
        ai_res = t_res['ai_response']
        response_time_ms = t_res['response_time_ms']
        
        try:
            record = ModerationRecord(
                article_title=c_data.get('article_title'),
                reader_name=c_data.get('reader_name'),
                comment_text=c_data.get('comment_text'),
                prompt_version='v5',
                verdict=ai_res.get('verdict', 'NEEDS_REVIEW'),
                category=ai_res.get('category', 'Borderline'),
                confidence_score=ai_res.get('confidence_score', 0.0),
                reason=ai_res.get('reason', ''),
                problematic_phrases=ai_res.get('problematic_phrases', []),
                safe_to_publish=ai_res.get('safe_to_publish', False),
                editor_note=ai_res.get('editor_note'),
                suggested_edit=ai_res.get('suggested_edit'),
                response_time_ms=response_time_ms
            )
            db.session.add(record)
            db.session.commit()
            
            results.append({
                'id': record.id,
                'article_title': record.article_title,
                'reader_name': record.reader_name,
                'comment_text': record.comment_text,
                'verdict': record.verdict,
                'category': record.category,
                'confidence_score': record.confidence_score,
                'reason': record.reason,
                'problematic_phrases': record.problematic_phrases,
                'safe_to_publish': record.safe_to_publish,
                'editor_note': record.editor_note,
                'suggested_edit': record.suggested_edit,
                'response_time_ms': response_time_ms
            })
        except Exception as e:
            db.session.rollback()
            results.append({
                'error': f'Database save failed: {str(e)}',
                'comment_data': c_data
            })
            
    return jsonify(results), 200
