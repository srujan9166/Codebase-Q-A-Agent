import React, { useState, useEffect } from 'react';
import { FileCode, ChevronDown, ChevronUp, Copy, Check, Loader, AlertTriangle, ExternalLink } from 'lucide-react';
import { getSourceCode } from '../../services/api/askApi';
import { getFileName, formatLineRange, cleanPath } from '../../utils/formatFilePath';

export default function SourceCard({ source, index, isExpanded, onToggle }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showFullPath, setShowFullPath] = useState(false);

  useEffect(() => {
    if (isExpanded && !content && !loading) {
      fetchContent();
    }
  }, [isExpanded]);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSourceCode(source.id);
      setContent(data.content);
    } catch (err) {
      console.error("Error loading code chunk:", err);
      setError(err.message || 'Unable to load source code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code to clipboard:", err);
    }
  };

  const highlightLine = (line) => {
    if (!line) return '';
    let escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight comments
    const commentIndex = escaped.indexOf('//');
    let codePart = escaped;
    let commentPart = '';
    if (commentIndex !== -1) {
      codePart = escaped.substring(0, commentIndex);
      commentPart = `<span class="hl-comment">${escaped.substring(commentIndex)}</span>`;
    }

    // Highlight Strings
    codePart = codePart.replace(/(["'])(.*?)\1/g, '<span class="hl-string">$&</span>');
    // Highlight Annotations
    codePart = codePart.replace(/(@[A-Za-z0-9_]+)/g, '<span class="hl-annotation">$1</span>');
    // Highlight Keywords
    const keywords = ['package', 'import', 'public', 'private', 'protected', 'class', 'interface', 'return', 'void', 'int', 'boolean', 'if', 'else', 'for', 'while', 'new', 'try', 'catch', 'finally', 'final', 'static', 'const', 'let', 'var', 'function', 'export', 'default', 'from'];
    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    codePart = codePart.replace(kwRegex, '<span class="hl-keyword">$1</span>');

    return codePart + commentPart;
  };

  const fileName = getFileName(source.filePath);
  const relativePath = cleanPath(source.filePath);
  const lineRangeText = formatLineRange(source.startLine, source.endLine);

  const lines = content ? content.split('\n') : [];
  const lineNumbers = lines.map((_, i) => source.startLine + i);

  return (
    <div className={`source-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="source-card-main" onClick={onToggle}>
        <div className="source-card-left">
          <div className="source-badge">SOURCE {index + 1}</div>
          <FileCode className="file-icon" size={18} />
          <div className="source-file-info">
            <h4 className="source-file-title">{fileName}</h4>
            <p className="source-path" title={source.filePath}>
              {relativePath || source.filePath}
            </p>
          </div>
        </div>
        <div className="source-card-right">
          <span className="source-lines">{lineRangeText}</span>
          <button 
            className="view-source-btn" 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            type="button"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Close Code' : 'View Code'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="source-card-details code-viewer-panel">
          {loading && (
            <div className="code-viewer-status-container">
              <Loader className="spinner" size={20} />
              <span>Loading source code...</span>
            </div>
          )}

          {error && (
            <div className="code-viewer-status-container error-status">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && content && (
            <div className="code-viewer-content">
              <div className="code-viewer-header">
                <div className="code-viewer-meta">
                  <span className="code-viewer-title">{fileName}</span>
                  <span className="code-viewer-subtitle">{lineRangeText}</span>
                </div>
                <div className="code-viewer-actions">
                  <button 
                    onClick={handleCopy} 
                    className="viewer-action-btn"
                    type="button"
                  >
                    {copied ? <Check size={14} className="success-icon" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
                  </button>
                  <button 
                    onClick={onToggle} 
                    className="viewer-close-btn"
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Code Viewer Table with Line Numbers & Line Highlighting */}
              <div className="source-viewer-scroll-container">
                <div className="source-viewer-table">
                  <div className="line-numbers-column">
                    {lineNumbers.map((num, i) => (
                      <div key={i} className="line-number-cell">{num}</div>
                    ))}
                  </div>
                  <div className="code-lines-column">
                    {lines.map((lineText, i) => (
                      <div 
                        key={i} 
                        className="code-line-cell" 
                        dangerouslySetInnerHTML={{ __html: highlightLine(lineText) || '&nbsp;' }} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="code-viewer-footer">
                <div className="footer-path-row">
                  <span className="footer-path-label">File Path:</span>
                  <span className="footer-path-value" onClick={() => setShowFullPath(!showFullPath)}>
                    {showFullPath ? source.filePath : relativePath}
                    <span className="toggle-path-hint">
                      ({showFullPath ? 'click for relative' : 'click for absolute'})
                    </span>
                  </span>
                </div>
                <span className="footer-chunk-id">Chunk ID: {source.id}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
