import React from 'react';
import { Terminal, Cpu } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isIndexed }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-container">
          <Terminal className="logo-icon" size={24} />
        </div>
        <div className="title-container">
          <h1>Codebase Q&A Agent</h1>
          <p className="subtitle">Ask questions about your codebase using AI-powered semantic search.</p>
        </div>
      </div>
      
      {isIndexed && (
        <div className="header-tabs">
          <button 
            className={`header-tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
            onClick={() => setActiveTab('qa')}
            type="button"
          >
            Ask Q&A
          </button>
          <button 
            className={`header-tab-btn ${activeTab === 'ingest' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingest')}
            type="button"
          >
            Ingest Codebase
          </button>
        </div>
      )}

      <div className="header-right">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">Backend Connected</span>
        </div>
      </div>
    </header>
  );
}
