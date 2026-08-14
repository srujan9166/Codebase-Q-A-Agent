import React from 'react';
import { Cpu } from 'lucide-react';

export default function AnswerCard({ answer }) {
  const renderInlineMarkdown = (text) => {
    const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
    const matches = text.split(regex);
    
    return matches.map((match, idx) => {
      if (match.startsWith('`') && match.endsWith('`')) {
        return <code key={idx} className="inline-code">{match.slice(1, -1)}</code>;
      }
      if (match.startsWith('**') && match.endsWith('**')) {
        return <strong key={idx}>{match.slice(2, -2)}</strong>;
      }
      return match;
    });
  };

  const parseMarkdown = (text) => {
    if (!text) return null;

    // Split by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeLines = part.slice(3, -3).trim().split('\n');
        let language = 'plaintext';
        let code = part.slice(3, -3).trim();
        
        if (codeLines.length > 0 && /^[a-zA-Z0-9+#-]+$/.test(codeLines[0])) {
          language = codeLines[0];
          code = codeLines.slice(1).join('\n');
        }

        return (
          <div key={idx} className="code-block-container">
            <div className="code-block-header">
              <span className="code-block-lang">{language}</span>
            </div>
            <pre className="code-block">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      let listItems = [];
      let inList = false;
      let listType = null; // 'ul' or 'ol'
      const renderedLines = [];

      const flushList = (key) => {
        if (listItems.length > 0) {
          if (listType === 'ul') {
            renderedLines.push(<ul key={`ul-${key}`} className="md-ul">{...listItems}</ul>);
          } else {
            renderedLines.push(<ol key={`ol-${key}`} className="md-ol">{...listItems}</ol>);
          }
          listItems = [];
          inList = false;
          listType = null;
        }
      };

      lines.forEach((line, lineIdx) => {
        // Headers
        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          flushList(lineIdx);
          const level = headerMatch[1].length;
          const Tag = `h${level}`;
          renderedLines.push(
            <Tag key={lineIdx} className={`md-header h${level}`}>
              {renderInlineMarkdown(headerMatch[2])}
            </Tag>
          );
          return;
        }

        // Unordered lists
        const ulMatch = line.match(/^[\*\-]\s+(.*)$/);
        if (ulMatch) {
          if (inList && listType !== 'ul') {
            flushList(lineIdx);
          }
          inList = true;
          listType = 'ul';
          listItems.push(<li key={lineIdx}>{renderInlineMarkdown(ulMatch[1])}</li>);
          return;
        }

        // Ordered lists
        const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (olMatch) {
          if (inList && listType !== 'ol') {
            flushList(lineIdx);
          }
          inList = true;
          listType = 'ol';
          listItems.push(<li key={lineIdx}>{renderInlineMarkdown(olMatch[2])}</li>);
          return;
        }

        // Paragraph or spacing
        flushList(lineIdx);
        if (line.trim() === '') {
          renderedLines.push(<div key={lineIdx} className="md-spacing" />);
        } else {
          renderedLines.push(<p key={lineIdx}>{renderInlineMarkdown(line)}</p>);
        }
      });

      flushList(lines.length);
      return <React.Fragment key={idx}>{renderedLines}</React.Fragment>;
    });
  };

  return (
    <div className="answer-card">
      <div className="answer-header">
        <Cpu className="answer-icon" size={18} />
        <h2>AI Answer</h2>
      </div>
      <div className="answer-content">
        {parseMarkdown(answer)}
      </div>
    </div>
  );
}
