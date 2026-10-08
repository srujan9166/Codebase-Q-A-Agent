import React, { useState, useRef } from 'react';
import { UploadCloud, FileArchive, CheckCircle2, AlertCircle, Play, MessageSquare } from 'lucide-react';
import { uploadCodebase } from '../services/api';
import IngestionSummary from './IngestionSummary';

const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function IngestionDashboard({ onIngestionSuccess, onNavigateToQA }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, FILE_SELECTED, UPLOADING, INGESTING, COMPLETED, ERROR
  const [errorMsg, setErrorMsg] = useState('');
  const [summary, setSummary] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    setErrorMsg('');
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg('Invalid file type. Only ZIP archives are supported.');
      setStatus('ERROR');
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`File too large. Maximum size allowed is ${MAX_FILE_SIZE_MB} MB.`);
      setStatus('ERROR');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setStatus('FILE_SELECTED');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const startIngestion = async () => {
    if (!file) return;

    setStatus('UPLOADING');
    setErrorMsg('');
    let ingestingTimer = null;
    try {
      ingestingTimer = setTimeout(() => {
        setStatus('INGESTING');
      }, 2000);

      const result = await uploadCodebase(file);
      if (ingestingTimer) clearTimeout(ingestingTimer);
      setSummary(result);
      setStatus('COMPLETED');
      onIngestionSuccess();
    } catch (err) {
      if (ingestingTimer) clearTimeout(ingestingTimer);
      console.error(err);
      setErrorMsg(err.message || 'Codebase ingestion failed.');
      setStatus('ERROR');
    }
  };

  return (
    <div className="ingestion-dashboard">
      <div className="ingestion-card">
        <div className="ingestion-header">
          <h2>Codebase Ingestion</h2>
          <p className="ingestion-subtitle">Upload your codebase archive to index it for semantic RAG search</p>
        </div>

        {/* Drag & Drop Zone */}
        {status !== 'COMPLETED' && (
          <div 
            className={`drag-drop-zone ${dragOver ? 'drag-over' : ''} ${status === 'UPLOADING' || status === 'INGESTING' ? 'disabled' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files[0])}
              accept=".zip"
              style={{ display: 'none' }}
              disabled={status === 'UPLOADING' || status === 'INGESTING'}
            />
            
            <div className="zone-content">
              <UploadCloud size={40} className="upload-icon" />
              <h3>Drag & drop ZIP here</h3>
              <span>or</span>
              <button 
                type="button" 
                className="select-file-btn"
                disabled={status === 'UPLOADING' || status === 'INGESTING'}
              >
                Select ZIP
              </button>
              <p className="zone-limits">Supports codebase projects (.zip) up to {MAX_FILE_SIZE_MB}MB</p>
            </div>
          </div>
        )}

        {/* File Details / Status Display */}
        {file && status !== 'COMPLETED' && (
          <div className="file-status-panel">
            <div className="file-info-row">
              <FileArchive size={20} className="file-archive-icon" />
              <div className="file-meta">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>

            {status === 'FILE_SELECTED' && (
              <button 
                className="start-ingest-btn" 
                onClick={startIngestion}
                type="button"
              >
                <Play size={16} />
                <span>Start Ingestion</span>
              </button>
            )}

            {(status === 'UPLOADING' || status === 'INGESTING') && (
              <div className="ingestion-progress">
                <div className="progress-spinner">
                  <LoaderIcon className="spin" />
                </div>
                <span>{status === 'UPLOADING' ? 'Uploading codebase...' : 'Processing codebase...'}</span>
              </div>
            )}
          </div>
        )}

        {/* Processing State Notice */}
        {status === 'UPLOADING' && (
          <div className="processing-notice">
            <div className="spinner-glow"></div>
            <span>Uploading ZIP archive to codebase server...</span>
          </div>
        )}

        {status === 'INGESTING' && (
          <div className="processing-notice">
            <div className="spinner-glow"></div>
            <span>Extracting files, scanning Java constructs, and generating vector embeddings...</span>
          </div>
        )}

        {/* Completed View */}
        {status === 'COMPLETED' && summary && (
          <div className="ingestion-success-view">
            <div className="success-banner">
              <CheckCircle2 size={48} className="success-banner-icon" />
              <h3>Ingestion Completed</h3>
              <p>{summary.duplicatesSkipped === summary.chunksGenerated ? 'Codebase already partially indexed.' : 'Codebase indexed successfully.'}</p>
            </div>

            <IngestionSummary summary={summary} />

            <div className="success-actions">
              <button 
                onClick={onNavigateToQA} 
                className="ask-questions-nav-btn"
                type="button"
              >
                <MessageSquare size={16} />
                <span>Ask Questions</span>
              </button>
            </div>
          </div>
        )}

        {/* Error State View */}
        {status === 'ERROR' && (
          <div className="ingestion-error-alert">
            <AlertCircle size={20} />
            <div className="error-alert-content">
              <h4>Ingestion Failed</h4>
              <p>{errorMsg || 'An error occurred during codebase ingestion.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoaderIcon({ className }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
      style={{ width: '20px', height: '20px' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity={0.25} />
      <path stroke="currentColor" strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
