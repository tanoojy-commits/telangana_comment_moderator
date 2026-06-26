import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ModerationForm from './components/ModerationForm';
import OutputDisplay from './components/OutputDisplay';
import HistoryPanel from './components/HistoryPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TemplatePresets from './components/TemplatePresets';

export default function App() {
  const [activeView, setActiveView] = useState('moderate');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Notification System
  const showToast = (message, type) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type, isDismissing: false }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDismissing: true } : t))
    );
    // Remove from DOM after slide-out animation finishes (approx 300ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setLatestResult(null); // Clear previous output when loading template
    setActiveView('moderate');
  };

  const handleAnalysisSuccess = (result) => {
    setLatestResult(result);
    setSelectedTemplate(null);

    // Toast messages by verdict
    const verdict = result.verdict;
    if (verdict === 'ALLOW') {
      showToast('✅ Comment approved — safe to publish', 'allow');
    } else if (verdict === 'NEEDS_REVIEW') {
      showToast('⚠️ Sent to editor review queue', 'review');
    } else if (verdict === 'REJECT') {
      showToast('❌ Comment rejected — do not publish', 'reject');
    } else {
      showToast('Comment analyzed successfully.', 'allow');
    }
  };

  const handleAnalysisFailure = () => {
    showToast('❌ Analysis failed — please retry', 'error');
  };

  const handleReanalyze = () => {
    if (latestResult) {
      setSelectedTemplate({
        article_title: latestResult.article_title,
        reader_name: latestResult.reader_name,
        comment_text: latestResult.comment_text
      });
      setLatestResult(null);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'moderate':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1 className="page-title">Comment Moderation</h1>
              <p className="page-subtitle">Review reader comments for publication safety</p>
            </div>
            <div className="divider" />
            
            <ModerationForm
              onAnalysisSuccess={handleAnalysisSuccess}
              onAnalysisFailure={handleAnalysisFailure}
              prefillData={selectedTemplate}
              showToast={showToast}
              latestResult={latestResult}
            />
            
            {latestResult && (
              <OutputDisplay
                result={latestResult}
                onReanalyze={handleReanalyze}
                showToast={showToast}
                onDecisionSubmitted={(updatedRecord) => {
                  setLatestResult(updatedRecord);
                  showToast('✅ Editor decision recorded', 'allow');
                }}
              />
            )}
          </div>
        );
      case 'history':
        return <HistoryPanel showToast={showToast} />;
      case 'analytics':
        return <AnalyticsDashboard showToast={showToast} />;
      case 'templates':
        return <TemplatePresets onUseTemplate={handleSelectTemplate} />;
      default:
        return (
          <div className="card" style={{ padding: '24px' }}>
            <h2>View Not Found</h2>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main content viewport */}
      <main className="main-content">
        {renderActiveView()}
      </main>

      {/* Toast Notification Queue */}
      <div className="toast-container">
        {toasts.map((toast) => {
          let toastClass = 'toast';
          if (toast.type === 'allow') toastClass += ' allow';
          else if (toast.type === 'review') toastClass += ' review';
          else if (toast.type === 'reject') toastClass += ' reject';
          else if (toast.type === 'error') toastClass += ' error';
          
          if (toast.isDismissing) toastClass += ' dismissing';

          return (
            <div key={toast.id} className={toastClass}>
              <div className="toast-content">
                <span>{toast.message}</span>
              </div>
              <button className="toast-close" onClick={() => dismissToast(toast.id)}>✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
