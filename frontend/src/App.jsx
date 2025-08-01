import { useState } from 'react';
import axios from 'axios';
import TextInput from './components/TextInput';
import Results from './components/Results';
import useAnalysisHistory from './hooks/useAnalysisHistory';
import { FiClock, FiX } from 'react-icons/fi';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [sampleText, setSampleText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { history, addToHistory, clearHistory } = useAnalysisHistory();

  const handleAnalyze = async (text) => {
    setIsLoading(true);
    setSampleText(text.substring(0, 100) + '...');
    try {
      const response = await axios.post('http://localhost:3001/api/analyze', {
        text,
        metadata: { 
          timestamp: new Date(),
          length: text.length
        }
      });
      const result = { 
        ...response.data, 
        sampleText: text.substring(0, 100) + '...',
        fullText: text
      };
      setResults(result);
      addToHistory(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(error.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
  };

  const loadFromHistory = (item) => {
    setResults(item);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto relative">
        {/* History Panel */}
        {showHistory && (
          <div className="absolute left-0 top-0 w-full md:w-96 bg-white shadow-xl rounded-lg z-10 border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Analysis History</h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {history.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {history.map((item) => (
                    <li key={item.id} className="hover:bg-gray-50">
                      <button
                        onClick={() => loadFromHistory(item)}
                        className="w-full text-left p-4"
                      >
                        <div className="flex justify-between items-start">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            item.score >= 70 ? 'bg-red-100 text-red-800' :
                            item.score >= 40 ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.verdict}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm line-clamp-2 text-gray-600">
                          {item.fullText.substring(0, 200)}...
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No analysis history yet
                </div>
              )}
            </div>
            {history.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All History
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className={`transition-all duration-200 ${showHistory ? 'md:ml-96' : ''}`}>
          {!results ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Fake News Detector</h1>
                {history.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <FiClock size={18} />
                    <span>View History ({history.length})</span>
                  </button>
                )}
              </div>
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

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <h3 className="text-center text-lg font-medium text-gray-900">
              Analyzing Article
            </h3>
            <p className="mt-2 text-center text-gray-600">
              Checking for {sampleText || 'your text'}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}