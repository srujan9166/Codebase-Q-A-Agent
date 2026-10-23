import React, { useState, useRef } from 'react';
import { UploadCloud, FileArchive, CheckCircle2, AlertCircle, Play, MessageSquare, GitBranch, Globe } from 'lucide-react';
import { uploadCodebase, ingestGitCodebase } from '../services/api';
import IngestionSummary from './IngestionSummary';

const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function IngestionDashboard({ onIngestionSuccess, onNavigateToQA }) {
  const [ingestMode, setIngestMode] = useState('git'); // 'git' or 'zip'
  const [gitUrl, setGitUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, FILE_SELECTED, UPLOADING, CLONING, INGESTING, COMPLETED, ERROR
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

  const startZipIngestion = async () => {
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

  const startGitIngestion = async (e) => {
    if (e) e.preventDefault();
    if (!gitUrl.trim()) {
      setErrorMsg('Please enter a Git repository URL.');
      setStatus('ERROR');
      return;
    }

    setStatus('CLONING');
    setErrorMsg('');
    let ingestingTimer = null;

    try {
      ingestingTimer = setTimeout(() => {
        setStatus('INGESTING');
      }, 3500);

      const result = await ingestGitCodebase(gitUrl.trim(), gitBranch.trim() || null);
      if (ingestingTimer) clearTimeout(ingestingTimer);
      setSummary(result);
      setStatus('COMPLETED');
      onIngestionSuccess();
    } catch (err) {
      if (ingestingTimer) clearTimeout(ingestingTimer);
      console.error(err);
      setErrorMsg(err.message || 'Git repository ingestion failed.');
      setStatus('ERROR');
    }
  };

  const isBusy = status === 'UPLOADING' || status === 'CLONING' || status === 'INGESTING';

  return (
    <div className="ingestion-dashboard">
      <div className="ingestion-card">
        <div className="ingestion-header">
          <h2>Codebase Ingestion</h2>
          <p className="ingestion-subtitle">
            Index a Git repository or local ZIP archive for semantic RAG search
          </p>
        </div>

        {/* Ingestion Mode Switcher */}
        {status !== 'COMPLETED' && (
          <div className="ingest-mode-toggle">
            <button
              type="button"
              className={`mode-toggle-btn ${ingestMode === 'git' ? 'active' : ''}`}
              onClick={() => { setIngestMode('git'); setErrorMsg(''); }}
              disabled={isBusy}
            >
              <GitBranch size={16} />
              <span>Git Repository (Clone)</span>
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${ingestMode === 'zip' ? 'active' : ''}`}
              onClick={() => { setIngestMode('zip'); setErrorMsg(''); }}
              disabled={isBusy}
            >
              <UploadCloud size={16} />
              <span>ZIP Archive (Upload)</span>
            </button>
          </div>
        )}

        {/* GIT MODE */}
        {ingestMode === 'git' && status !== 'COMPLETED' && (
          <form className="git-ingest-form" onSubmit={startGitIngestion}>
            <div className="git-input-group">
              <label htmlFor="git-url-input">Repository HTTPS URL</label>
              <div className="git-input-wrapper">
                <Globe size={18} className="input-icon" />
                <input
                  id="git-url-input"
                  type="url"
                  placeholder="https://github.com/owner/repository.git"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  disabled={isBusy}
                  required
                />
              </div>
            </div>

            <div className="git-input-group">
              <label htmlFor="git-branch-input">Branch (Optional)</label>
              <div className="git-input-wrapper">
                <GitBranch size={18} className="input-icon" />
                <input
                  id="git-branch-input"
                  type="text"
                  placeholder="main (default)"
                  value={gitBranch}
                  onChange={(e) => setGitBranch(e.target.value)}
                  disabled={isBusy}
                />
              </div>
            </div>

            <div className="git-presets">
              <span className="preset-label">Quick sample:</span>
              <button
                type="button"
                className="preset-tag"
                disabled={isBusy}
                onClick={() => {
                  setGitUrl('https://github.com/spring-guides/gs-rest-service.git');
                  setGitBranch('main');
                }}
              >
                gs-rest-service
              </button>
            </div>

            <button
              type="submit"
              className="start-git-ingest-btn"
              disabled={isBusy || !gitUrl.trim()}
            >
              {isBusy ? (
                <>
                  <LoaderIcon className="spin" />
                  <span>Processing Repository...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Clone & Ingest Repository</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ZIP MODE */}
        {ingestMode === 'zip' && status !== 'COMPLETED' && (
          <>
            <div 
              className={`drag-drop-zone ${dragOver ? 'drag-over' : ''} ${isBusy ? 'disabled' : ''}`}
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
                disabled={isBusy}
              />
              
              <div className="zone-content">
                <UploadCloud size={40} className="upload-icon" />
                <h3>Drag & drop ZIP here</h3>
                <span>or</span>
                <button 
                  type="button" 
                  className="select-file-btn"
                  disabled={isBusy}
                >
                  Select ZIP
                </button>
                <p className="zone-limits">Supports codebase projects (.zip) up to {MAX_FILE_SIZE_MB}MB</p>
              </div>
            </div>

            {/* File Details / Status Display */}
            {file && (
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
                    onClick={startZipIngestion}
                    type="button"
                  >
                    <Play size={16} />
                    <span>Start Ingestion</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Processing State Notice */}
        {status === 'UPLOADING' && (
          <div className="processing-notice">
            <div className="spinner-glow"></div>
            <span>Uploading ZIP archive to codebase server...</span>
          </div>
        )}

        {status === 'CLONING' && (
          <div className="processing-notice">
            <div className="spinner-glow"></div>
            <span>Performing shallow Git clone into temp workspace...</span>
          </div>
        )}

        {status === 'INGESTING' && (
          <div className="processing-notice">
            <div className="spinner-glow"></div>
            <span>Scanning source code files, parsing chunks, and generating vector embeddings...</span>
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
              <button
                onClick={() => {
                  setStatus('IDLE');
                  setFile(null);
                  setSummary(null);
                }}
                className="ingest-another-btn"
                type="button"
              >
                Ingest Another Codebase
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
