import React from 'react';
import { FileCode, ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function SourceCard({ source, index, isExpanded, onToggle }) {
  const getFileName = (path) => {
    if (!path) return 'Unknown File';
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1];
  };

  const cleanPath = (path) => {
    if (!path) return '';
    // Look for '\src\' or '\test\' to start relative path
    const srcIndex = path.toLowerCase().indexOf('\\src\\');
    if (srcIndex !== -1) {
      return path.substring(srcIndex + 1).replace(/\\/g, '/');
    }
    const testIndex = path.toLowerCase().indexOf('\\test\\');
    if (testIndex !== -1) {
      return path.substring(testIndex + 1).replace(/\\/g, '/');
    }
    return path.replace(/\\/g, '/');
  };

  const fileName = getFileName(source.filePath);
  const relativePath = cleanPath(source.filePath);

  return (
    <div className={`source-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="source-card-main">
        <div className="source-card-left">
          <div className="source-index-label">
            SOURCE {index + 1}
          </div>
          <div className="source-file-info">
            <div className="source-file-name-row">
              <FileCode className="file-icon" size={16} />
              <h4>{fileName}</h4>
            </div>
            <p className="source-path" title={source.filePath}>
              {relativePath || source.filePath}
            </p>
          </div>
        </div>
        <div className="source-card-right">
          <span className="source-lines">
            Lines {source.startLine}–{source.endLine}
          </span>
          <button 
            className="view-source-btn" 
            onClick={onToggle}
            type="button"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Close' : 'View Details'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="source-card-details">
          <div className="detail-row">
            <span className="detail-label">File Path</span>
            <code className="detail-value absolute-path">{source.filePath}</code>
          </div>
          <div className="detail-grid">
            <div className="detail-row">
              <span className="detail-label">Line Range</span>
              <span className="detail-value">{source.startLine}–{source.endLine}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Chunk ID</span>
              <span className="detail-value">{source.id}</span>
            </div>
          </div>
          <div className="detail-info-alert">
            <Info size={14} className="alert-info-icon" />
            <p className="detail-info-text">
              Source code content is not available from the current backend response.
            </p>
          </div>
          <div className="detail-close-row">
            <button 
              className="detail-close-btn" 
              onClick={onToggle}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
