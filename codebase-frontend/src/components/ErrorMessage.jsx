import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  const displayMessage = message?.includes('Unable to connect')
    ? message
    : message?.includes('429') 
    ? 'Gemini API limit exceeded. Please try again in a few seconds.'
    : message?.includes('503')
    ? 'Gemini API is currently overloaded or experiencing high demand. Please try again shortly.'
    : 'Unable to generate an answer. Please try again.';

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
