import React, { useRef, useEffect } from 'react';
import { CornerDownLeft, Sparkles, Loader } from 'lucide-react';

export default function QuestionInput({ question, setQuestion, onSubmit, loading }) {
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [question]);

  const handleKeyDown = (e) => {
    // Ctrl + Enter to submit
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (question.trim() && !loading) {
        onSubmit();
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && !loading) {
      onSubmit();
    }
  };

  return (
    <form className="question-form" onSubmit={handleFormSubmit}>
      <div className="input-container-wrapper">
        <div className="textarea-container">
          <textarea
            ref={textareaRef}
            rows={1}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your codebase..."
            disabled={loading}
            className="question-textarea"
          />
          <div className="input-hint">
            <span className="keyboard-shortcut">
              <CornerDownLeft size={10} />
              Ctrl+Enter to ask
            </span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="ask-button"
        >
          {loading ? (
            <>
              <Loader className="spinner" size={16} />
              <span>Searching codebase...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Ask Question</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
