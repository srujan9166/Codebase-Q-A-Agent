import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import QnAPage from './pages/QnAPage';
import IngestionDashboard from './components/IngestionDashboard';
import { useAskQuestion } from './hooks/useAskQuestion';
import { checkIngestionStatus } from './services/api/askApi';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('qa');
  const [isIndexed, setIsIndexed] = useState(true);
  const qnaState = useAskQuestion();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await checkIngestionStatus();
        setIsIndexed(res.indexed);
        if (!res.indexed) {
          setActiveTab('ingest');
        }
      } catch (err) {
        console.error("Error checking ingestion status:", err);
      }
    };
    fetchStatus();
  }, []);

  const handleSelectQuestion = (qText) => {
    qnaState.setQuestion(qText);
    qnaState.ask(qText);
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isIndexed={isIndexed}
      onSelectQuestion={handleSelectQuestion}
      recentQuestions={qnaState.recentQuestions}
    >
      {activeTab === 'ingest' ? (
        <IngestionDashboard 
          onIngestionSuccess={() => setIsIndexed(true)} 
          onNavigateToQA={() => setActiveTab('qa')} 
        />
      ) : (
        <QnAPage qnaState={qnaState} />
      )}
    </MainLayout>
  );
}
