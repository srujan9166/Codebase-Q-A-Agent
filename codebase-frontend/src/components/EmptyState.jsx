import React from 'react';
import { Sparkles, Terminal, Code2, ShieldAlert, Database, Compass, Cpu, Layers } from 'lucide-react';

const SUGGESTION_CATEGORIES = [
  {
    category: "Architecture & Flow",
    icon: Compass,
    color: "accent-indigo",
    questions: [
      "What is this project about and what are its main components?",
      "How does the application parse and chunk Java files?",
    ]
  },
  {
    category: "Data & Storage",
    icon: Database,
    color: "accent-emerald",
    questions: [
      "Where is the PostgreSQL database and pgvector connection configured?",
      "How are code chunks stored and indexed in the vector store?",
    ]
  },
  {
    category: "APIs & Ingestion",
    icon: Code2,
    color: "accent-purple",
    questions: [
      "What REST API endpoints are exposed for ingestion and question asking?",
      "How does the application handle Git repository cloning and scanning?",
    ]
  }
];

export default function EmptyState({ onSelectSuggestion }) {
  return (
    <div className="empty-state-container">
      {/* Hero Badge & Title */}
      <div className="empty-hero">
        <div className="hero-badge-pill">
          <Cpu size={13} className="spin-slow" />
          <span>RAG-Powered Code Search</span>
        </div>
        
        <h2 className="empty-hero-title">
          Explore Your Codebase with <span className="gradient-text">Semantic AI</span>
        </h2>
        
        <p className="empty-hero-description">
          Ask questions in natural language. The agent searches indexed AST chunks in pgvector and returns AI answers with exact file and line citations.
        </p>

        {/* Feature Pills */}
        <div className="feature-pills-row">
          <div className="feature-pill">
            <Layers size={13} />
            <span>Java AST Chunking</span>
          </div>
          <div className="feature-pill">
            <Database size={13} />
            <span>PostgreSQL pgvector</span>
          </div>
          <div className="feature-pill">
            <Sparkles size={13} />
            <span>Gemini 3.6 Embeddings</span>
          </div>
        </div>
      </div>

      {/* Suggested Questions Grid by Category */}
      <div className="suggestions-section">
        <div className="suggestions-header">
          <Terminal size={15} />
          <span>SUGGESTED EXPLORATION PROMPTS</span>
        </div>

        <div className="categories-grid">
          {SUGGESTION_CATEGORIES.map((cat, catIdx) => {
            const Icon = cat.icon;
            return (
              <div key={catIdx} className={`category-card ${cat.color}`}>
                <div className="category-header">
                  <Icon size={16} className="category-icon" />
                  <h4>{cat.category}</h4>
                </div>
                <div className="category-questions">
                  {cat.questions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      className="category-question-btn"
                      onClick={() => onSelectSuggestion(q)}
                      type="button"
                    >
                      <span className="q-arrow">→</span>
                      <span className="q-text">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

