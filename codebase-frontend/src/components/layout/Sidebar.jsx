import React, { useState } from 'react';
import { FolderGit2, Plus, Clock, Sparkles, Code2, ShieldCheck, Database, Search } from 'lucide-react';

export default function Sidebar({ onSelectQuestion, recentQuestions = [] }) {
  const [searchFilter, setSearchFilter] = useState('');

  const defaultShortcuts = [
    { label: 'Explain this project', icon: Sparkles, query: 'What is this project about and what are its main features?' },
    { label: 'Find authentication', icon: ShieldCheck, query: 'Where is authentication implemented in this codebase?' },
    { label: 'Find database logic', icon: Database, query: 'How does the application connect to PostgreSQL and manage data?' },
    { label: 'Find API endpoints', icon: Code2, query: 'List the main REST API endpoints and controllers in the project.' },
  ];

  const filteredQuestions = recentQuestions.filter(q => 
    q.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <aside className="developer-sidebar">
      {/* Projects Section */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <FolderGit2 size={14} />
          <span>PROJECTS</span>
        </div>
        <div className="project-list">
          <div className="project-item active">
            <span className="project-bullet">●</span>
            <div className="project-info">
              <span className="project-name">Codebase Agent</span>
              <span className="project-tech">Java + Spring Boot + React</span>
            </div>
          </div>
        </div>
        <button className="add-project-btn" type="button" title="Add project (Future feature)">
          <Plus size={14} />
          <span>Add Project</span>
        </button>
      </div>

      <hr className="sidebar-divider" />

      {/* Recent Questions Section with Search Filter */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <Clock size={14} />
          <span>RECENT QUESTIONS</span>
        </div>

        {recentQuestions.length > 3 && (
          <div className="sidebar-search-box">
            <Search size={12} className="search-icon" />
            <input
              type="text"
              placeholder="Filter history..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="sidebar-search-input"
            />
          </div>
        )}

        <div className="recent-questions-list">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q, idx) => (
              <button
                key={idx}
                className="recent-q-item"
                onClick={() => onSelectQuestion && onSelectQuestion(q)}
                type="button"
                title={q}
              >
                <span className="bullet">•</span>
                <span className="recent-q-text">{q}</span>
              </button>
            ))
          ) : (
            <span className="no-recent-text">No matching questions</span>
          )}
        </div>
      </div>

      <hr className="sidebar-divider" />

      {/* Developer Shortcuts Section */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <Sparkles size={14} />
          <span>SHORTCUTS</span>
        </div>
        <div className="shortcuts-list">
          {defaultShortcuts.map((sc, idx) => {
            const Icon = sc.icon;
            return (
              <button
                key={idx}
                className="shortcut-btn"
                onClick={() => onSelectQuestion && onSelectQuestion(sc.query)}
                type="button"
              >
                <Icon size={14} />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
