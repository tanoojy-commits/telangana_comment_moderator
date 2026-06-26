import React, { useEffect, useState } from 'react';
import { getHistory, getHistoryItem, deleteHistoryItem } from '../api/client';
import OutputDisplay from './OutputDisplay';

export default function HistoryPanel({ showToast }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pages, setPages] = useState(1);
  
  const [verdictFilter, setVerdictFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetail, setExpandedDetail] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
    // Collapse any open details when filters change
    setExpandedId(null);
    setExpandedDetail(null);
  }, [page, verdictFilter, searchQuery]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory(page, limit, verdictFilter, searchQuery);
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      showToast("❌ Failed to load history log", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedDetail(null);
      return;
    }

    setExpandedId(id);
    setDetailLoading(true);
    try {
      const detail = await getHistoryItem(id);
      setExpandedDetail(detail);
    } catch (err) {
      showToast("❌ Failed to load detail view", "error");
      setExpandedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this moderation record permanently?")) return;
    try {
      await deleteHistoryItem(id);
      showToast("✅ Record deleted", "allow");
      if (expandedId === id) {
        setExpandedId(null);
        setExpandedDetail(null);
      }
      fetchHistory();
    } catch (err) {
      showToast("❌ Failed to delete record", "error");
    }
  };

  const handleDecisionSubmitted = (updatedRecord) => {
    fetchHistory();
    if (expandedId === updatedRecord.id) {
      setExpandedDetail(updatedRecord);
    }
  };

  const getRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    const now = new Date();
    const past = new Date(isoString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const hasPending = items.some(item => item.verdict === 'NEEDS_REVIEW' && !item.editor_verdict);

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 className="page-title">Moderation History</h1>
          <p className="page-subtitle">Review and audit all processed reader comments</p>
        </div>
        <span
          className="badge-pill"
          style={{
            backgroundColor: 'var(--ink)',
            color: '#FFFFFF',
            fontSize: '14px',
            padding: '6px 14px'
          }}
        >
          {total} total records
        </span>
      </div>

      <div className="divider" />

      {/* Filter and Search Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Scrollable Verdict filter tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => { setVerdictFilter(''); setPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1.5px solid var(--border)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: verdictFilter === '' ? 'var(--ink)' : 'var(--white)',
                color: verdictFilter === '' ? 'var(--white)' : 'var(--muted)'
              }}
            >
              All
            </button>
            <button
              onClick={() => { setVerdictFilter('ALLOW'); setPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1.5px solid var(--allow-border)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: verdictFilter === 'ALLOW' ? 'var(--allow-bg)' : 'var(--white)',
                color: verdictFilter === 'ALLOW' ? 'var(--allow-color)' : 'var(--muted)'
              }}
            >
              ✅ Allowed
            </button>
            <button
              onClick={() => { setVerdictFilter('NEEDS_REVIEW'); setPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1.5px solid var(--review-border)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: verdictFilter === 'NEEDS_REVIEW' ? 'var(--review-bg)' : 'var(--white)',
                color: verdictFilter === 'NEEDS_REVIEW' ? 'var(--review-color)' : 'var(--muted)'
              }}
            >
              ⚠️ Needs Review
            </button>
            <button
              onClick={() => { setVerdictFilter('REJECT'); setPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1.5px solid var(--reject-border)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: verdictFilter === 'REJECT' ? 'var(--reject-bg)' : 'var(--white)',
                color: verdictFilter === 'REJECT' ? 'var(--reject-color)' : 'var(--muted)'
              }}
            >
              ❌ Rejected
            </button>
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: '8px', width: '320px' }}>
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search by article or reader name..."
              style={{ fontSize: '13px' }}
            />
          </div>

        </div>
      </div>

      {/* Undecided Reviews Banner */}
      {hasPending && !verdictFilter && (
        <div
          style={{
            backgroundColor: 'var(--review-bg)',
            border: '1.5px solid var(--review-border)',
            color: 'var(--review-color)',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⚠️ Awaiting editor decision</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--muted)' }}>Loading history records...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
          <span style={{ fontSize: '32px' }}>📋</span>
          <h3 style={{ marginTop: '12px', fontSize: '16px', fontWeight: 600, color: 'var(--ink)' }}>No records found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try resetting your search or filter tags.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            
            // Color variables
            let borderLeftColor = 'var(--allow-border)';
            let verdictLabelText = 'ALLOW';
            let verdictBadgeBg = 'var(--allow-badge)';
            let verdictBadgeColor = 'var(--allow-text)';
            
            if (item.verdict === 'NEEDS_REVIEW') {
              borderLeftColor = 'var(--review-border)';
              verdictLabelText = 'REVIEW';
              verdictBadgeBg = 'var(--review-badge)';
              verdictBadgeColor = 'var(--review-text)';
            } else if (item.verdict === 'REJECT') {
              borderLeftColor = 'var(--reject-border)';
              verdictLabelText = 'REJECT';
              verdictBadgeBg = 'var(--reject-badge)';
              verdictBadgeColor = 'var(--reject-text)';
            }

            return (
              <div
                key={item.id}
                className="card hover-lift"
                style={{
                  borderLeft: `4px solid ${borderLeftColor}`,
                  cursor: 'pointer',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
                onClick={() => handleCardClick(item.id)}
              >
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        backgroundColor: verdictBadgeBg,
                        color: verdictBadgeColor,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '11px'
                      }}
                    >
                      {verdictLabelText}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        backgroundColor: 'var(--paper)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: 500
                      }}
                    >
                      {item.category}
                    </span>
                    
                    {/* Undecided indicator */}
                    {item.verdict === 'NEEDS_REVIEW' && !item.editor_verdict && (
                      <span
                        style={{
                          fontSize: '10px',
                          backgroundColor: 'var(--review-badge)',
                          color: 'var(--review-text)',
                          border: '1.5px solid var(--review-border)',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          fontWeight: '700'
                        }}
                      >
                        Pending Decision
                      </span>
                    )}

                    {/* Decided indicator */}
                    {item.editor_verdict && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: item.editor_verdict === 'ALLOW' ? 'var(--allow-border)' : 'var(--reject-border)'
                        }}
                      >
                        Editor: {item.editor_verdict === 'ALLOW' ? 'APPROVED' : 'REJECTED'}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                      {getRelativeTime(item.created_at)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Middle Row */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                    {item.article_title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                    Submitted by: <strong>{item.reader_name}</strong>
                  </p>
                </div>

                {/* Preview text */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--ink)',
                    lineHeight: 1.5,
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  "{item.comment_text}"
                </p>

                {/* Bottom Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '220px' }}>
                    <div style={{ flex: 1 }} className="confidence-bar-track">
                      <div
                        className="confidence-bar-fill"
                        style={{
                          width: `${item.confidence_score * 100}%`,
                          backgroundColor: borderLeftColor
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--muted)' }}>
                      {Math.round(item.confidence_score * 100)}%
                    </span>
                  </div>
                  
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sidebar-active-border)' }}>
                    {isExpanded ? 'Collapse Details ↑' : 'View Details →'}
                  </span>
                </div>

                {/* Inline Expansion details */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '1px solid var(--border)',
                      cursor: 'default'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {detailLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Loading analysis report...</span>
                      </div>
                    ) : expandedDetail ? (
                      <OutputDisplay
                        result={expandedDetail}
                        showToast={showToast}
                        onReanalyze={null}
                        onDecisionSubmitted={handleDecisionSubmitted}
                      />
                    ) : (
                      <p style={{ color: 'red', fontSize: '13px' }}>Failed to retrieve data.</p>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Showing {startItem}–{endItem} of {total} records
          </span>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--white)',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1,
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              Previous
            </button>
            <button
              disabled={page === pages}
              onClick={() => setPage(prev => Math.min(prev + 1, pages))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--white)',
                cursor: page === pages ? 'not-allowed' : 'pointer',
                opacity: page === pages ? 0.5 : 1,
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
