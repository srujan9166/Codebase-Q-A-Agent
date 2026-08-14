import React from 'react';
import { Terminal, Cpu } from 'lucide-react';

export default function Header() {
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
      <div className="header-right">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">Backend Connected</span>
        </div>
      </div>
    </header>
  );
}
