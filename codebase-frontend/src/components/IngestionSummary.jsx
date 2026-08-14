import React from 'react';
import { Files, Database, Layers, CheckCircle2, CopySlash } from 'lucide-react';

export default function IngestionSummary({ summary }) {
  if (!summary) return null;

  const stats = [
    {
      label: 'Files Discovered',
      value: summary.filesDiscovered,
      icon: <Files size={18} />,
      color: 'var(--color-primary-light)'
    },
    {
      label: 'Files Processed',
      value: summary.filesProcessed,
      icon: <CheckCircle2 size={18} />,
      color: 'var(--color-text-green)'
    },
    {
      label: 'Chunks Generated',
      value: summary.chunksGenerated,
      icon: <Layers size={18} />,
      color: 'var(--color-accent-light)'
    },
    {
      label: 'New Chunks Indexed',
      value: summary.chunksInserted,
      icon: <Database size={18} />,
      color: 'var(--color-primary-light)'
    },
    {
      label: 'Duplicates Skipped',
      value: summary.duplicatesSkipped,
      icon: <CopySlash size={18} />,
      color: 'var(--color-text-muted)'
    }
  ];

  return (
    <div className="ingestion-summary-container">
      <div className="summary-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="summary-stat-card">
            <div className="stat-card-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value">{stat.value}</span>
              <span className="stat-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
