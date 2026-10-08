import React from 'react';
import QuestionInput from '../components/qna/QuestionInput';
import AnswerPanel from '../components/qna/AnswerPanel';
import SourceList from '../components/qna/SourceList';
import LoadingState from '../components/qna/LoadingState';
import ErrorMessage from '../components/qna/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { MessageSquareCode, RefreshCw } from 'lucide-react';

export default function QnAPage({ qnaState }) {
  const {
    question,
    setQuestion,
    answer,
    sources,
    loading,
    error,
    hasAsked,
    currentQuestion,
    ask,
    reset
  } = qnaState;

  const handleSelectSuggestion = (suggestion) => {
    setQuestion(suggestion);
    ask(suggestion);
  };

  return (
    <div className="qna-page">
      {!hasAsked ? (
        <EmptyState onSelectSuggestion={handleSelectSuggestion} />
      ) : (
        <div className="results-container">
          <div className="history-item">
            <div className="user-question-bubble">
              <div className="question-bubble-left">
                <MessageSquareCode className="question-icon" size={18} />
                <div className="question-content">
                  <span className="question-label">Your Question</span>
                  <p className="question-text">{currentQuestion}</p>
                </div>
              </div>
              <button className="reset-btn" onClick={reset} title="Ask new question">
                <RefreshCw size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {loading && <LoadingState />}
          {error && <ErrorMessage message={error} />}

          {!loading && !error && answer && (
            <div className="response-layout">
              <AnswerPanel answer={answer} />
              <SourceList sources={sources} />
            </div>
          )}
        </div>
      )}

      <div className="input-sticky-footer">
        <div className="footer-input-limiter">
          <QuestionInput
            question={question}
            setQuestion={setQuestion}
            onSubmit={() => ask()}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
