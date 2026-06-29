from flask import Blueprint, request, jsonify
from firebase_store import create_moderation_record
from prompt_engine import build_moderation_prompt
from gemini_client import call_gemini
from moderation_engine import check_spam_rules
import time
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

    start_time = time.time()
    rule_result = check_spam_rules(comment_text)
    if rule_result:
        verdict, category, confidence, reason = rule_result
        return {
            'comment_data': comment_data,
            'ai_response': {
                'verdict': verdict,
                'category': category,
                'confidence_score': confidence / 100.0,
                'reason': f"[Rule Filter] {reason}",
                'problematic_phrases': [],
                'safe_to_publish': False,
                'editor_note': "Bypassed Gemini AI due to deterministic moderation rules.",
                'suggested_edit': None,
                'quality_score': 0.0,
                'relevance_score': 0.0,
                'spam_score': 1.0 if category in ["Spam", "Gibberish"] else 0.0,
                'toxicity_score': 1.0 if category in ["Abuse", "Hate Speech", "Defamation"] else 0.0,
                'grammar_score': 0.0,
            },
            'response_time_ms': int((time.time() - start_time) * 1000)
        }

    prompt = build_moderation_prompt(article_title, reader_name, comment_text)
    ai_response, response_time_ms = call_gemini(prompt)

    if ai_response.get('verdict') == 'ALLOW':
        rule_result = check_spam_rules(comment_text)
        if rule_result:
            verdict, category, confidence, reason = rule_result
            ai_response['verdict'] = verdict
            ai_response['category'] = category
            ai_response['confidence_score'] = confidence / 100.0
            ai_response['reason'] = f"[Post-AI Override] {reason}"
            ai_response['problematic_phrases'] = []
            ai_response['safe_to_publish'] = False
            ai_response['editor_note'] = "Overrode Gemini ALLOW result due to deterministic moderation rules."
            ai_response['suggested_edit'] = None
            ai_response['quality_score'] = 0.0
            ai_response['spam_score'] = 1.0 if category in ["Spam", "Gibberish"] else 0.0
            ai_response['toxicity_score'] = 1.0 if category in ["Abuse", "Hate Speech", "Defamation"] else 0.0
    
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
        
    # Layer 1: Rule-Based Pre-AI Spam Filter
    start_time = time.time()
    pre_ai_result = check_spam_rules(comment_text)
    if pre_ai_result:
        verdict, category, confidence, reason = pre_ai_result
        response_time_ms = int((time.time() - start_time) * 1000)
        try:
            record = create_moderation_record({
                'article_title': article_title,
                'reader_name': reader_name,
                'comment_text': comment_text,
                'prompt_version': 'v6-rule-bypass',
                'verdict': verdict,
                'category': category,
                'confidence_score': confidence / 100.0,
                'reason': f"[Rule Filter] {reason}",
                'problematic_phrases': [],
                'safe_to_publish': False,
                'editor_note': "Bypassed Gemini AI due to deterministic moderation rules.",
                'suggested_edit': None,
                'response_time_ms': response_time_ms,
                'quality_score': 0.0,
                'relevance_score': 0.0,
                'spam_score': 1.0 if category in ["Spam", "Gibberish"] else 0.0,
                'toxicity_score': 1.0 if category in ["Abuse", "Hate Speech", "Defamation"] else 0.0,
                'grammar_score': 0.0
            })
            result = {
                'id': record['id'],
                'verdict': record['verdict'],
                'category': record['category'],
                'confidence_score': record['confidence_score'],
                'reason': record['reason'],
                'problematic_phrases': record['problematic_phrases'],
                'safe_to_publish': record['safe_to_publish'],
                'editor_note': record.get('editor_note'),
                'suggested_edit': record.get('suggested_edit'),
                'response_time_ms': response_time_ms,
                'quality_score': 0.0,
                'relevance_score': 0.0,
                'spam_score': 1.0 if category in ["Spam", "Gibberish"] else 0.0,
                'toxicity_score': 1.0 if category in ["Abuse", "Hate Speech", "Defamation"] else 0.0,
                'grammar_score': 0.0
            }
            return jsonify(result), 200
        except Exception as e:
            return jsonify({'error': f'Firebase save failed during rule bypass: {str(e)}'}), 500
        
    # Build prompt
    prompt = build_moderation_prompt(article_title, reader_name, comment_text)
    
    # Call AI
    ai_res, response_time_ms = call_gemini(prompt)
    
    # Layer 3: Post-AI Validation Rules Override
    if ai_res.get('verdict') == 'ALLOW':
        post_ai_result = check_spam_rules(comment_text)
        if post_ai_result:
            verdict, category, confidence, reason = post_ai_result
            ai_res['verdict'] = verdict
            ai_res['category'] = category
            ai_res['confidence_score'] = confidence / 100.0
            ai_res['reason'] = f"[Post-AI Override] {reason}"
            ai_res['safe_to_publish'] = False
            ai_res['quality_score'] = 0.0
            ai_res['spam_score'] = 1.0 if category in ["Spam", "Gibberish"] else 0.0
            ai_res['toxicity_score'] = 1.0 if category in ["Abuse", "Hate Speech", "Defamation"] else 0.0
    
    try:
        record = create_moderation_record({
            'article_title': article_title,
            'reader_name': reader_name,
            'comment_text': comment_text,
            'prompt_version': 'v6',
            'verdict': ai_res.get('verdict', 'NEEDS_REVIEW'),
            'category': ai_res.get('category', 'Borderline'),
            'confidence_score': ai_res.get('confidence_score', 0.0),
            'reason': ai_res.get('reason', ''),
            'problematic_phrases': ai_res.get('problematic_phrases', []),
            'safe_to_publish': ai_res.get('safe_to_publish', False),
            'editor_note': ai_res.get('editor_note'),
            'suggested_edit': ai_res.get('suggested_edit'),
            'response_time_ms': response_time_ms,
            'quality_score': ai_res.get('quality_score', 0.0),
            'relevance_score': ai_res.get('relevance_score', 0.0),
            'spam_score': ai_res.get('spam_score', 0.0),
            'toxicity_score': ai_res.get('toxicity_score', 0.0),
            'grammar_score': ai_res.get('grammar_score', 0.0)
        })
        result = {
            'id': record['id'],
            'verdict': record['verdict'],
            'category': record['category'],
            'confidence_score': record['confidence_score'],
            'reason': record['reason'],
            'problematic_phrases': record['problematic_phrases'],
            'safe_to_publish': record['safe_to_publish'],
            'editor_note': record.get('editor_note'),
            'suggested_edit': record.get('suggested_edit'),
            'response_time_ms': response_time_ms,
            'quality_score': record.get('quality_score', 0.0),
            'relevance_score': record.get('relevance_score', 0.0),
            'spam_score': record.get('spam_score', 0.0),
            'toxicity_score': record.get('toxicity_score', 0.0),
            'grammar_score': record.get('grammar_score', 0.0)
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Firebase save failed: {str(e)}'}), 500


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
            record = create_moderation_record({
                'article_title': c_data.get('article_title'),
                'reader_name': c_data.get('reader_name'),
                'comment_text': c_data.get('comment_text'),
                'prompt_version': 'v6',
                'verdict': ai_res.get('verdict', 'NEEDS_REVIEW'),
                'category': ai_res.get('category', 'Borderline'),
                'confidence_score': ai_res.get('confidence_score', 0.0),
                'reason': ai_res.get('reason', ''),
                'problematic_phrases': ai_res.get('problematic_phrases', []),
                'safe_to_publish': ai_res.get('safe_to_publish', False),
                'editor_note': ai_res.get('editor_note'),
                'suggested_edit': ai_res.get('suggested_edit'),
                'response_time_ms': response_time_ms
            })
            
            results.append({
                'id': record['id'],
                'article_title': record['article_title'],
                'reader_name': record['reader_name'],
                'comment_text': record['comment_text'],
                'verdict': record['verdict'],
                'category': record['category'],
                'confidence_score': record['confidence_score'],
                'reason': record['reason'],
                'problematic_phrases': record['problematic_phrases'],
                'safe_to_publish': record['safe_to_publish'],
                'editor_note': record.get('editor_note'),
                'suggested_edit': record.get('suggested_edit'),
                'response_time_ms': response_time_ms
            })
        except Exception as e:
            results.append({
                'error': f'Firebase save failed: {str(e)}',
                'comment_data': c_data
            })
            
    return jsonify(results), 200
