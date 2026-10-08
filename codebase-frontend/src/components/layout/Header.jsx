import React from 'react';
import { Terminal, Database, UploadCloud, MessageSquareCode, Settings } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isIndexed }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-container">
          <Terminal size={22} />
        </div>
        <div className="title-container">
          <h1>Codebase Q&A Agent</h1>
          <span className="subtitle">Developer Semantic RAG Search</span>
        </div>
      </div>

      <div className="header-tabs">
        <button 
          className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
          onClick={() => setActiveTab('qa')}
          type="button"
        >
          <MessageSquareCode size={16} />
          <span>Codebase Q&A</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ingest' ? 'active' : ''}`}
          onClick={() => setActiveTab('ingest')}
          type="button"
        >
          <UploadCloud size={16} />
          <span>Ingest Codebase</span>
        </button>
      </div>

      <div className="header-right">
        <div className="status-indicator">
          <Database size={14} className={isIndexed ? 'icon-success' : 'icon-warning'} />
          <span className="status-label">
            {isIndexed ? 'Indexed' : 'Not Indexed'}
          </span>
        </div>
        <button className="settings-btn" title="Settings" type="button">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
