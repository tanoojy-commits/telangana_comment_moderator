import React, { useState } from 'react';
import HighlightedComment from './HighlightedComment';
import { submitEditorDecision } from '../api/client';

export default function EditorDecisionPanel({
  recordId,
  commentText,
  editorNote,
  problematicPhrases,
  onDecisionSubmitted,
  hasSubmitted = false,
  existingVerdict = null,
  existingNote = null
}) {
  const [selectedVerdict, setSelectedVerdict] = useState(existingVerdict); // 'ALLOW' | 'REJECT'
  const [decisionNote, setDecisionNote] = useState(existingNote || '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(hasSubmitted);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVerdict) return;

    setLoading(true);
    try {
      const updatedRecord = await submitEditorDecision(recordId, selectedVerdict, decisionNote);
      setSubmitted(true);
      if (onDecisionSubmitted) {
        onDecisionSubmitted(updatedRecord);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit editor decision.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const isApproved = selectedVerdict === 'ALLOW';
    return (
      <div
        className="card"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border)'
        }}
      >
        {/* Large green checkmark SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="56" height="56" fill="#10B981">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--ink)', fontWeight: 700 }}>
          Decision Recorded
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted)' }}>
          This comment has been marked as <strong>{isApproved ? 'APPROVED' : 'REJECTED'}</strong> by the editor.
        </p>
      </div>
    );
  }

  return (
    <div
      className="card pulse-amber-border"
      style={{
        borderLeft: '6px solid var(--review-border)',
        padding: '28px',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Header */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--review-color)', fontWeight: 700 }}>
          👁️ Editor Decision Required
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted)', marginTop: '2px' }}>
          The AI is uncertain about this comment. Your judgment is needed.
        </p>
      </div>

      {/* Comment Context Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Comment Context
        </div>
        <div
          style={{
            backgroundColor: 'var(--paper)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}
        >
          <HighlightedComment text={commentText} phrases={problematicPhrases} />
        </div>
        
        {editorNote && (
          <div
            style={{
              backgroundColor: 'var(--review-bg)',
              border: '1px solid var(--review-border)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              color: 'var(--review-color)'
            }}
          >
            <strong>AI Note:</strong> {editorNote}
          </div>
        )}
      </div>

      {/* Decision Buttons & Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Decision Button Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="form-label">Select Action</label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: '12px'
            }}
            className="decision-buttons"
          >
            {/* Approve button */}
            <button
              type="button"
              onClick={() => setSelectedVerdict('ALLOW')}
              style={{
                padding: '14px 20px',
                borderRadius: '8px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1.5px solid var(--allow-border)',
                backgroundColor: selectedVerdict === 'ALLOW' ? '#065F46' : 'var(--allow-bg)',
                color: selectedVerdict === 'ALLOW' ? '#FFFFFF' : 'var(--allow-color)',
                transform: selectedVerdict === 'ALLOW' ? 'scale(1.02)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              ✅ Approve & Publish
            </button>

            {/* Separator */}
            <div
              style={{
                width: '1px',
                height: '40px',
                backgroundColor: 'var(--border)',
                alignSelf: 'center'
              }}
              className="sidebar-logo" /* Hidden on mobile by standard layouts */
            />

            {/* Reject button */}
            <button
              type="button"
              onClick={() => setSelectedVerdict('REJECT')}
              style={{
                padding: '14px 20px',
                borderRadius: '8px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1.5px solid var(--reject-border)',
                backgroundColor: selectedVerdict === 'REJECT' ? '#991B1B' : 'var(--reject-bg)',
                color: selectedVerdict === 'REJECT' ? '#FFFFFF' : 'var(--reject-color)',
                transform: selectedVerdict === 'REJECT' ? 'scale(1.02)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              ❌ Reject Comment
            </button>
          </div>
        </div>

        {/* Note input */}
        <div className="form-field">
          <label className="form-label" htmlFor="decision_note">Add a note (optional)</label>
          <textarea
            id="decision_note"
            rows={3}
            className="form-input"
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            placeholder="e.g. Comment is critical but not defamatory — approved with context"
            disabled={loading}
          />
        </div>

        {/* Submit decision */}
        <button
          type="submit"
          className="btn-primary"
          style={{ height: '44px', width: '100%', backgroundColor: '#111827' }}
          disabled={!selectedVerdict || loading}
        >
          {loading ? "Recording Decision..." : "Submit Decision"}
        </button>

      </form>
    </div>
  );
}
