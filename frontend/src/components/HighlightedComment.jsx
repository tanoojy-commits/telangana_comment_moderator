import React from 'react';

export default function HighlightedComment({ text, phrases }) {
  if (!text) return null;
  if (!phrases || phrases.length === 0) {
    return <p style={{fontFamily:'Inter',fontSize:'14px',lineHeight:'1.8',color:'#111827'}}>{text}</p>;
  }
  
  // Safely escape regex terms and filter empty inputs
  const validPhrases = phrases.filter(p => p && p.trim() !== '');
  if (validPhrases.length === 0) {
    return <p style={{fontFamily:'Inter',fontSize:'14px',lineHeight:'1.8',color:'#111827'}}>{text}</p>;
  }
  
  const escaped = validPhrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <p style={{fontFamily:'Inter',fontSize:'14px',lineHeight:'1.8',color:'#111827'}}>
      {parts.map((part, i) =>
        validPhrases.some(ph => ph.toLowerCase() === part.toLowerCase())
          ? <mark key={i} style={{background:'#FEF3C7',color:'#92400E',borderRadius:'3px',padding:'1px 4px',fontWeight:'600',fontStyle:'normal'}}>{part}</mark>
          : part
      )}
    </p>
  );
}

// Named export for backward compatibility
export { HighlightedComment };
