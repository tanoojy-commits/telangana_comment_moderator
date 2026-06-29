import json
import os
from datetime import datetime, timedelta

import firebase_admin
from firebase_admin import credentials, firestore
from google.auth.exceptions import DefaultCredentialsError


class FirebaseConfigurationError(RuntimeError):
    pass


_firestore_client = None


def _utc_now():
    return datetime.utcnow()


def _iso_z(value):
    if not value:
        return None
    if hasattr(value, "to_datetime"):
        value = value.to_datetime()
    return value.isoformat() + "Z"


def init_firebase(config):
    global _firestore_client

    if _firestore_client is not None:
        return _firestore_client

    app_options = {}
    if getattr(config, "FIREBASE_PROJECT_ID", None):
        app_options["projectId"] = config.FIREBASE_PROJECT_ID

    try:
        if getattr(config, "FIREBASE_SERVICE_ACCOUNT_JSON", None):
            service_account = json.loads(config.FIREBASE_SERVICE_ACCOUNT_JSON)
            cred = credentials.Certificate(service_account)
            firebase_admin.initialize_app(cred, app_options)
        elif getattr(config, "FIREBASE_CREDENTIALS_PATH", None):
            cred_path = os.path.abspath(config.FIREBASE_CREDENTIALS_PATH)
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, app_options)
        elif os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, app_options)
        else:
            raise FirebaseConfigurationError(
                "Firebase credentials are missing. Set FIREBASE_CREDENTIALS_PATH "
                "to your service account JSON file, or set FIREBASE_SERVICE_ACCOUNT_JSON."
            )
    except ValueError:
        # The default Firebase app may already exist during Flask debug reloads.
        pass
    except (DefaultCredentialsError, FileNotFoundError, json.JSONDecodeError) as exc:
        raise FirebaseConfigurationError(f"Firebase credential setup failed: {exc}") from exc

    _firestore_client = firestore.client()
    return _firestore_client


def get_client():
    if _firestore_client is None:
        raise FirebaseConfigurationError("Firebase has not been initialized.")
    return _firestore_client


def health_check():
    db = get_client()
    # A lightweight read verifies credentials, project access, and Firestore API availability.
    list(db.collection("_health").limit(1).get())
    return True


def _document_to_dict(snapshot):
    data = snapshot.to_dict() or {}
    data["id"] = snapshot.id
    for field in ("created_at", "decided_at"):
        data[field] = _iso_z(data.get(field))
    return data


def create_moderation_record(payload):
    data = {
        "article_title": payload.get("article_title", ""),
        "reader_name": payload.get("reader_name", ""),
        "comment_text": payload.get("comment_text", ""),
        "prompt_version": payload.get("prompt_version", "v5"),
        "verdict": payload.get("verdict", "NEEDS_REVIEW"),
        "category": payload.get("category", "Borderline"),
        "confidence_score": float(payload.get("confidence_score", 0.0)),
        "reason": payload.get("reason", ""),
        "problematic_phrases": payload.get("problematic_phrases", []),
        "safe_to_publish": bool(payload.get("safe_to_publish", False)),
        "editor_note": payload.get("editor_note"),
        "suggested_edit": payload.get("suggested_edit"),
        "editor_verdict": payload.get("editor_verdict"),
        "editor_decision_note": payload.get("editor_decision_note"),
        "decided_at": payload.get("decided_at"),
        "response_time_ms": int(payload.get("response_time_ms", 0)),
        "created_at": payload.get("created_at") or _utc_now(),
    }
    _, doc_ref = get_client().collection("moderation_records").add(data)
    snapshot = doc_ref.get()
    return _document_to_dict(snapshot)


def get_moderation_record(record_id):
    snapshot = get_client().collection("moderation_records").document(str(record_id)).get()
    if not snapshot.exists:
        return None
    return _document_to_dict(snapshot)


def list_moderation_records(page=1, limit=20, verdict_filter="", search_query=""):
    snapshots = get_client().collection("moderation_records").get()
    records = [_document_to_dict(snapshot) for snapshot in snapshots]

    if verdict_filter:
        v_filter = verdict_filter.upper()
        if v_filter == "APPROVED":
            v_filter = "ALLOW"
        elif v_filter == "REJECTED":
            v_filter = "REJECT"
        if v_filter in ("ALLOW", "NEEDS_REVIEW", "REJECT"):
            records = [record for record in records if record.get("verdict") == v_filter]

    if search_query:
        needle = search_query.lower()
        records = [
            record for record in records
            if needle in record.get("article_title", "").lower()
            or needle in record.get("reader_name", "").lower()
        ]

    def sort_key(record):
        priority = 0 if record.get("verdict") == "NEEDS_REVIEW" and not record.get("editor_verdict") else 1
        created_at = record.get("created_at") or ""
        return (priority, created_at)

    records.sort(key=sort_key)
    needs_review = [record for record in records if record.get("verdict") == "NEEDS_REVIEW" and not record.get("editor_verdict")]
    others = [record for record in records if record not in needs_review]
    others.sort(key=lambda record: record.get("created_at") or "", reverse=True)
    records = needs_review + others

    total = len(records)
    offset = max(page - 1, 0) * limit
    return records[offset:offset + limit], total


def delete_moderation_record(record_id):
    db = get_client()
    doc_ref = db.collection("moderation_records").document(str(record_id))
    if not doc_ref.get().exists:
        return False
    for feedback in db.collection("feedback").where("record_id", "==", str(record_id)).get():
        feedback.reference.delete()
    doc_ref.delete()
    return True


def save_editor_decision(record_id, editor_verdict, editor_decision_note):
    doc_ref = get_client().collection("moderation_records").document(str(record_id))
    if not doc_ref.get().exists:
        return None
    doc_ref.update({
        "editor_verdict": editor_verdict,
        "editor_decision_note": editor_decision_note,
        "decided_at": _utc_now(),
    })
    return _document_to_dict(doc_ref.get())


def create_feedback(record_id, rating, comment):
    data = {
        "record_id": str(record_id),
        "rating": int(rating),
        "comment": comment or None,
        "created_at": _utc_now(),
    }
    _, doc_ref = get_client().collection("feedback").add(data)
    return _document_to_dict(doc_ref.get())


def list_feedback(record_id=None):
    query = get_client().collection("feedback")
    if record_id is not None:
        query = query.where("record_id", "==", str(record_id))
    return [_document_to_dict(snapshot) for snapshot in query.get()]


def get_feedback_summary_data():
    feedbacks = list_feedback()
    total = len(feedbacks)
    dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    if total == 0:
        return 0.0, total, dist

    rating_sum = 0
    for feedback in feedbacks:
        rating = int(feedback.get("rating", 0))
        rating_sum += rating
        if rating in dist:
            dist[rating] += 1
    return round(rating_sum / total, 2), total, dist


def get_analytics_data():
    records = [_document_to_dict(snapshot) for snapshot in get_client().collection("moderation_records").get()]
    feedbacks = list_feedback()
    total = len(records)

    verdict_counts = {"ALLOW": 0, "NEEDS_REVIEW": 0, "REJECT": 0}
    for record in records:
        verdict = record.get("verdict")
        if verdict in verdict_counts:
            verdict_counts[verdict] += 1

    avg_confidence = 0.0
    avg_response_time = 0.0
    if total:
        avg_confidence = round((sum(float(r.get("confidence_score", 0.0)) for r in records) / total) * 100, 1)
        avg_response_time = round(sum(int(r.get("response_time_ms", 0)) for r in records) / total, 1)

    categories = ["Positive", "Neutral", "Constructive", "Abusive", "Hate Speech", "Defamation", "Political Inflammatory", "Spam", "Borderline"]
    flag_freq = {cat: 0 for cat in categories}
    for record in records:
        category = record.get("category", "Borderline")
        flag_freq[category] = flag_freq.get(category, 0) + 1

    today = datetime.utcnow().date()
    daily_volume = []
    quality_trend = []
    for i in range(13, -1, -1):
        day = today - timedelta(days=i)
        label = day.strftime("%d/%m")
        day_records = [r for r in records if (r.get("created_at") or "")[:10] == day.isoformat()]
        day_feedback = [f for f in feedbacks if (f.get("created_at") or "")[:10] == day.isoformat()]
        daily_volume.append({"date": label, "count": len(day_records)})
        if day_feedback:
            avg_rating = round(sum(int(f.get("rating", 0)) for f in day_feedback) / len(day_feedback), 1)
        else:
            avg_rating = 0.0
        quality_trend.append({"date": label, "avg_rating": avg_rating})

    allow_rate = round((verdict_counts["ALLOW"] / total) * 100, 1) if total else 0.0
    pending = len([
        record for record in records
        if record.get("verdict") == "NEEDS_REVIEW" and not record.get("editor_verdict")
    ])

    return {
        "total_comments_moderated": total,
        "verdict_breakdown": verdict_counts,
        "average_confidence_score": avg_confidence,
        "average_response_time_ms": avg_response_time,
        "flag_category_frequency": flag_freq,
        "daily_volume": daily_volume,
        "quality_trend": quality_trend,
        "safe_to_publish_rate": allow_rate,
        "pending_editor_decisions": pending,
    }


def list_templates():
    templates = [_document_to_dict(snapshot) for snapshot in get_client().collection("templates").get()]
    templates.sort(key=lambda template: template.get("created_at") or "", reverse=True)
    return templates


def create_template(payload):
    data = {
        "name": payload.get("name", ""),
        "article_title": payload.get("article_title", ""),
        "sample_comment": payload.get("sample_comment", ""),
        "category": payload.get("category", ""),
        "created_at": _utc_now(),
    }
    _, doc_ref = get_client().collection("templates").add(data)
    return _document_to_dict(doc_ref.get())
