const API_BASE = import.meta.env.VITE_API_URL || '';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `HTTP error! Status: ${response.status}`;
    throw new Error(message);
  }
  return response.json();
}

/**
 * Moderates a comment and returns the result shape:
 * { verdict, category, confidence_score, reason, problematic_phrases, safe_to_publish, editor_note, suggested_edit }
 */
export async function analyzeComment(article_title, reader_name, comment_text) {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ article_title, reader_name, comment_text })
  });
  return handleResponse(response);
}

export async function analyzeCommentBatch(comments) {
  const response = await fetch(`${API_BASE}/api/generate/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comments })
  });
  return handleResponse(response);
}

export async function getHistory(page = 1, limit = 20, verdictFilter = '', searchQuery = '') {
  let url = `${API_BASE}/api/history?page=${page}&limit=${limit}`;
  if (verdictFilter) {
    url += `&verdict=${encodeURIComponent(verdictFilter)}`;
  }
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }
  
  const response = await fetch(url);
  return handleResponse(response);
}

export async function getHistoryItem(id) {
  const response = await fetch(`${API_BASE}/api/history/${id}`);
  return handleResponse(response);
}

export async function deleteHistoryItem(id) {
  const response = await fetch(`${API_BASE}/api/history/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export async function submitFeedback(record_id, rating, comment) {
  const response = await fetch(`${API_BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ record_id, rating, comment })
  });
  return handleResponse(response);
}

export async function getFeedbackSummary() {
  const response = await fetch(`${API_BASE}/api/feedback/summary`);
  return handleResponse(response);
}

export async function getAnalytics() {
  const response = await fetch(`${API_BASE}/api/analytics`);
  return handleResponse(response);
}

export async function getTemplates() {
  const response = await fetch(`${API_BASE}/api/templates`);
  return handleResponse(response);
}

export async function createTemplate(data) {
  const response = await fetch(`${API_BASE}/api/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function submitEditorDecision(recordId, editor_verdict, editor_decision_note) {
  const response = await fetch(`${API_BASE}/api/history/${recordId}/editor-decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editor_verdict, editor_decision_note })
  });
  return handleResponse(response);
}
