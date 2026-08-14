import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

const SUGGESTIONS = [
  "Where is the code that scans Java files?",
  "How does authentication work?",
  "Where is the database connection configured?",
  "How does the application process requests?"
];

export default function EmptyState({ onSelectSuggestion }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon-wrapper">
        <Sparkles className="empty-state-icon" size={48} />
      </div>
      <h2>Ask anything about your codebase</h2>
      <p className="empty-state-description">
        Search through your indexed source code and get answers with file and line references.
      </p>
      
      <div className="suggestions-container">
        <h3 className="suggestions-title">
          <HelpCircle size={16} />
          Suggested Questions
        </h3>
        <div className="suggestions-grid">
          {SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className="suggestion-chip"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
