import React, { useState } from 'react';
import { submitFeedback } from '../api/client';

export default function FeedbackWidget({ recordId, onSubmitFeedbackSuccess, showToast }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRating, setSubmittedRating] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showToast('Please select a star rating.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitFeedback(recordId, rating, comment);
      setSubmittedRating(rating);
      showToast('Thank you for rating this analysis!', 'success');
      if (onSubmitFeedbackSuccess) {
        onSubmitFeedbackSuccess(rating);
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedRating !== null) {
    return (
      <div className="card" style={{ backgroundColor: 'rgba(26, 107, 60, 0.05)', border: '1px solid rgba(26, 107, 60, 0.2)' }}>
        <h4 style={{ color: 'var(--forest)', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>✓ Feedback Submitted</h4>
        <p style={{ fontSize: '0.85rem' }}>
          You rated this analysis: <strong>{submittedRating} / 5 stars</strong>. Thank you for helping refine the AI's moderation accuracy!
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        ⭐ Rate This Analysis
      </h4>
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
        Does this verdict align with Telangana Today's editorial standards?
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', gap: '0.25rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} star`}
              style={{ fontSize: '1.75rem', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate)' }}>
              ({rating}/5)
            </span>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <textarea
            className="form-control"
            rows="2"
            placeholder="Add comments (optional)..."
            value={comment}
            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-secondary"
          style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
