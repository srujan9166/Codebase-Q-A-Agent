import React, { useState } from 'react';
import { Bot, Copy, Check, Code } from 'lucide-react';

export default function AnswerPanel({ answer }) {
  const [copied, setCopied] = useState(false);

  if (!answer) return null;

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy answer:", err);
    }
  };

  // Helper to parse answer markdown blocks (code blocks vs text paragraphs)
  const renderFormattedAnswer = (text) => {
    const blocks = [];
    const codeBlockRegex = /```([a-zA-Z0-9_]*)\n([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        const textChunk = text.substring(lastIndex, match.index);
        blocks.push({ type: 'text', content: textChunk });
      }

      // Code block
      const language = match[1] || 'code';
      const codeContent = match[2].trim();
      blocks.push({ type: 'code', language, content: codeContent });

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      blocks.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return blocks.map((block, idx) => {
      if (block.type === 'code') {
        return <CodeBlock key={idx} language={block.language} code={block.content} />;
      }
      return <TextBlock key={idx} text={block.content} />;
    });
  };

  return (
    <div className="answer-panel-card">
      <div className="answer-panel-header">
        <div className="answer-title-group">
          <Bot size={18} className="bot-icon" />
          <h3>AI ANSWER</h3>
        </div>
        <button 
          onClick={handleCopyAll} 
          className="copy-answer-btn"
          title="Copy answer text"
          type="button"
        >
          {copied ? <Check size={14} className="icon-success" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy Text'}</span>
        </button>
      </div>

      <div className="answer-panel-body">
        {renderFormattedAnswer(answer)}
      </div>
    </div>
  );
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="fenced-code-block">
      <div className="fenced-code-header">
        <span className="code-lang-badge">{language}</span>
        <button className="copy-code-inline-btn" onClick={handleCopyCode} type="button">
          {copied ? <Check size={12} className="icon-success" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="fenced-code-content">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextBlock({ text }) {
  const lines = text.split('\n');
  return (
    <div className="text-block-wrapper">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="para-spacer" />;
        
        // Inline code formatting helper
        const formattedLine = line.replace(/`([^`]+)`/g, '<code class="inline-code-pill">$1</code>');

        if (line.startsWith('- ') || line.startsWith('* ')) {
          const itemText = line.substring(2).replace(/`([^`]+)`/g, '<code class="inline-code-pill">$1</code>');
          return (
            <div key={idx} className="bullet-line">
              <span className="bullet-point">•</span>
              <span dangerouslySetInnerHTML={{ __html: itemText }} />
            </div>
          );
        }

        return (
          <p key={idx} className="answer-paragraph" dangerouslySetInnerHTML={{ __html: formattedLine }} />
        );
      })}
    </div>
  );
}
