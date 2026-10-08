import { useState, useCallback } from 'react';
import { askQuestion } from '../services/api/askApi';

export function useAskQuestion() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAsked, setHasAsked] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [recentQuestions, setRecentQuestions] = useState([
    'Where is authentication implemented?',
    'How does Java file scanning work?',
    'Where is PostgreSQL configured?'
  ]);

  const ask = useCallback(async (customQuestion) => {
    const qToAsk = customQuestion !== undefined ? customQuestion : question;
    const trimmed = qToAsk ? qToAsk.trim() : '';

    if (!trimmed) {
      setError('Please enter a question.');
      return;
    }

    if (loading) return;

    setLoading(true);
    setError(null);
    setHasAsked(true);
    setCurrentQuestion(trimmed);
    setAnswer('');
    setSources([]);

    // Update recent questions history
    setRecentQuestions(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 8);
    });

    try {
      const data = await askQuestion(trimmed);
      setAnswer(data.answer || '');
      setSources(data.sources || []);
    } catch (err) {
      console.error("Error asking question:", err);
      setError(err.message || "Unable to get an answer. Please make sure the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }, [question, loading]);

  const reset = useCallback(() => {
    setQuestion('');
    setAnswer('');
    setSources([]);
    setError(null);
    setHasAsked(false);
    setCurrentQuestion('');
  }, []);

  return {
    question,
    setQuestion,
    answer,
    sources,
    loading,
    error,
    hasAsked,
    currentQuestion,
    recentQuestions,
    ask,
    reset
  };
}
