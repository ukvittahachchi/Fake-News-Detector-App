import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TextInput from './components/TextInput';
import Results from './components/Results';
import useAnalysisHistory from './hooks/useAnalysisHistory';
import { useBackendStatus } from './components/BackendStatus';
import { HistoryPanel } from './components/HistoryPanel';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Header } from './components/Header';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [sampleText, setSampleText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);
  const { history, addToHistory, clearHistory } = useAnalysisHistory();
  const abortControllerRef = useRef(null);
  const backendOnline = useBackendStatus();

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  const loadFromHistory = (item) => {
    setResults(item);
    setShowHistory(false);
    setError(null);
  };

  const handleAnalyze = async (text) => {
    if (!backendOnline) {
      setError('Backend service is unavailable. Please try again later.');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setSampleText(text.substring(0, 100) + '...');

    try {
      const response = await axios.post('http://localhost:3001/api/analyze', {
        text,
        metadata: { 
          timestamp: new Date().toISOString(),
          length: text.length
        }
      }, {
        signal: controller.signal,
        timeout: 15000
      });

      const result = { 
        ...response.data, 
        sampleText: text.substring(0, 100) + '...',
        fullText: text,
        date: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      if (!controller.signal.aborted) {
        setResults(result);
        addToHistory(result);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        return;
      }

      let errorMessage = 'Analysis failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The server may be busy.';
      } else if (error.response) {
        errorMessage = error.response.data?.error || 
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check:\n'
          + '- Is the backend running?\n'
          + '- Is your network connection working?\n'
          + '- Try refreshing the page';
      }

      setError(errorMessage);
      console.error('Analysis error:', error);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto relative">
        {/* History Panel */}
        {showHistory && (
          <HistoryPanel
            history={history}
            loadFromHistory={loadFromHistory}
            clearHistory={clearHistory}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* Main Content */}
        <div className={`transition-all duration-200 ${showHistory ? 'md:ml-96' : ''}`}>
          {!results ? (
            <>
              <Header
                hasHistory={history.length > 0}
                showHistory={showHistory}
                historyCount={history.length}
                onToggleHistory={() => setShowHistory(!showHistory)}
              />
              <ErrorDisplay error={error} />
              <TextInput 
                onAnalyze={handleAnalyze} 
                isLoading={isLoading} 
              />
            </>
          ) : (
            <Results 
              data={results} 
              onReset={handleReset} 
              onViewHistory={() => setShowHistory(true)}
            />
          )}
        </div>
      </div>

      <LoadingOverlay
        isLoading={isLoading}
        sampleText={sampleText}
        onCancel={() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          setIsLoading(false);
        }}
      />
    </div>
  );
}