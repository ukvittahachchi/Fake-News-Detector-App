import { useState, useEffect } from 'react';

export default function useAnalysisHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('analysisHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addToHistory = (result) => {
    const newHistory = [
      {
        ...result,
        id: Date.now(),
        date: new Date().toISOString()
      },
      ...history.slice(0, 9) // Keep only last 10
    ];
    setHistory(newHistory);
    localStorage.setItem('analysisHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('analysisHistory');
  };

  return { history, addToHistory, clearHistory };
}