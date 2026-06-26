import React, { useState, useEffect, useRef } from 'react';
import { analyzeComment, getHistory } from '../api/client';

export default function ModerationForm({ onAnalysisSuccess, onAnalysisFailure, prefillData, showToast, latestResult }) {
  const [form, setForm] = useState({
    article_title: '',
    reader_name: '',
    comment_text: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Scanning for abusive language...');
  const [recentVerdicts, setRecentVerdicts] = useState([]);
  
  const loadingMessages = [
    "Scanning for abusive language...",
    "Checking for defamatory content...",
    "Assessing political sensitivity...",
    "Evaluating publication risk...",
    "Generating editor recommendation..."
  ];

  const timerRef = useRef(null);

  // Cycling loader messages
  useEffect(() => {
    if (loading) {
      let idx = 0;
      setLoadingText(loadingMessages[0]);
      timerRef.current = setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[idx]);
      }, 1200);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  // Apply prefill data if supplied
  useEffect(() => {
    if (prefillData) {
      setForm({
        article_title: prefillData.article_title || '',
        reader_name: prefillData.reader_name || '',
        comment_text: prefillData.comment_text || ''
      });
    }
  }, [prefillData]);

  // Fetch recent history items
  const fetchRecentVerdicts = async () => {
    try {
      const data = await getHistory(1, 3);
      setRecentVerdicts(data.items || []);
    } catch (err) {
      console.error("Error loading recent verdicts", err);
    }
  };

  useEffect(() => {
    fetchRecentVerdicts();
  }, [latestResult]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'comment_text') {
      if (value.length > 2000) {
        // Enforce hard stop at 2000 characters
        return;
      }
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.article_title.trim() || !form.reader_name.trim() || !form.comment_text.trim()) {
      showToast("❌ Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await analyzeComment(
        form.article_title.trim(),
        form.reader_name.trim(),
        form.comment_text.trim()
      );
      if (onAnalysisSuccess) {
        onAnalysisSuccess(res);
      }
      fetchRecentVerdicts();
    } catch (err) {
      if (onAnalysisFailure) {
        onAnalysisFailure();
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Preset fills
  const loadPreset = (type) => {
    if (type === 'clean') {
      setForm({
        article_title: "Telangana government announces free housing scheme",
        reader_name: "Suresh Reddy",
        comment_text: "This is a very welcome initiative. Many families in rural areas have been struggling for years. I hope the implementation is transparent and reaches those who truly need it."
      });
    } else if (type === 'borderline') {
      setForm({
        article_title: "CM inaugurates new expressway project",
        reader_name: "Priya Sharma",
        comment_text: "The government always announces big projects before elections. I'll believe it when I see it actually completed. Too many promises, not enough action."
      });
    } else if (type === 'abusive') {
      setForm({
        article_title: "Opposition leaders hold protest rally",
        reader_name: "Angry Reader",
        comment_text: "These opposition idiots should shut up. They are all traitors and criminals. Party X supporters are a disgrace to Telangana."
      });
    }
  };

  // Character Counter Styling
  const charCount = form.comment_text.length;
  let counterStyle = { color: 'var(--muted)', fontSize: '12px', fontWeight: '500' };
  let counterText = `${charCount} / 2000`;
  let textareaBorder = '1.5px solid var(--border)';

  if (charCount > 2000) {
    counterStyle = { color: '#DC2626', fontSize: '12px', fontWeight: '600' };
    counterText = "Maximum 2000 characters";
    textareaBorder = '1.5px solid #DC2626';
  } else if (charCount >= 1500) {
    counterStyle = { color: '#DC2626', fontSize: '12px', fontWeight: '600' };
    counterText = "Very long — accuracy may vary";
    textareaBorder = '1.5px solid #DC2626';
  } else if (charCount >= 500) {
    counterStyle = { color: '#D97706', fontSize: '12px', fontWeight: '600' };
    counterText = `${charCount} / 2000`;
  }

  return (
    <div className="card hover-lift" style={{ padding: '28px' }}>
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Field 1: Article Title */}
        <div className="form-field">
          <label className="form-label" htmlFor="article_title">Article Title</label>
          <input
            id="article_title"
            name="article_title"
            type="text"
            className="form-input"
            value={form.article_title}
            onChange={handleInputChange}
            placeholder="e.g. Government launches new housing scheme in Hyderabad"
            disabled={loading}
            required
          />
        </div>

        {/* Field 2: Reader Name */}
        <div className="form-field">
          <label className="form-label" htmlFor="reader_name">Reader Name</label>
          <input
            id="reader_name"
            name="reader_name"
            type="text"
            className="form-input"
            value={form.reader_name}
            onChange={handleInputChange}
            placeholder="e.g. Ramesh Kumar or Anonymous"
            disabled={loading}
            required
          />
        </div>

        {/* Field 3: Comment */}
        <div className="form-field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <label className="form-label" htmlFor="comment_text" style={{ margin: 0 }}>Comment Text</label>
            
            {/* Quick Test Presets */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>Try a sample:</span>
              <button
                type="button"
                onClick={() => loadPreset('clean')}
                disabled={loading}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  backgroundColor: 'var(--allow-bg)',
                  color: 'var(--allow-text)',
                  border: '1px solid var(--allow-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✅ Clean Comment
              </button>
              <button
                type="button"
                onClick={() => loadPreset('borderline')}
                disabled={loading}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  backgroundColor: 'var(--review-bg)',
                  color: 'var(--review-text)',
                  border: '1px solid var(--review-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ⚠️ Borderline
              </button>
              <button
                type="button"
                onClick={() => loadPreset('abusive')}
                disabled={loading}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  backgroundColor: 'var(--reject-bg)',
                  color: 'var(--reject-text)',
                  border: '1px solid var(--reject-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ❌ Abusive
              </button>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              id="comment_text"
              name="comment_text"
              className="form-input form-textarea"
              value={form.comment_text}
              onChange={handleInputChange}
              placeholder="Paste the reader comment here..."
              style={{ border: textareaBorder }}
              disabled={loading}
              required
            />
            {/* Character Counter */}
            <div style={{ position: 'absolute', bottom: '-20px', right: '4px', ...counterStyle }}>
              {counterText}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '12px' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="loading-dots">Analyzing...</span>
                <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--sidebar-muted)' }}>
                  ({loadingText})
                </span>
              </div>
            ) : (
              "Analyze Comment →"
            )}
          </button>
        </div>

      </form>

      {/* Recent Verdicts Chips */}
      {recentVerdicts.length > 0 && (
        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Recent Analysis Verdicts
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {recentVerdicts.map((item) => {
              let verdictBadge = '';
              let badgeColor = '';
              let badgeBg = '';

              if (item.verdict === 'ALLOW') {
                verdictBadge = '✅ ALLOW';
                badgeColor = 'var(--allow-color)';
                badgeBg = 'var(--allow-badge)';
              } else if (item.verdict === 'NEEDS_REVIEW') {
                verdictBadge = '⚠️ REVIEW';
                badgeColor = 'var(--review-color)';
                badgeBg = 'var(--review-badge)';
              } else {
                verdictBadge = '❌ REJECT';
                badgeColor = 'var(--reject-color)';
                badgeBg = 'var(--reject-badge)';
              }

              const displayTitle = item.article_title.length > 40 
                ? item.article_title.substring(0, 40) + '...' 
                : item.article_title;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: 'var(--paper)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}
                >
                  <span
                    style={{
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '10px'
                    }}
                  >
                    {verdictBadge}
                  </span>
                  <span style={{ color: 'var(--ink)', fontWeight: '500' }}>
                    "{displayTitle}"
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
