import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import HighlightedComment from './HighlightedComment';
import EditorDecisionPanel from './EditorDecisionPanel';
import FeedbackWidget from './FeedbackWidget';

function ConfidenceMeter({ score, verdict }) {
  const [animated, setAnimated] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);
  
  const pct = Math.round(score * 100);
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = animated ? circ - (pct / 100) * circ : circ;
  const color = verdict === 'ALLOW' ? '#10B981' : verdict === 'REJECT' ? '#EF4444' : '#F59E0B';
  
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'6px'}}>
      <svg width="136" height="136" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="10"/>
        <circle
          cx="68" cy="68" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 68 68)"
          style={{transition:'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)'}}
        />
        <text x="68" y="62" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="26" fontWeight="600" fill="#111827">{pct}%</text>
        <text x="68" y="80" textAnchor="middle" fontFamily="Inter" fontSize="11" fill="#6B7280">confidence</text>
      </svg>
      <span style={{fontFamily:'Inter',fontSize:'12px',color:'#6B7280'}}>AI Confidence Score</span>
    </div>
  );
}

export default function OutputDisplay({ result, onReanalyze, showToast, onDecisionSubmitted }) {
  const [currentResult, setCurrentResult] = useState(result);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setCurrentResult(result);
  }, [result]);

  if (!currentResult) return null;

  const {
    id,
    article_title,
    reader_name,
    comment_text,
    verdict,
    category,
    confidence_score,
    reason,
    problematic_phrases = [],
    safe_to_publish,
    editor_note,
    suggested_edit,
    editor_verdict,
    editor_decision_note
  } = currentResult;

  // Banner details
  let verdictClass = 'allow';
  let verdictLabel = 'ALLOWED';
  let verdictEmoji = '✅';
  let topBorderColor = 'var(--allow-border)';
  let categoryBg = 'var(--allow-badge)';
  let categoryTextColor = 'var(--allow-text)';

  if (verdict === 'NEEDS_REVIEW') {
    verdictClass = 'review';
    verdictLabel = 'NEEDS REVIEW';
    verdictEmoji = '⚠️';
    topBorderColor = 'var(--review-border)';
    categoryBg = 'var(--review-badge)';
    categoryTextColor = 'var(--review-text)';
  } else if (verdict === 'REJECT') {
    verdictClass = 'reject';
    verdictLabel = 'REJECTED';
    verdictEmoji = '❌';
    topBorderColor = 'var(--reject-border)';
    categoryBg = 'var(--reject-badge)';
    categoryTextColor = 'var(--reject-text)';
  }

  const handleCopySummary = () => {
    const summaryText = `Verdict: ${verdict} | Category: ${category} | Confidence: ${Math.round(confidence_score * 100)}% | Reason: ${reason}`;
    navigator.clipboard.writeText(summaryText)
      .then(() => showToast("📋 Summary copied to clipboard!", "allow"))
      .catch((err) => showToast("❌ Copy failed", "error"));
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Branding Header
      doc.setFont("playfair", "bold");
      doc.setFontSize(22);
      doc.setTextColor(17, 24, 39); // --ink
      doc.text("Telangana Today", 14, 20);
      
      doc.setFont("inter", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // --muted
      doc.text("AI Content Moderation Report - v5", 14, 26);
      
      doc.setDrawColor(229, 231, 235); // --border
      doc.line(14, 30, 196, 30);
      
      // Report metadata
      doc.setFontSize(9);
      doc.text(`Record ID: ${id || 'N/A'}`, 14, 36);
      doc.text(`Reader: ${reader_name}`, 14, 41);
      doc.text(`Date: ${new Date().toLocaleString()}`, 14, 46);
      
      // Article title
      doc.setFont("inter", "bold");
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text("ARTICLE TITLE:", 14, 56);
      doc.setFont("inter", "normal");
      const splitTitle = doc.splitTextToSize(article_title, 180);
      doc.text(splitTitle, 14, 61);
      
      let nextY = 61 + (splitTitle.length * 5) + 6;
      
      // Comment text
      doc.setFont("inter", "bold");
      doc.text("READER COMMENT:", 14, nextY);
      doc.setFont("inter", "normal");
      const splitComment = doc.splitTextToSize(comment_text, 180);
      doc.text(splitComment, 14, nextY + 5);
      
      nextY = nextY + 5 + (splitComment.length * 5) + 8;
      
      // Highlighted summary block
      let fillR = 236, fillG = 253, fillB = 245; // ALLOW green bg
      let textR = 6, textG = 95, textB = 70; // ALLOW text color
      if (verdict === 'NEEDS_REVIEW') {
        fillR = 255; fillG = 251; fillB = 235; // REVIEW amber bg
        textR = 146; textG = 64; textB = 14;
      } else if (verdict === 'REJECT') {
        fillR = 254; fillG = 242; fillB = 242; // REJECT red bg
        textR = 153; textG = 27; textB = 27;
      }
      
      doc.setFillColor(fillR, fillG, fillB);
      doc.rect(14, nextY, 182, 14, "F");
      
      doc.setFont("inter", "bold");
      doc.setTextColor(textR, textG, textB);
      doc.text(`VERDICT: ${verdictLabel}   |   CATEGORY: ${category.toUpperCase()}   |   CONFIDENCE: ${Math.round(confidence_score * 100)}%`, 18, nextY + 9);
      
      nextY += 22;
      doc.setTextColor(17, 24, 39);
      
      // Reason and phrases
      doc.setFont("inter", "bold");
      doc.text("REASONING:", 14, nextY);
      doc.setFont("inter", "normal");
      const splitReason = doc.splitTextToSize(reason, 180);
      doc.text(splitReason, 14, nextY + 5);
      
      nextY = nextY + 5 + (splitReason.length * 5) + 8;
      
      if (problematic_phrases.length > 0) {
        doc.setFont("inter", "bold");
        doc.text("PROBLEMATIC PHRASES:", 14, nextY);
        doc.setFont("inter", "normal");
        const phraseList = problematic_phrases.join(", ");
        const splitPhrases = doc.splitTextToSize(phraseList, 180);
        doc.text(splitPhrases, 14, nextY + 5);
        nextY = nextY + 5 + (splitPhrases.length * 5) + 8;
      }
      
      // Editor action notes / suggested edits
      if (suggested_edit) {
        doc.setFont("inter", "bold");
        doc.text("SUGGESTED CORRECTION:", 14, nextY);
        doc.setFont("inter", "normal");
        const splitEdit = doc.splitTextToSize(suggested_edit, 180);
        doc.text(splitEdit, 14, nextY + 5);
        nextY = nextY + 5 + (splitEdit.length * 5) + 8;
      }
      
      if (editor_note) {
        doc.setFont("inter", "bold");
        doc.text("AI EDITOR RECOMMENDATION:", 14, nextY);
        doc.setFont("inter", "normal");
        const splitNote = doc.splitTextToSize(editor_note, 180);
        doc.text(splitNote, 14, nextY + 5);
        nextY = nextY + 5 + (splitNote.length * 5) + 8;
      }

      if (editor_verdict) {
        doc.setFont("inter", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text(`HUMAN EDITOR OVERRIDE: ${editor_verdict}`, 14, nextY);
        if (editor_decision_note) {
          doc.setFont("inter", "normal");
          doc.setTextColor(17, 24, 39);
          doc.text(`Note: ${editor_decision_note}`, 14, nextY + 5);
        }
      }
      
      doc.save(`TelanganaToday_ModerationReport_${id || 'temp'}.pdf`);
      showToast("📄 PDF Report downloaded!", "allow");
    } catch (err) {
      console.error(err);
      showToast("❌ PDF generation failed", "error");
    }
  };

  const handleDecisionPanelCallback = (updatedRecord) => {
    setCurrentResult(updatedRecord);
    if (onDecisionSubmitted) {
      onDecisionSubmitted(updatedRecord);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Verdict Banner Card */}
      <div
        className="card"
        style={{
          borderTop: `4px solid ${topBorderColor}`,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div className="verdict-banner">
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '48px', lineHeight: 1 }}>{verdictEmoji}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '32px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: `var(--${verdictClass}-color)`
                  }}
                >
                  {verdictLabel}
                </span>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                  <span
                    className="badge-pill"
                    style={{
                      backgroundColor: categoryBg,
                      color: categoryTextColor,
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    {category}
                  </span>
                  
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: safe_to_publish ? '#10B981' : '#EF4444'
                    }}
                  >
                    {safe_to_publish ? '✓ Safe to publish' : '✗ Do not publish'}
                  </span>

                  {editor_verdict && (
                    <span
                      className="badge-pill"
                      style={{
                        backgroundColor: editor_verdict === 'ALLOW' ? 'var(--allow-badge)' : 'var(--reject-badge)',
                        color: editor_verdict === 'ALLOW' ? 'var(--allow-color)' : 'var(--reject-color)',
                        fontSize: '11px',
                        fontWeight: '700',
                        border: `1.5px solid ${editor_verdict === 'ALLOW' ? 'var(--allow-border)' : 'var(--reject-border)'}`
                      }}
                    >
                      👁️ EDITOR: {editor_verdict}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                lineHeight: 1.5,
                color: 'var(--ink)',
                fontStyle: 'italic',
                marginTop: '4px'
              }}
            >
              "{reason}"
            </p>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ConfidenceMeter score={confidence_score} verdict={verdict} />
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="details-grid">
        
        {/* Left Card — Comment Analysis */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            Reviewed Comment
          </h3>
          
          <div
            style={{
              backgroundColor: 'var(--paper)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              minHeight: '80px'
            }}
          >
            <HighlightedComment text={comment_text} phrases={problematic_phrases} />
          </div>

          {problematic_phrases && problematic_phrases.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>Flagged Phrases:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {problematic_phrases.map((phrase, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px',
                      backgroundColor: 'var(--reject-badge)',
                      color: 'var(--reject-text)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      border: '1px solid var(--reject-border)'
                    }}
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Card — Editor Guidance */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            Editor Guidance
          </h3>

          <blockquote
            style={{
              borderLeft: '3px solid var(--review-border)',
              paddingLeft: '12px',
              fontStyle: 'italic',
              color: 'var(--ink)',
              fontSize: '14px',
              lineHeight: 1.5
            }}
          >
            "{editor_note || reason}"
          </blockquote>

          {suggested_edit && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>Suggested Edit</span>
              <div
                style={{
                  backgroundColor: 'var(--review-bg)',
                  border: '1px solid var(--review-border)',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: '14px',
                  color: 'var(--review-text)',
                  lineHeight: 1.5,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  navigator.clipboard.writeText(suggested_edit);
                  showToast("📋 Suggested edit copied to clipboard!", "allow");
                }}
                title="Click to copy suggested edit"
              >
                {suggested_edit}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Action Buttons Row */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          borderTop: '1px solid var(--border)',
          paddingTop: '20px'
        }}
      >
        <button
          className="nav-item"
          style={{
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--white)',
            color: 'var(--ink)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onClick={() => setShowFeedback(!showFeedback)}
        >
          ⭐ Rate Analysis
        </button>

        <button
          className="nav-item"
          style={{
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--white)',
            color: 'var(--ink)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onClick={handleCopySummary}
        >
          📋 Copy Summary
        </button>

        <button
          className="nav-item"
          style={{
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--white)',
            color: 'var(--ink)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onClick={handleDownloadPDF}
        >
          📄 Download PDF
        </button>

        {onReanalyze && (
          <button
            className="nav-item"
            style={{
              border: '1.5px solid var(--border)',
              backgroundColor: 'var(--white)',
              color: 'var(--ink)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
            onClick={onReanalyze}
          >
            🔄 Re-analyze
          </button>
        )}
      </div>

      {/* Expanded Feedback widget section */}
      {showFeedback && id && (
        <div style={{ marginTop: '10px' }}>
          <FeedbackWidget
            recordId={id}
            onSubmitFeedbackSuccess={(rating) => {
              setShowFeedback(false);
              showToast("⭐ Thank you for rating!", "allow");
            }}
            showToast={showToast}
          />
        </div>
      )}

      {/* Editor Decision Panel */}
      {verdict === 'NEEDS_REVIEW' && (
        <EditorDecisionPanel
          recordId={id}
          commentText={comment_text}
          editorNote={editor_note}
          problematicPhrases={problematic_phrases}
          onDecisionSubmitted={handleDecisionPanelCallback}
          hasSubmitted={!!editor_verdict}
          existingVerdict={editor_verdict}
          existingNote={editor_decision_note}
        />
      )}

    </div>
  );
}
