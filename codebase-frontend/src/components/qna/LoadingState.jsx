import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="loading-card">
      <div className="loading-spinner-wrapper">
        <Loader className="spinner" size={28} />
      </div>
      <div className="loading-text-group">
        <h4>Analyzing codebase...</h4>
        <p>Performing semantic search & retrieving relevant source chunks</p>
      </div>
    </div>
  );
}
