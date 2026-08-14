import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuestionInput from './components/QuestionInput';
import AnswerCard from './components/AnswerCard';
import SourceCard from './components/SourceCard';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import ErrorMessage from './components/ErrorMessage';
import IngestionDashboard from './components/IngestionDashboard';
import { askQuestion, checkIngestionStatus } from './services/api';
import { MessageSquareCode, RefreshCw } from 'lucide-react';
import './App.css';

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAsked, setHasAsked] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [expandedSourceIndex, setExpandedSourceIndex] = useState(null);
  const [isIndexed, setIsIndexed] = useState(true);
  const [activeTab, setActiveTab] = useState('qa');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await checkIngestionStatus();
        setIsIndexed(res.indexed);
        if (!res.indexed) {
          setActiveTab('ingest');
        }
      } catch (err) {
        console.error("Error checking ingestion status:", err);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    
    const query = question;
    setLoading(true);
    setError(null);
    setHasAsked(true);
    setCurrentQuestion(query);
    setQuestion(''); // Clear the input field for new entries
    setAnswer('');
    setSources([]);
    setExpandedSourceIndex(null);
    
    try {
      const data = await askQuestion(query);
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      console.error("Error asking question:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuestion(suggestion);
  };

  const handleReset = () => {
    setQuestion('');
    setAnswer('');
    setSources([]);
    setError(null);
    setHasAsked(false);
    setCurrentQuestion('');
    setExpandedSourceIndex(null);
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} isIndexed={isIndexed} />
      
      <main className="main-content">
        {activeTab === 'ingest' ? (
          <IngestionDashboard 
            onIngestionSuccess={() => setIsIndexed(true)} 
            onNavigateToQA={() => setActiveTab('qa')} 
          />
        ) : !hasAsked ? (
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
                <button className="reset-btn" onClick={handleReset} title="Clear history and ask new question">
                  <RefreshCw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {loading && <LoadingState />}
            
            {error && <ErrorMessage message={error} />}

            {!loading && !error && answer && (
              <div className="response-layout">
                <AnswerCard answer={answer} />
                
                {sources.length > 0 ? (
                  <div className="sources-section">
                    <div className="sources-section-header">
                      <h3>Referenced Sources</h3>
                      <p>These code blocks were matched semantically to build the answer</p>
                    </div>
                    <div className="sources-list">
                      {sources.map((source, index) => (
                        <SourceCard 
                          key={source.id || index} 
                          source={source} 
                          index={index} 
                          isExpanded={expandedSourceIndex === index}
                          onToggle={() => setExpandedSourceIndex(expandedSourceIndex === index ? null : index)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-sources-alert">
                    <p>No source references were returned for this answer.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <div className="input-sticky-footer">
        <div className="footer-input-limiter">
          {isIndexed ? (
            <QuestionInput 
              question={question} 
              setQuestion={setQuestion} 
              onSubmit={handleSubmit} 
              loading={loading} 
            />
          ) : (
            <div className="input-disabled-notice-card">
              <span>Index a codebase to start asking questions.</span>
              <button 
                className="goto-ingest-btn-action" 
                onClick={() => setActiveTab('ingest')}
                type="button"
              >
                Go to Ingestion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
