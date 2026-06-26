import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../api/client';

export default function AnalyticsDashboard({ showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const stats = await getAnalytics();
      setData(stats);
    } catch (err) {
      showToast("❌ Failed to fetch analytics data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--muted)' }}>Loading analytics dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <span style={{ fontSize: '32px' }}>📊</span>
        <h3 style={{ marginTop: '12px', fontSize: '16px', fontWeight: 600 }}>No data available</h3>
      </div>
    );
  }

  const {
    total_comments_moderated = 0,
    verdict_breakdown = {},
    average_confidence_score = 0,
    average_response_time_ms = 0,
    flag_category_frequency = {},
    daily_volume = [],
    quality_trend = [],
    safe_to_publish_rate = 0,
    pending_editor_decisions = 0
  } = data;

  // 1. Stacked Verdict Percentages
  const allowCount = verdict_breakdown.ALLOW || 0;
  const reviewCount = verdict_breakdown.NEEDS_REVIEW || 0;
  const rejectCount = verdict_breakdown.REJECT || 0;

  const pctAllow = total_comments_moderated > 0 ? (allowCount / total_comments_moderated) * 100 : 0;
  const pctReview = total_comments_moderated > 0 ? (reviewCount / total_comments_moderated) * 100 : 0;
  const pctReject = total_comments_moderated > 0 ? (rejectCount / total_comments_moderated) * 100 : 0;

  // 2. SVG Line Chart: Daily Volume (14 days)
  const volWidth = 600;
  const volHeight = 180;
  const volPaddingX = 50;
  const volPaddingY = 30;
  
  const volCounts = daily_volume.map(d => d.count);
  const volMaxCount = volCounts.length > 0 ? Math.max(...volCounts, 5) : 5;

  const volumePoints = daily_volume.map((item, idx) => {
    const x = volPaddingX + (idx * (volWidth - volPaddingX * 2) / (daily_volume.length - 1 || 1));
    const y = (volHeight - volPaddingY) - (item.count * (volHeight - volPaddingY * 2) / volMaxCount);
    return { x, y, date: item.date, count: item.count };
  });

  let volLinePath = "";
  if (volumePoints.length > 0) {
    volLinePath = `M ${volumePoints[0].x} ${volumePoints[0].y} ` + 
                  volumePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  // 3. SVG Category horizontal bars
  const categoriesList = Object.entries(flag_category_frequency).map(([cat, val]) => ({
    category: cat,
    count: val
  }));
  const maxCategoryCount = categoriesList.length > 0 ? Math.max(...categoriesList.map(c => c.count), 1) : 1;

  // 4. SVG Area Chart: Editor Rating Trend (14 days rating)
  const qWidth = 600;
  const qHeight = 180;
  const qPaddingX = 50;
  const qPaddingY = 30;

  const ratingPoints = quality_trend.map((item, idx) => {
    const x = qPaddingX + (idx * (qWidth - qPaddingX * 2) / (quality_trend.length - 1 || 1));
    // scale 1-5 rating to graph bounds (using 5.0 as max, 0.0 as min)
    const y = (qHeight - qPaddingY) - (item.avg_rating * (qHeight - qPaddingY * 2) / 5);
    return { x, y, date: item.date, rating: item.avg_rating };
  });

  let qLinePath = "";
  let qAreaPath = "";
  if (ratingPoints.length > 0) {
    qLinePath = `M ${ratingPoints[0].x} ${ratingPoints[0].y} ` + 
                ratingPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    qAreaPath = `${qLinePath} L ${ratingPoints[ratingPoints.length - 1].x} ${qHeight - qPaddingY} L ${ratingPoints[0].x} ${qHeight - qPaddingY} Z`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div>
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Editorial content statistics, AI metrics, and editor reviews</p>
      </div>

      <div className="divider" />

      {/* Row 1: KPI Grid */}
      <div className="kpi-grid">
        
        {/* Card 1: Total Moderated */}
        <div className="card" style={{ padding: '20px', borderTop: '3px solid var(--sidebar-bg)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Total Moderated</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: 700, color: 'var(--ink)', marginTop: '8px' }}>
            {total_comments_moderated}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>System total reads</span>
        </div>

        {/* Card 2: Allow Rate */}
        <div className="card" style={{ padding: '20px', borderTop: '3px solid var(--allow-border)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Allow Rate</span>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '44px', fontWeight: 700, color: 'var(--allow-color)', marginTop: '8px' }}>
            {safe_to_publish_rate}%
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>AI-approved comment percentage</span>
        </div>

        {/* Card 3: Pending Decisions */}
        <div
          className="card"
          style={{
            padding: '20px',
            borderTop: `3px solid ${pending_editor_decisions > 0 ? 'var(--review-border)' : 'var(--allow-border)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Pending Decisions</span>
            {pending_editor_decisions > 0 && (
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--review-border)',
                  marginLeft: '6px'
                }}
                className="blinking-dot"
              />
            )}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '44px',
              fontWeight: 700,
              color: pending_editor_decisions > 0 ? 'var(--review-color)' : 'var(--allow-color)',
              marginTop: '8px'
            }}
          >
            {pending_editor_decisions}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {pending_editor_decisions > 0 ? '⚠️ Action Required' : '✓ Queue Clear'}
          </span>
        </div>

        {/* Card 4: Avg Confidence */}
        <div className="card" style={{ padding: '20px', borderTop: '3px solid var(--sidebar-active-border)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Avg Confidence</span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '44px', fontWeight: 700, color: 'var(--ink)', marginTop: '8px' }}>
            {average_confidence_score.toFixed(0)}%
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>AI prediction confidence</span>
        </div>

      </div>

      {/* Row 2: Stacked Verdict Breakdown */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>
          Comment Verdicts
        </h3>
        
        {total_comments_moderated === 0 ? (
          <div style={{ height: '24px', backgroundColor: 'var(--border)', borderRadius: '4px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px', lineHeight: '24px' }}>
            No data recorded
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Stacked bar */}
            <div style={{ height: '28px', width: '100%', display: 'flex', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--border)' }}>
              {pctAllow > 0 && (
                <div
                  style={{
                    width: `${pctAllow}%`,
                    backgroundColor: 'var(--allow-border)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {pctAllow > 5 ? `${Math.round(pctAllow)}%` : ''}
                </div>
              )}
              {pctReview > 0 && (
                <div
                  style={{
                    width: `${pctReview}%`,
                    backgroundColor: 'var(--review-border)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {pctReview > 5 ? `${Math.round(pctReview)}%` : ''}
                </div>
              )}
              {pctReject > 0 && (
                <div
                  style={{
                    width: `${pctReject}%`,
                    backgroundColor: 'var(--reject-border)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {pctReject > 5 ? `${Math.round(pctReject)}%` : ''}
                </div>
              )}
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--allow-border)' }} />
                <span>ALLOW ({allowCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--review-border)' }} />
                <span>NEEDS_REVIEW ({reviewCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--reject-border)' }} />
                <span>REJECT ({rejectCount})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: 2-column graph grid */}
      <div className="details-grid">
        
        {/* Left Column: Daily Volume Line Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>
            Daily Volume
          </h3>
          
          <div style={{ width: '100%', overflowX: 'auto' }}>
            {daily_volume.length === 0 ? (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                No records to chart
              </div>
            ) : (
              <svg width="100%" height="180" viewBox={`0 0 ${volWidth} ${volHeight}`} preserveAspectRatio="xMidYMid meet">
                {/* Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = volPaddingY + ratio * (volHeight - volPaddingY * 2);
                  return (
                    <line key={i} x1={volPaddingX} y1={y} x2={volWidth - volPaddingX} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                  );
                })}
                
                {/* Path line */}
                {volLinePath && (
                  <path d={volLinePath} fill="none" stroke="var(--sidebar-bg)" strokeWidth="2.5" />
                )}

                {/* Plot points */}
                {volumePoints.map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="var(--sidebar-bg)" stroke="var(--white)" strokeWidth="1.5" />
                    <text x={pt.x} y={pt.y - 8} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--ink)">
                      {pt.count}
                    </text>
                  </g>
                ))}

                {/* X-axis labels */}
                {volumePoints.map((pt, idx) => (
                  (idx % 2 === 0 || idx === daily_volume.length - 1) && (
                    <text key={idx} x={pt.x} y={volHeight - 8} textAnchor="middle" fontSize="9" fill="var(--muted)">
                      {pt.date}
                    </text>
                  )
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* Right Column: Category Breakdown Horizontal Bars */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>
            Category Breakdown
          </h3>
          
          {categoriesList.length === 0 ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No items to chart
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoriesList.map((item, idx) => {
                const widthPct = (item.count / maxCategoryCount) * 100;
                
                // Color mapping
                let barColor = 'var(--allow-border)';
                if (['Abusive', 'Defamation', 'Hate Speech'].includes(item.category)) {
                  barColor = 'var(--reject-border)';
                } else if (['Borderline', 'Political Inflammatory'].includes(item.category)) {
                  barColor = 'var(--review-border)';
                }

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink)', width: '130px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '500' }}>
                      {item.category}
                    </span>
                    <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${widthPct}%`,
                          backgroundColor: barColor,
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--muted)', width: '24px', textAlign: 'right' }}>
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Row 4: Quality Trend Area Chart */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '16px' }}>
          Editor Rating Trend
        </h3>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          {quality_trend.length === 0 ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No feedback rating data
            </div>
          ) : (
            <svg width="100%" height="180" viewBox={`0 0 ${qWidth} ${qHeight}`} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--review-border)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--review-border)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[1, 2, 3, 4, 5].map((val) => {
                const y = (qHeight - qPaddingY) - (val * (qHeight - qPaddingY * 2) / 5);
                return (
                  <line key={val} x1={qPaddingX} y1={y} x2={qWidth - qPaddingX} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                );
              })}

              {/* Area path */}
              {qAreaPath && (
                <path d={qAreaPath} fill="url(#trendGrad)" />
              )}

              {/* Line path */}
              {qLinePath && (
                <path d={qLinePath} fill="none" stroke="var(--review-border)" strokeWidth="2.5" />
              )}

              {/* Dots and Labels */}
              {ratingPoints.map((pt, idx) => (
                pt.rating > 0 && (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="3.5" fill="var(--review-border)" stroke="var(--white)" strokeWidth="1" />
                    <text x={pt.x} y={pt.y - 7} textAnchor="middle" fontSize="8" fontWeight="600" fontFamily="var(--font-mono)" fill="var(--ink)">
                      {pt.rating.toFixed(1)}
                    </text>
                  </g>
                )
              ))}

              {/* X-axis labels */}
              {ratingPoints.map((pt, idx) => (
                (idx % 2 === 0 || idx === quality_trend.length - 1) && (
                  <text key={idx} x={pt.x} y={qHeight - 8} textAnchor="middle" fontSize="9" fill="var(--muted)">
                    {pt.date}
                  </text>
                )
              ))}
            </svg>
          )}
        </div>
      </div>

    </div>
  );
}
