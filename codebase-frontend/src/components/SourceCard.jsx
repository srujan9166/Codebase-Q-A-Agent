import React, { useState, useEffect } from 'react';
import { FileCode, ChevronDown, ChevronUp, Copy, Check, Info, Loader, AlertTriangle } from 'lucide-react';
import { getSourceCode } from '../services/api';

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

  const getFileName = (path) => {
    if (!path) return 'Unknown File';
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1];
  };

  const cleanPath = (path) => {
    if (!path) return '';
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

  // Simple Java syntax highlighter
  const highlightJavaLine = (line) => {
    if (!line) return '';
    
    // Escape HTML characters
    let escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    // 1. Separate single line comments
    const commentIndex = escaped.indexOf('//');
    let codePart = escaped;
    let commentPart = '';
    if (commentIndex !== -1) {
      codePart = escaped.substring(0, commentIndex);
      commentPart = `<span class="hl-comment">${escaped.substring(commentIndex)}</span>`;
    }
    
    // 2. Highlight Strings
    codePart = codePart.replace(/(["'])(.*?)\1/g, '<span class="hl-string">$&</span>');
    
    // 3. Highlight Annotations
    codePart = codePart.replace(/(@[A-Za-z0-9_]+)/g, '<span class="hl-annotation">$1</span>');
    
    // 4. Highlight Keywords
    const keywordsList = [
      'package', 'import', 'public', 'private', 'protected', 'class', 'interface', 'enum',
      'extends', 'implements', 'new', 'return', 'void', 'int', 'double', 'float', 'long',
      'boolean', 'short', 'byte', 'char', 'final', 'static', 'transient', 'volatile',
      'synchronized', 'try', 'catch', 'finally', 'throw', 'throws', 'if', 'else', 'for',
      'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'this', 'super',
      'true', 'false', 'null'
    ];
    const keywordRegex = new RegExp(`\\b(${keywordsList.join('|')})\\b`, 'g');
    codePart = codePart.replace(keywordRegex, '<span class="hl-keyword">$1</span>');
    
    // 5. Highlight Numbers
    codePart = codePart.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');
    
    // 6. Highlight Methods
    codePart = codePart.replace(/\b([a-zA-Z0-9_]+)(?=\()/g, '<span class="hl-method">$1</span>');
    
    // 7. Highlight Types / Classes
    codePart = codePart.replace(/\b([A-Z][a-zA-Z0-9_]+)\b/g, (match) => {
      if (['String', 'Object', 'System', 'List', 'Map', 'Set', 'Optional', 'ResponseEntity'].includes(match)) {
        return `<span class="hl-type">${match}</span>`;
      }
      return `<span class="hl-class">${match}</span>`;
    });
    
    return codePart + commentPart;
  };

  const fileName = getFileName(source.filePath);
  const relativePath = cleanPath(source.filePath);

  const lineNumbers = content 
    ? Array.from({ length: content.split('\n').length }, (_, i) => source.startLine + i)
    : [];

  const highlightedLines = content
    ? content.split('\n').map(line => highlightJavaLine(line))
    : [];

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
            <span>{isExpanded ? 'Close' : 'View Source'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="source-card-details code-viewer-panel">
          {loading && (
            <div className="code-viewer-status-container">
              <Loader className="spinner" size={20} />
              <span>Loading source...</span>
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
                  <span className="code-viewer-subtitle">Lines {source.startLine}–{source.endLine}</span>
                  {source.chunkType && <span className="code-viewer-badge">{source.chunkType}</span>}
                </div>
                <div className="code-viewer-actions">
                  <button 
                    onClick={handleCopy} 
                    className="viewer-action-btn"
                    title="Copy code to clipboard"
                    type="button"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="success-icon" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Code</span>
                      </>
                    )}
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

              <div className="source-viewer-scroll-container">
                <div className="source-viewer-table">
                  <div className="line-numbers-column">
                    {lineNumbers.map((num, i) => (
                      <div key={i} className="line-number-cell">{num}</div>
                    ))}
                  </div>
                  <div className="code-lines-column">
                    {highlightedLines.map((htmlLine, i) => (
                      <div 
                        key={i} 
                        className="code-line-cell" 
                        dangerouslySetInnerHTML={{ __html: htmlLine || ' ' }} 
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
                      ({showFullPath ? 'show relative' : 'show absolute'})
                    </span>
                  </span>
                </div>
                <div className="footer-meta-row">
                  <span>Chunk ID: {source.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
