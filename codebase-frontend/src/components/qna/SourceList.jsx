import React, { useState } from 'react';
import SourceCard from './SourceCard';
import { Layers } from 'lucide-react';

export default function SourceList({ sources }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!sources || sources.length === 0) {
    return (
      <div className="no-sources-card">
        <p>No source references were returned for this answer.</p>
      </div>
    );
  }

  return (
    <div className="sources-section">
      <div className="sources-section-header">
        <div className="sources-title-group">
          <Layers size={16} />
          <h3>SOURCES</h3>
          <span className="source-count-badge">{sources.length}</span>
        </div>
      </div>
      
      <div className="sources-list">
        {sources.map((source, index) => (
          <SourceCard
            key={source.id || index}
            source={source}
            index={index}
            isExpanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
}
