import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="loading-state">
      <div className="spinner-wrapper">
        <Loader className="loading-spinner" size={32} />
      </div>
      <p className="loading-text">Searching your codebase...</p>
      <p className="loading-subtext">Retrieving relevant chunks & formulating answer with AI</p>
    </div>
  );
}
