import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  const displayMessage = message || 'Unable to get an answer. Please make sure the backend is running and try again.';

  return (
    <div className="error-message-card">
      <div className="error-icon-wrapper">
        <AlertCircle size={20} />
      </div>
      <div className="error-text-container">
        <h4>Request Failed</h4>
        <p>{displayMessage}</p>
      </div>
    </div>
  );
}
