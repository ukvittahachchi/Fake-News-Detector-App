import { useState, useEffect, useRef } from 'react';
import { FiSend, FiCopy, FiTrash2 } from 'react-icons/fi';

export default function TextInput({ onAnalyze, isLoading }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Fake News Detector
      </h1>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full min-h-[200px] p-4 border-2 border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all resize-none"
          placeholder="Paste news article text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {text && !isLoading && (
            <>
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => navigator.clipboard.writeText(text)}
                title="Copy text"
              >
                <FiCopy size={20} />
              </button>
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setText('')}
                title="Clear text"
              >
                <FiTrash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {text.length} characters • {text.split(/\s+/).filter(Boolean).length} words
        </span>
        <button
          onClick={() => onAnalyze(text)}
          disabled={!text || isLoading}
          className={`py-3 px-6 rounded-lg font-semibold text-white 
                     flex items-center justify-center space-x-2
                     ${(!text || isLoading) ? 'bg-gray-400 cursor-not-allowed' : 
                     'bg-blue-600 hover:bg-blue-700 transition-colors'}`}
        >
          {isLoading ? (
            <span className="animate-spin">🌀</span>
          ) : (
            <FiSend size={18} />
          )}
          <span>Analyze</span>
        </button>
      </div>
    </div>
  );
}